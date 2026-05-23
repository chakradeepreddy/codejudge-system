import AppHeader from "@/app/components/layout/app-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type SubmissionRow = {
  user_id: string;
  problem_id: string;
  verdict: string;
  submitted_at: string;
};

type LeaderboardRow = {
  userId: string;
  acceptedCount: number;
  attemptedCount: number;
  accuracy: number;
  streak: number;
};

function computeDailyStreak(submittedAtList: string[]) {
  if (submittedAtList.length === 0) return 0;
  const dateSet = new Set(
    submittedAtList.map((submittedAt) => new Date(submittedAt).toISOString().slice(0, 10))
  );
  const uniqueDates = Array.from(dateSet).sort().reverse();
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dateText of uniqueDates) {
    const cursorText = cursor.toISOString().slice(0, 10);
    if (dateText === cursorText) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      if (dateText === cursor.toISOString().slice(0, 10)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("user_id,problem_id,verdict,submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(5000);

  if (error) {
    throw new Error(`Failed to load leaderboard: ${error.message}`);
  }

  const rows = (data ?? []) as SubmissionRow[];
  const grouped = new Map<string, SubmissionRow[]>();

  for (const row of rows) {
    const existing = grouped.get(row.user_id) ?? [];
    existing.push(row);
    grouped.set(row.user_id, existing);
  }

  const leaderboard: LeaderboardRow[] = Array.from(grouped.entries()).map(([userId, userRows]) => {
    const attempted = new Set(userRows.map((row) => row.problem_id));
    const accepted = new Set(
      userRows.filter((row) => row.verdict === "ACCEPTED").map((row) => row.problem_id)
    );

    return {
      userId,
      acceptedCount: accepted.size,
      attemptedCount: attempted.size,
      accuracy: attempted.size === 0 ? 0 : Math.round((accepted.size / attempted.size) * 100),
      streak: computeDailyStreak(userRows.map((row) => row.submitted_at)),
    };
  });

  leaderboard.sort((a, b) => {
    if (b.acceptedCount !== a.acceptedCount) return b.acceptedCount - a.acceptedCount;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return b.streak - a.streak;
  });

  const me = leaderboard.find((row) => row.userId === user.id);

  return (
    <div className="min-h-screen text-token-primary">
      <AppHeader subtitle="Leaderboard & Stats" userEmail={user.email} />
      <main className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <section className="panel">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-token-primary">Your Stats</h1>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-token bg-black/10 p-3">
              <p className="text-xs text-token-secondary">Accepted</p>
              <p className="text-xl font-semibold text-emerald-300">{me?.acceptedCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-token bg-black/10 p-3">
              <p className="text-xs text-token-secondary">Attempted</p>
              <p className="text-xl font-semibold text-token-primary">{me?.attemptedCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-token bg-black/10 p-3">
              <p className="text-xs text-token-secondary">Accuracy</p>
              <p className="text-xl font-semibold text-cyan-300">{me?.accuracy ?? 0}%</p>
            </div>
            <div className="rounded-lg border border-token bg-black/10 p-3">
              <p className="text-xs text-token-secondary">Current Streak</p>
              <p className="text-xl font-semibold text-amber-300">{me?.streak ?? 0} days</p>
            </div>
          </div>
        </section>

        <section className="panel mt-4">
          <div className="panel-header">
            <h2 className="text-lg font-semibold text-token-primary">Global Leaderboard</h2>
            <span className="text-xs text-token-secondary">{leaderboard.length} users</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-token text-token-secondary">
                  <th className="px-3 py-2">Rank</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Accepted</th>
                  <th className="px-3 py-2">Attempted</th>
                  <th className="px-3 py-2">Accuracy</th>
                  <th className="px-3 py-2">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.userId} className="border-b border-token/50">
                    <td className="px-3 py-2 text-token-primary">#{index + 1}</td>
                    <td className="px-3 py-2 text-token-secondary">
                      {row.userId === user.id ? "You" : `${row.userId.slice(0, 8)}...`}
                    </td>
                    <td className="px-3 py-2 text-emerald-300">{row.acceptedCount}</td>
                    <td className="px-3 py-2 text-token-primary">{row.attemptedCount}</td>
                    <td className="px-3 py-2 text-cyan-300">{row.accuracy}%</td>
                    <td className="px-3 py-2 text-amber-300">{row.streak} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

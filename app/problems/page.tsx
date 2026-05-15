import Link from "next/link";
import SignOutButton from "@/app/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ProblemRow = {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
};

const difficultyStyles: Record<ProblemRow["difficulty"], string> = {
  EASY: "text-emerald-300 bg-emerald-500/10 border-emerald-400/25",
  MEDIUM: "text-amber-300 bg-amber-500/10 border-amber-400/25",
  HARD: "text-rose-300 bg-rose-500/10 border-rose-400/25",
};

export default async function ProblemsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: problems, error } = await supabase
    .from("problems")
    .select("id,title,slug,difficulty,tags")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch problems: ${error.message}`);
  }

  const problemRows = (problems ?? []) as ProblemRow[];

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/10 text-sm font-semibold text-cyan-300">
              CJ
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-100">CodeJudge</p>
              <p className="text-xs text-slate-400">Problem Set</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-sm text-slate-400 sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <div className="panel">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-white">Coding Problems</h1>
            <span className="text-xs text-slate-400">
              {problemRows.length} published
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Difficulty</th>
                  <th className="px-3 py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {problemRows.map((problem) => (
                  <tr
                    key={problem.id}
                    className="rounded-lg border border-white/10 bg-slate-900/50 transition hover:bg-slate-900/80"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/problems/${problem.id}`}
                        className="font-medium text-slate-100 hover:text-cyan-300"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyStyles[problem.difficulty]}`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {problem.tags.length === 0 ? (
                          <span className="text-xs text-slate-500">No tags</span>
                        ) : (
                          problem.tags.map((tag) => (
                            <span
                              key={`${problem.id}-${tag}`}
                              className="rounded-md border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200"
                            >
                              {tag}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

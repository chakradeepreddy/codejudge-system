import Link from "next/link";
import AppHeader from "@/app/components/layout/app-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ProblemRow = {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  is_published: boolean;
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
    .select("id,title,slug,difficulty,tags,is_published")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch problems: ${error.message}`);
  }

  const problemRows = (problems ?? []) as ProblemRow[];

  return (
    <div className="min-h-screen text-token-primary">
      <AppHeader subtitle="Problem Set" userEmail={user.email} />

      <main className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <div className="panel">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-token-primary">Coding Problems</h1>
            <span className="text-xs text-token-secondary">{problemRows.length} total</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-token-secondary">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Difficulty</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {problemRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-sm text-token-secondary" colSpan={4}>
                      No problems found yet.
                      <pre className="mt-3 overflow-auto rounded-lg border border-token bg-black/10 p-3 text-xs text-token-secondary">{`insert into public.problems (slug, title, statement, difficulty, is_published, tags)
values (
  'two-sum',
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'EASY',
  true,
  '{array,hash-map}'
);`}</pre>
                    </td>
                  </tr>
                ) : null}
                {problemRows.map((problem) => (
                  <tr
                    key={problem.id}
                    className="rounded-lg border border-token bg-[var(--row-bg)] transition hover:bg-[var(--row-hover)]"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/problems/${problem.id}`}
                        className="font-medium text-token-primary hover:text-cyan-300"
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
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          problem.is_published
                            ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                        }`}
                      >
                        {problem.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {problem.tags.length === 0 ? (
                          <span className="text-xs text-token-secondary">No tags</span>
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

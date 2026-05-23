import Link from "next/link";
import AppHeader from "@/app/components/layout/app-header";
import { createClient } from "@/lib/supabase/server";
import { ensureSeedProblems } from "@/lib/seed-problems";
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

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams?: Promise<{ difficulty?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const difficultyFilter = resolvedSearchParams?.difficulty;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureSeedProblems(supabase);

  const { data: problems, error } = await supabase
    .from("problems")
    .select("id,title,slug,difficulty,tags,is_published")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch problems: ${error.message}`);
  }

  const problemRows = (problems ?? []) as ProblemRow[];
  const publishedRows = problemRows.filter((problem) => problem.is_published);
  const filteredRows = difficultyFilter
    ? publishedRows.filter((problem) => problem.difficulty === difficultyFilter)
    : publishedRows;

  return (
    <div className="min-h-screen text-token-primary">
      <AppHeader subtitle="Problem Set" userEmail={user.email} />

      <main className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <div className="panel">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-token-primary">Coding Problems</h1>
            <span className="text-xs text-token-secondary">
              {filteredRows.length} shown / {publishedRows.length} published
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/problems" className="rounded-md border border-token px-3 py-1.5 text-xs text-token-secondary hover:text-token-primary">All</Link>
            <Link href="/problems?difficulty=EASY" className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">Easy</Link>
            <Link href="/problems?difficulty=MEDIUM" className="rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">Medium</Link>
            <Link href="/problems?difficulty=HARD" className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">Hard</Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-token-secondary">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Difficulty</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Tags</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-sm text-token-secondary" colSpan={5}>
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
                {filteredRows.map((problem) => (
                  <tr
                    key={problem.id}
                    className="rounded-lg border border-token bg-[var(--row-bg)] transition hover:bg-[var(--row-hover)]"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/problems/${problem.slug}`}
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
                    <td className="px-3 py-3">
                      <Link
                        href={`/problems/${problem.slug}`}
                        className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200 hover:bg-cyan-500/20"
                      >
                        Solve
                      </Link>
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

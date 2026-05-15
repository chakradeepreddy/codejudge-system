import Link from "next/link";
import AppHeader from "@/app/components/layout/app-header";
import ProblemWorkspace from "@/app/components/problem-workspace";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Problem = {
  id: string;
  title: string;
  statement: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  constraints_text: string | null;
};

type ExampleCase = {
  id: string;
  input_data: string;
  expected_output: string;
};

const difficultyStyles: Record<Problem["difficulty"], string> = {
  EASY: "text-emerald-300 bg-emerald-500/10 border-emerald-400/25",
  MEDIUM: "text-amber-300 bg-amber-500/10 border-amber-400/25",
  HARD: "text-rose-300 bg-rose-500/10 border-rose-400/25",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: problem } = await supabase
    .from("problems")
    .select("id,title,statement,difficulty,tags,constraints_text")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!problem) {
    return (
      <div className="min-h-screen text-token-primary">
        <AppHeader subtitle="Practice Arena" userEmail={user.email} />
        <main className="mx-auto w-full max-w-[900px] p-6">
          <div className="panel space-y-3">
            <h1 className="text-xl font-semibold">No problems found</h1>
            <p className="text-token-secondary">
              Please go to the Problems page and create/seed at least one problem.
            </p>
            <Link
              href="/problems"
              className="inline-flex rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Go to Problems
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { data: examples } = await supabase
    .from("test_cases")
    .select("id,input_data,expected_output")
    .eq("problem_id", problem.id)
    .eq("is_hidden", false)
    .order("ordinal", { ascending: true })
    .limit(2);

  const problemData = problem as Problem;
  const exampleRows = (examples ?? []) as ExampleCase[];

  return (
    <div className="min-h-screen text-token-primary">
      <AppHeader subtitle="Practice Arena" userEmail={user.email} />

      <main className="mx-auto grid w-full max-w-[1600px] gap-4 p-4 sm:p-6 lg:h-[calc(100vh-4rem)] lg:grid-cols-5">
        <section className="panel overflow-auto lg:col-span-2">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-token-primary">{problemData.title}</h1>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyStyles[problemData.difficulty]}`}
            >
              {problemData.difficulty}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {problemData.tags.map((tag) => (
              <span
                key={`${problemData.id}-${tag}`}
                className="rounded-md border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 space-y-5 text-sm leading-7 text-token-secondary">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-token-primary">Statement</h2>
              <p className="whitespace-pre-wrap">{problemData.statement}</p>
            </div>

            {exampleRows.length > 0 ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-token-primary">Example</h2>
                <div className="space-y-2">
                  {exampleRows.map((example, index) => (
                    <pre
                      key={example.id}
                      className="overflow-auto rounded-lg border border-token bg-black/10 p-3 text-xs text-token-secondary"
                    >
{`Example ${index + 1}
Input:
${example.input_data}
Output:
${example.expected_output}`}
                    </pre>
                  ))}
                </div>
              </div>
            ) : null}

            {problemData.constraints_text ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-token-primary">Constraints</h2>
                <p className="whitespace-pre-wrap">{problemData.constraints_text}</p>
              </div>
            ) : null}

            <Link
              href={`/problems/${problemData.id}`}
              className="inline-flex rounded-md border border-token px-3 py-2 text-sm text-token-secondary transition hover:text-token-primary"
            >
              Open Full Problem Page
            </Link>
          </div>
        </section>

        <ProblemWorkspace problemId={problemData.id} />
      </main>
    </div>
  );
}

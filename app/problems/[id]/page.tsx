import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CodeEditor from "@/app/components/code-editor";
import SignOutButton from "@/app/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";

type Problem = {
  id: string;
  title: string;
  statement: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  constraints_text: string | null;
  sample_explanation: string | null;
};

type ExampleCase = {
  id: string;
  input_data: string;
  expected_output: string;
  ordinal: number;
};

const difficultyStyles: Record<Problem["difficulty"], string> = {
  EASY: "text-emerald-300 bg-emerald-500/10 border-emerald-400/25",
  MEDIUM: "text-amber-300 bg-amber-500/10 border-amber-400/25",
  HARD: "text-rose-300 bg-rose-500/10 border-rose-400/25",
};

export default async function ProblemDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("id,title,statement,difficulty,tags,constraints_text,sample_explanation")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (problemError || !problem) {
    notFound();
  }

  const { data: examples, error: examplesError } = await supabase
    .from("test_cases")
    .select("id,input_data,expected_output,ordinal")
    .eq("problem_id", id)
    .eq("is_hidden", false)
    .order("ordinal", { ascending: true })
    .limit(3);

  if (examplesError) {
    throw new Error(`Failed to fetch examples: ${examplesError.message}`);
  }

  const problemData = problem as Problem;
  const exampleRows = (examples ?? []) as ExampleCase[];

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/10 text-sm font-semibold text-cyan-300">
              CJ
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-100">
                CodeJudge
              </p>
              <p className="text-xs text-slate-400">Problem Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/problems"
              className="rounded-md border border-white/15 px-3 py-2 text-sm text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              Back to List
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] gap-4 p-4 sm:p-6 lg:h-[calc(100vh-4rem)] lg:grid-cols-5">
        <section className="panel overflow-auto lg:col-span-2">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-white">{problemData.title}</h1>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyStyles[problemData.difficulty]}`}
            >
              {problemData.difficulty}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {problemData.tags.length === 0 ? (
              <span className="text-xs text-slate-500">No tags</span>
            ) : (
              problemData.tags.map((tag) => (
                <span
                  key={`${problemData.id}-${tag}`}
                  className="rounded-md border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200"
                >
                  {tag}
                </span>
              ))
            )}
          </div>

          <div className="mt-5 space-y-5 text-sm leading-7 text-slate-300">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-100">Statement</h2>
              <p className="whitespace-pre-wrap">{problemData.statement}</p>
            </div>

            {exampleRows.length > 0 ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-100">Examples</h2>
                <div className="space-y-3">
                  {exampleRows.map((example, index) => (
                    <div
                      key={example.id}
                      className="rounded-lg border border-white/10 bg-slate-900/80 p-3"
                    >
                      <p className="mb-2 text-xs font-medium text-slate-400">
                        Example {index + 1}
                      </p>
                      <pre className="overflow-auto text-xs text-slate-300">
Input:
{example.input_data}

Output:
{example.expected_output}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {problemData.constraints_text ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-100">
                  Constraints
                </h2>
                <p className="whitespace-pre-wrap">{problemData.constraints_text}</p>
              </div>
            ) : null}

            {problemData.sample_explanation ? (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-100">
                  Explanation
                </h2>
                <p className="whitespace-pre-wrap">{problemData.sample_explanation}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel lg:col-span-3 lg:flex lg:min-h-0 lg:flex-col">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-slate-300">
                C++
              </span>
              <span className="hidden text-xs text-slate-500 sm:inline">main.cpp</span>
            </div>
            <button className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">
              Submit
            </button>
          </div>

          <div className="editor-shell mt-4 lg:min-h-0 lg:flex-1">
            <CodeEditor language="cpp" />
          </div>
        </section>
      </main>
    </div>
  );
}

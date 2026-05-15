import { notFound, redirect } from "next/navigation";
import AppHeader from "@/app/components/layout/app-header";
import ProblemWorkspace from "@/app/components/problem-workspace";
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
};

type SubmissionHistoryItem = {
  id: string;
  language: string;
  verdict: string;
  passed_test_cases: number;
  total_test_cases: number;
  runtime_ms: number | null;
  compile_output: string | null;
  error_output: string | null;
  source_code: string;
  submitted_at: string;
  problems: { title: string } | null;
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
    .single();

  if (problemError || !problem) {
    notFound();
  }

  const { data: examples } = await supabase
    .from("test_cases")
    .select("id,input_data,expected_output")
    .eq("problem_id", id)
    .eq("is_hidden", false)
    .order("ordinal", { ascending: true })
    .limit(3);

  const { data: initialHistory } = await supabase
    .from("submissions")
    .select(
      "id,language,verdict,passed_test_cases,total_test_cases,runtime_ms,compile_output,error_output,source_code,submitted_at,problems(title)"
    )
    .eq("user_id", user.id)
    .eq("problem_id", id)
    .order("submitted_at", { ascending: false })
    .limit(20);

  const p = problem as Problem;

  return (
    <div className="min-h-screen text-token-primary">
      <AppHeader subtitle="Problem Workspace" userEmail={user.email} />
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
        <ProblemWorkspace
          problemId={p.id}
          title={p.title}
          difficulty={p.difficulty}
          statement={p.statement}
          constraintsText={p.constraints_text}
          sampleExplanation={p.sample_explanation}
          tags={p.tags}
          examples={(examples ?? []) as ExampleCase[]}
          initialHistory={(initialHistory ?? []) as SubmissionHistoryItem[]}
        />
      </main>
    </div>
  );
}

import AppHeader from "@/app/components/layout/app-header";
import CodeEditor from "./components/code-editor";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen text-token-primary">
      <AppHeader
        subtitle="Practice Arena"
        userEmail={user.email}
        rightSlot={
          <button className="hidden rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 lg:inline-flex">
            Run Code
          </button>
        }
      />

      <main className="mx-auto grid w-full max-w-[1600px] gap-4 p-4 sm:p-6 lg:h-[calc(100vh-4rem)] lg:grid-cols-5">
        <section className="panel lg:col-span-2">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-token-primary">Two Sum</h1>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Easy
            </span>
          </div>
          <div className="mt-5 space-y-5 text-sm leading-7 text-token-secondary">
            <p>
              Given an array of integers <code>nums</code> and an integer{" "}
              <code>target</code>, return indices of the two numbers such that
              they add up to target.
            </p>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-token-primary">Example</h2>
              <pre className="rounded-lg border border-token bg-black/20 p-3 text-xs text-token-secondary">
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9
              </pre>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-token-primary">Constraints</h2>
              <ul className="space-y-1">
                <li>- 2 &lt;= nums.length &lt;= 10^4</li>
                <li>- -10^9 &lt;= nums[i] &lt;= 10^9</li>
                <li>- -10^9 &lt;= target &lt;= 10^9</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="panel lg:col-span-3 lg:flex lg:min-h-0 lg:flex-col">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-token bg-black/10 px-2 py-1 text-xs text-token-secondary">
                C++
              </span>
              <span className="hidden text-xs text-token-secondary sm:inline">main.cpp</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-token px-3 py-1.5 text-xs text-token-secondary transition hover:text-token-primary">
                Reset
              </button>
              <button className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">
                Submit
              </button>
            </div>
          </div>
          <div className="editor-shell mt-4 lg:min-h-0 lg:flex-1">
            <CodeEditor />
          </div>
          <div className="mt-4 rounded-lg border border-token bg-black/10 p-3 text-xs text-token-secondary">
            Console: Ready.
          </div>
        </section>
      </main>
    </div>
  );
}

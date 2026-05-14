export default function Home() {
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
              <p className="text-xs text-slate-400">Practice Arena</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-md border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Server: Healthy
            </span>
            <button className="rounded-md border border-white/15 px-3 py-2 text-sm text-slate-300 transition hover:border-white/30 hover:text-white">
              Sign In
            </button>
            <button className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Run Code
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] gap-4 p-4 sm:p-6 lg:h-[calc(100vh-4rem)] lg:grid-cols-5">
        <section className="panel lg:col-span-2">
          <div className="panel-header">
            <h1 className="text-lg font-semibold text-white">Two Sum</h1>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Easy
            </span>
          </div>
          <div className="mt-5 space-y-5 text-sm leading-7 text-slate-300">
            <p>
              Given an array of integers <code>nums</code> and an integer{" "}
              <code>target</code>, return indices of the two numbers such that
              they add up to target.
            </p>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                Example
              </h2>
              <pre className="rounded-lg border border-white/10 bg-slate-900/80 p-3 text-xs text-slate-300">
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9
              </pre>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                Constraints
              </h2>
              <ul className="space-y-1">
                <li>- 2 &lt;= nums.length &lt;= 10^4</li>
                <li>- -10^9 &lt;= nums[i] &lt;= 10^9</li>
                <li>- -10^9 &lt;= target &lt;= 10^9</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="panel lg:col-span-3">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-slate-300">
                TypeScript
              </span>
              <span className="hidden text-xs text-slate-500 sm:inline">
                main.ts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-slate-300 transition hover:border-white/30 hover:text-white">
                Reset
              </button>
              <button className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">
                Submit
              </button>
            </div>
          </div>
          <div className="editor-shell mt-4">
            <pre className="h-full overflow-auto p-4 text-sm leading-6 text-slate-200">
{`function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }

  return [];
}`}
            </pre>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/70 p-3 text-xs text-slate-300">
            Console: Ready. Monaco Editor integration comes in the next step.
          </div>
        </section>
      </main>
    </div>
  );
}

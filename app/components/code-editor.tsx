"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

type SupportedLanguage = "cpp" | "typescript";

type CodeEditorProps = {
  language?: SupportedLanguage;
};

const DEFAULT_CPP_CODE = `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;

    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (seen.count(need)) {
            return {seen[need], i};
        }
        seen[nums[i]] = i;
    }

    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    auto ans = twoSum(nums, target);

    if (ans.empty()) {
        cout << "No answer\\n";
    } else {
        cout << ans[0] << " " << ans[1] << "\\n";
    }
}
`;

const DEFAULT_TS_CODE = `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need)!, i];
    }
    seen.set(nums[i], i);
  }

  return [];
}
`;

const STARTER_CODE: Record<SupportedLanguage, string> = {
  cpp: DEFAULT_CPP_CODE,
  typescript: DEFAULT_TS_CODE,
};

export default function CodeEditor({ language = "cpp" }: CodeEditorProps) {
  const [code, setCode] = useState(STARTER_CODE[language]);

  const options = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      tabSize: 2,
      wordWrap: "on" as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 14, bottom: 14 },
    }),
    []
  );

  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value ?? "")}
      options={options}
      loading={
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Loading editor...
        </div>
      }
    />
  );
}

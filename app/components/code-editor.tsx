"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

type SupportedLanguage = "cpp" | "typescript";

type CodeEditorProps = {
  language?: SupportedLanguage;
  value?: string;
  onChange?: (nextCode: string) => void;
  initialCode?: string;
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
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;

    auto ans = twoSum(nums, target);

    if (ans.empty()) {
        cout << "-1 -1\\n";
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

function resolveTheme() {
  if (typeof document === "undefined") return "vs-dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "vs"
    : "vs-dark";
}

export function getStarterCode(language: SupportedLanguage = "cpp") {
  return STARTER_CODE[language];
}

export default function CodeEditor({
  language = "cpp",
  value,
  onChange,
  initialCode,
}: CodeEditorProps) {
  const [internalCode, setInternalCode] = useState(
    initialCode ?? STARTER_CODE[language]
  );
  const [monacoTheme, setMonacoTheme] = useState<"vs" | "vs-dark">(() =>
    resolveTheme()
  );

  useEffect(() => {
    function handleThemeChange() {
      setMonacoTheme(resolveTheme());
    }

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);


  const editorValue = value ?? internalCode;

  function handleCodeChange(next: string) {
    if (value === undefined) {
      setInternalCode(next);
    }
    onChange?.(next);
  }

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
      theme={monacoTheme}
      value={editorValue}
      onChange={(nextValue) => handleCodeChange(nextValue ?? "")}
      options={options}
      loading={
        <div className="flex h-full items-center justify-center text-sm text-token-secondary">
          Loading editor...
        </div>
      }
    />
  );
}

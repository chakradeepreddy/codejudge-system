"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

export type SupportedLanguage = "cpp" | "python" | "javascript" | "java";

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
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    auto ans = twoSum(nums, target);
    if (ans.empty()) cout << "-1 -1\\n";
    else cout << ans[0] << " " << ans[1] << "\\n";
}
`;

const DEFAULT_PY_CODE = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        need = target - n
        if need in seen:
            return [seen[need], i]
        seen[n] = i
    return []

if __name__ == "__main__":
    n = int(input().strip())
    nums = list(map(int, input().split()))
    target = int(input().strip())
    ans = two_sum(nums, target)
    if not ans:
        print("-1 -1")
    else:
        print(ans[0], ans[1])
`;

const DEFAULT_JS_CODE = `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}

const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let idx = 0;
const n = input[idx++];
const nums = input.slice(idx, idx + n);
idx += n;
const target = input[idx++];
const ans = twoSum(nums, target);
if (ans.length === 0) console.log("-1 -1");
else console.log(ans[0] + " " + ans[1]);
`;

const DEFAULT_JAVA_CODE = `import java.io.*;
import java.util.*;

public class Main {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[]{seen.get(need), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        String[] parts = br.readLine().trim().split("\\s+");
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = Integer.parseInt(br.readLine().trim());

        int[] ans = twoSum(nums, target);
        if (ans.length == 0) System.out.println("-1 -1");
        else System.out.println(ans[0] + " " + ans[1]);
    }
}
`;

const STARTER_CODE: Record<SupportedLanguage, string> = {
  cpp: DEFAULT_CPP_CODE,
  python: DEFAULT_PY_CODE,
  javascript: DEFAULT_JS_CODE,
  java: DEFAULT_JAVA_CODE,
};

const MONACO_LANGUAGE: Record<SupportedLanguage, string> = {
  cpp: "cpp",
  python: "python",
  javascript: "javascript",
  java: "java",
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
  const [internalCode, setInternalCode] = useState(initialCode ?? STARTER_CODE[language]);
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
      language={MONACO_LANGUAGE[language]}
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

"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

export type SupportedLanguage = "cpp" | "python" | "javascript" | "java";

type CodeEditorProps = {
  language?: SupportedLanguage;
  problemTitle?: string;
  value?: string;
  onChange?: (nextCode: string) => void;
  initialCode?: string;
};

const DEFAULT_CPP_CODE = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`;

const DEFAULT_PY_CODE = `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        
`;

const DEFAULT_JS_CODE = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`;

const DEFAULT_JAVA_CODE = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`;

const PROBLEM_SIGNATURES: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  "Two Sum": {
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        
`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
  },
  "Valid Parentheses": {
    cpp: `class Solution {
public:
    bool isValid(string s) {
        
    }
};`,
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        
`,
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    
};`,
    java: `class Solution {
    public boolean isValid(String s) {
        
    }
}`,
  },
  "Longest Substring Without Repeating Characters": {
    cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        
    }
};`,
    python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        
`,
    javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    
};`,
    java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        
    }
}`,
  },
  "Binary Search": {
    cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        
    }
};`,
    python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        
`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    
};`,
    java: `class Solution {
    public int search(int[] nums, int target) {
        
    }
}`,
  },
  "Best Time to Buy and Sell Stock": {
    cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        
    }
};`,
    python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        
`,
    javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    
};`,
    java: `class Solution {
    public int maxProfit(int[] prices) {
        
    }
}`,
  },
  "Maximum Subarray": {
    cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        
    }
};`,
    python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        
`,
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    
};`,
    java: `class Solution {
    public int maxSubArray(int[] nums) {
        
    }
}`,
  },
  "Product of Array Except Self": {
    cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        
    }
};`,
    python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        
`,
    javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
var productExceptSelf = function(nums) {
    
};`,
    java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        
    }
}`,
  },
};

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

export function getStarterCode(language: SupportedLanguage = "cpp", problemTitle?: string) {
  if (problemTitle && PROBLEM_SIGNATURES[problemTitle]?.[language]) {
    return PROBLEM_SIGNATURES[problemTitle][language]!;
  }
  return STARTER_CODE[language];
}

export default function CodeEditor({
  language = "cpp",
  problemTitle,
  value,
  onChange,
  initialCode,
}: CodeEditorProps) {
  const [internalCode, setInternalCode] = useState(
    initialCode ?? getStarterCode(language, problemTitle)
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

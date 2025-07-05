"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ language, value, onChange }) {
  function handleEditorChange(value, event) {
    onChange(value);
  }

  return (
    <Editor
      height="100%"
      width="100%"
      language={language}
      theme="vs-dark"
      value={value}
      onChange={handleEditorChange}
      loading={<Skeleton className="h-full w-full" />}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
      }}
    />
  );
}

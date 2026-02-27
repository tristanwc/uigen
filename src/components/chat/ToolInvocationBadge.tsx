"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";
import { basename } from "path";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getToolLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;

  // Get the command from args (works for both str_replace_editor and file_manager)
  const command = (args as Record<string, unknown>)?.command;
  const path = (args as Record<string, unknown>)?.path as string | undefined;

  // Extract filename from path (e.g., /components/Card.jsx -> Card.jsx)
  const filename = path ? basename(path) : null;

  // str_replace_editor tool
  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Reading ${filename}` : "Reading file";
      default:
        return toolName;
    }
  }

  // file_manager tool
  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return filename ? `Renaming ${filename}` : "Renaming file";
      case "delete":
        return filename ? `Deleting ${filename}` : "Deleting file";
      default:
        return toolName;
    }
  }

  // Fallback for unknown tools
  return toolName;
}

export function ToolInvocationBadge({
  toolInvocation,
}: ToolInvocationBadgeProps) {
  const label = getToolLabel(toolInvocation);
  const isDone = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}

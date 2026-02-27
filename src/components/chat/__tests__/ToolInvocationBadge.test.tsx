import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

test("str_replace_editor create shows 'Creating {filename}' with spinner", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      path: "/components/Card.jsx",
    },
    state: "call",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
  // Check for spinner (Loader2 icon)
  const spinnerElements = document.querySelectorAll(".animate-spin");
  expect(spinnerElements.length > 0).toBe(true);
  // Check that green dot is not present (in-progress state)
  const greenDot = document.querySelector(".bg-emerald-500");
  expect(greenDot).toBeNull();
});

test("str_replace_editor str_replace shows 'Editing {filename}' with green dot when done", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: {
      command: "str_replace",
      path: "/src/App.jsx",
    },
    state: "result",
    result: { success: true },
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
  // Check for green dot
  const greenDot = document.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
  // Check that spinner is not present (done state)
  const spinnerElements = document.querySelectorAll(".animate-spin");
  expect(spinnerElements.length === 0).toBe(true);
});

test("str_replace_editor view shows 'Reading {filename}'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: {
      command: "view",
      path: "/src/index.js",
    },
    state: "call",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Reading index.js")).toBeDefined();
});

test("str_replace_editor insert shows 'Editing {filename}'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: {
      command: "insert",
      path: "/src/utils.ts",
      insert_line: 10,
    },
    state: "call",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("file_manager rename shows 'Renaming {filename}'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "5",
    toolName: "file_manager",
    args: {
      command: "rename",
      path: "/components/Button.jsx",
      new_path: "/components/PrimaryButton.jsx",
    },
    state: "call",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Renaming Button.jsx")).toBeDefined();
});

test("file_manager delete shows 'Deleting {filename}'", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "6",
    toolName: "file_manager",
    args: {
      command: "delete",
      path: "/src/utils.ts",
    },
    state: "call",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Deleting utils.ts")).toBeDefined();
});

test("unknown tool shows raw toolName as fallback", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "7",
    toolName: "custom_tool",
    args: {},
    state: "call",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("custom_tool")).toBeDefined();
});

test("tool with no path shows generic label", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "8",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      // No path provided
    },
    state: "call",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating file")).toBeDefined();
});

test("tool invocation shows correct styling for in-progress state", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "9",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      path: "/components/Badge.jsx",
    },
    state: "call",
  };

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />,
  );

  // Check for the pill badge styling
  const badge = container.querySelector(
    ".bg-neutral-50.rounded-lg.border.border-neutral-200",
  );
  expect(badge).toBeDefined();

  // Check for spinner icon
  const spinner = badge?.querySelector(".animate-spin.text-blue-600");
  expect(spinner).toBeDefined();
});

test("tool invocation shows correct styling for done state", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "10",
    toolName: "str_replace_editor",
    args: {
      command: "create",
      path: "/components/Badge.jsx",
    },
    state: "result",
    result: "File created successfully",
  };

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />,
  );

  // Check for the pill badge styling
  const badge = container.querySelector(
    ".bg-neutral-50.rounded-lg.border.border-neutral-200",
  );
  expect(badge).toBeDefined();

  // Check for green dot
  const greenDot = badge?.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();

  // Check that spinner is not present
  const spinner = badge?.querySelector(".animate-spin");
  expect(spinner).toBeNull();
});

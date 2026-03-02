import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock child components to avoid complex dependencies
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock ResizablePanelGroup to avoid ResizeObserver dependency
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resizable-group">{children}</div>
  ),
  ResizablePanel: ({
    children,
    defaultSize,
  }: {
    children: React.ReactNode;
    defaultSize?: number;
  }) => <div style={{ width: `${defaultSize}%` }}>{children}</div>,
  ResizableHandle: () => <div data-testid="resize-handle" />,
}));

afterEach(() => {
  cleanup();
});

test("renders with Preview view active by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("Preview button is rendered", () => {
  render(<MainContent />);

  expect(screen.getByRole("button", { name: "Preview" })).toBeDefined();
});

test("Code button is rendered", () => {
  render(<MainContent />);

  expect(screen.getByRole("button", { name: "Code" })).toBeDefined();
});

test("clicking Code button switches to code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const codeButton = screen.getByRole("button", { name: "Code" });
  await user.click(codeButton);

  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("clicking Preview button switches back to preview view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Switch to Code view
  await user.click(screen.getByRole("button", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to Preview
  await user.click(screen.getByRole("button", { name: "Preview" }));

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("can toggle multiple times between views", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewButton = screen.getByRole("button", { name: "Preview" });
  const codeButton = screen.getByRole("button", { name: "Code" });

  // Start: Preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Toggle to Code
  await user.click(codeButton);
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  // Toggle back to Preview
  await user.click(previewButton);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Toggle to Code again
  await user.click(codeButton);
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

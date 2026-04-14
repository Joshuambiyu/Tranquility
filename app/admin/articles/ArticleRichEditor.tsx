"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useState } from "react";

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
};

function ToolbarButton({ label, onClick, isActive = false, disabled = false }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        isActive
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

const EMPTY_DOC = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

const TEXT_COLORS = [
  { label: "Slate", value: "#334155" },
  { label: "Emerald", value: "#047857" },
  { label: "Sky", value: "#0369a1" },
  { label: "Rose", value: "#be123c" },
  { label: "Amber", value: "#b45309" },
  { label: "Violet", value: "#6d28d9" },
];

export default function ArticleRichEditor() {
  const [contentJson, setContentJson] = useState(JSON.stringify(EMPTY_DOC));
  const [plainText, setPlainText] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
      }),
      Placeholder.configure({
        placeholder: "Write your article here. Use headings, lists, and emphasis for structure.",
      }),
    ],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[320px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400",
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      setContentJson(JSON.stringify(nextEditor.getJSON()));
      setPlainText(nextEditor.getText({ blockSeparator: "\n\n" }).trim());
    },
    onCreate: ({ editor: nextEditor }) => {
      setContentJson(JSON.stringify(nextEditor.getJSON()));
      setPlainText(nextEditor.getText({ blockSeparator: "\n\n" }).trim());
    },
  });

  if (!editor) {
    return (
      <section className="grid gap-2 text-sm text-slate-600">
        <p>Loading editor...</p>
        <input type="hidden" name="contentJson" value={JSON.stringify(EMPTY_DOC)} />
        <input type="hidden" name="content" value="" />
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      <label className="text-sm font-medium text-slate-700">Article content</label>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap gap-2">
          <ToolbarButton
            label="H1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
          />
          <ToolbarButton
            label="H2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
          />
          <ToolbarButton
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          />
          <ToolbarButton
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          />
          <ToolbarButton
            label="Strike"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
          />
          <ToolbarButton
            label="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          />
          <ToolbarButton
            label="Numbered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          />
          <ToolbarButton
            label="Quote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          />
          <ToolbarButton
            label="Code"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Text color</span>
          {TEXT_COLORS.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => editor.chain().focus().setColor(tone.value).run()}
              className="h-8 w-8 shrink-0 rounded-full border border-slate-300 ring-offset-2 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              style={{ backgroundColor: tone.value }}
              title={tone.label}
              aria-label={`Set text color ${tone.label}`}
            />
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear color
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />

      <p className="text-xs text-slate-500">
        Tip: highlight text and use keyboard shortcuts like Ctrl/Cmd + B for bold and Ctrl/Cmd + I for italic.
      </p>

      <input type="hidden" name="contentJson" value={contentJson} />
      <input type="hidden" name="content" value={plainText} />
    </section>
  );
}

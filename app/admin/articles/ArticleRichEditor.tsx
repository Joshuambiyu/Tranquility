"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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

export default function ArticleRichEditor() {
  const [contentJson, setContentJson] = useState(JSON.stringify(EMPTY_DOC));
  const [plainText, setPlainText] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
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

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
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

      <EditorContent editor={editor} />

      <p className="text-xs text-slate-500">
        Tip: highlight text and use keyboard shortcuts like Ctrl/Cmd + B for bold and Ctrl/Cmd + I for italic.
      </p>

      <input type="hidden" name="contentJson" value={contentJson} />
      <input type="hidden" name="content" value={plainText} />
    </section>
  );
}

"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useMemo, useState, type CSSProperties } from "react";
import CalloutNode from "@/app/admin/articles/extensions/CalloutNode";

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
      onPointerDown={(event) => {
        event.preventDefault();
        onClick();
      }}
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

type TiptapDocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapDocNode[];
  text?: string;
};

type TiptapDoc = {
  type: "doc";
  content: TiptapDocNode[];
};

const EMPTY_DOC: TiptapDoc = {
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

const DEFAULT_EDITOR_ACCENT = "#cbd5e1";

type SlashMenuRange = {
  from: number;
  to: number;
};

type SlashCommand = {
  id: string;
  label: string;
  aliases: string[];
  run: (editor: TiptapEditor) => boolean;
};

function resolveActiveTextColor(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return normalized;
}

function isTiptapDoc(value: unknown): value is TiptapDoc {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.type !== "doc") {
    return false;
  }

  return Array.isArray(candidate.content);
}

function toTiptapDoc(content: unknown): TiptapDoc {
  if (isTiptapDoc(content)) {
    return content;
  }

  if (Array.isArray(content)) {
    const paragraphs = content.filter((entry): entry is string => typeof entry === "string");

    if (paragraphs.length > 0) {
      return {
        type: "doc",
        content: paragraphs.map((paragraph) => ({
          type: "paragraph",
          content: paragraph.trim().length > 0 ? [{ type: "text", text: paragraph }] : [],
        })),
      };
    }
  }

  return EMPTY_DOC;
}

function getDraftFields(storageKey?: string) {
  if (!storageKey || typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { fields?: Record<string, string> };
    return parsed?.fields ?? null;
  } catch {
    return null;
  }
}

function getSlashMenuContext(editor: TiptapEditor) {
  const { state } = editor;
  const { selection } = state;

  if (!selection.empty) {
    return null;
  }

  const anchor = selection.$from;
  const parent = anchor.parent;

  if (!parent.isTextblock) {
    return null;
  }

  const textBeforeCursor = parent.textBetween(0, anchor.parentOffset, undefined, "\ufffc");
  const match = /(^|\s)\/([a-z0-9-]*)$/.exec(textBeforeCursor);

  if (!match) {
    return null;
  }

  const tokenStartInParent = match.index + match[1].length;
  const tokenEndInParent = anchor.parentOffset;

  return {
    range: {
      from: anchor.start() + tokenStartInParent,
      to: anchor.start() + tokenEndInParent,
    },
    query: match[2],
  };
}

export default function ArticleRichEditor({
  initialContent,
  draftStorageKey,
  restoreDraft,
}: {
  initialContent?: unknown;
  draftStorageKey?: string;
  restoreDraft?: boolean;
}) {
  const startingContent = toTiptapDoc(initialContent);

  const [contentJson, setContentJson] = useState(JSON.stringify(startingContent));
  const [plainText, setPlainText] = useState("");
  const [activeTextColor, setActiveTextColor] = useState<string | null>(null);
  const [slashMenuRange, setSlashMenuRange] = useState<SlashMenuRange | null>(null);
  const [slashMenuQuery, setSlashMenuQuery] = useState("");
  const [activeMarks, setActiveMarks] = useState({
    heading1: false,
    heading2: false,
    bold: false,
    italic: false,
    strike: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    callout: false,
    codeBlock: false,
  });

  const slashCommands = useMemo<SlashCommand[]>(() => [
    {
      id: "h1",
      label: "Heading 1",
      aliases: ["h1", "heading1", "title"],
      run: (nextEditor) => nextEditor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: "h2",
      label: "Heading 2",
      aliases: ["h2", "heading2", "subtitle"],
      run: (nextEditor) => nextEditor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: "bullet",
      label: "Bullet List",
      aliases: ["bullet", "ul", "list"],
      run: (nextEditor) =>
        nextEditor.chain().focus().toggleBulletList().run() ||
        nextEditor.chain().focus().setParagraph().toggleBulletList().run(),
    },
    {
      id: "numbered",
      label: "Numbered List",
      aliases: ["numbered", "ordered", "ol", "num"],
      run: (nextEditor) =>
        nextEditor.chain().focus().toggleOrderedList().run() ||
        nextEditor.chain().focus().setParagraph().toggleOrderedList().run(),
    },
    {
      id: "quote",
      label: "Quote",
      aliases: ["quote", "blockquote"],
      run: (nextEditor) =>
        nextEditor.chain().focus().toggleBlockquote().run() ||
        nextEditor.chain().focus().clearNodes().toggleBlockquote().run(),
    },
    {
      id: "callout",
      label: "Callout",
      aliases: ["callout", "note", "info"],
      run: (nextEditor) => nextEditor.chain().focus().toggleCallout().run(),
    },
    {
      id: "code",
      label: "Code Block",
      aliases: ["code", "codeblock"],
      run: (nextEditor) => nextEditor.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: "divider",
      label: "Divider",
      aliases: ["divider", "hr", "line"],
      run: (nextEditor) => nextEditor.chain().focus().setHorizontalRule().run(),
    },
  ], []);

  const filteredSlashCommands = useMemo(() => {
    const query = slashMenuQuery.trim().toLowerCase();

    if (!query) {
      return slashCommands;
    }

    return slashCommands.filter((command) => {
      if (command.label.toLowerCase().includes(query)) {
        return true;
      }

      return command.aliases.some((alias) => alias.includes(query));
    });
  }, [slashCommands, slashMenuQuery]);

  const syncSlashMenu = (nextEditor: TiptapEditor) => {
    const context = getSlashMenuContext(nextEditor);

    if (!context) {
      setSlashMenuRange(null);
      setSlashMenuQuery("");
      return;
    }

    setSlashMenuRange(context.range);
    setSlashMenuQuery(context.query);
  };

  const applySlashCommand = (command: SlashCommand) => {
    if (!editor || !slashMenuRange) {
      return;
    }

    editor.chain().focus().deleteRange(slashMenuRange).run();
    const didApply = command.run(editor);

    if (didApply) {
      syncToolbarState(editor);
    }

    setSlashMenuRange(null);
    setSlashMenuQuery("");
  };

  const syncToolbarState = (nextEditor: TiptapEditor) => {
    setActiveTextColor(resolveActiveTextColor(nextEditor.getAttributes("textStyle").color));
    setActiveMarks({
      heading1: nextEditor.isActive("heading", { level: 1 }),
      heading2: nextEditor.isActive("heading", { level: 2 }),
      bold: nextEditor.isActive("bold"),
      italic: nextEditor.isActive("italic"),
      strike: nextEditor.isActive("strike"),
      bulletList: nextEditor.isActive("bulletList"),
      orderedList: nextEditor.isActive("orderedList"),
      blockquote: nextEditor.isActive("blockquote"),
      callout: nextEditor.isActive("callout"),
      codeBlock: nextEditor.isActive("codeBlock"),
    });
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      CalloutNode,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
      }),
      Placeholder.configure({
        placeholder: "Write your article here. Use headings, lists, and emphasis for structure.",
      }),
    ],
    content: startingContent,
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[320px] text-slate-900 outline-none leading-7 [&_p]:my-3 [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-200 [&_blockquote]:bg-emerald-50/40 [&_blockquote]:px-3 [&_blockquote]:py-2 [&_[data-callout='true']]:my-3 [&_[data-callout='true']]:rounded-xl [&_[data-callout='true']]:border [&_[data-callout='true']]:border-amber-200 [&_[data-callout='true']]:bg-amber-50 [&_[data-callout='true']]:px-3 [&_[data-callout='true']]:py-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:px-4 [&_pre]:py-3 [&_pre]:text-sm [&_pre]:text-slate-100",
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      setContentJson(JSON.stringify(nextEditor.getJSON()));
      setPlainText(nextEditor.getText({ blockSeparator: "\n\n" }).trim());
      syncToolbarState(nextEditor);
      syncSlashMenu(nextEditor);
    },
    onCreate: ({ editor: nextEditor }) => {
      if (restoreDraft) {
        const draftFields = getDraftFields(draftStorageKey);
        const draftContentJson = draftFields?.contentJson;

        if (typeof draftContentJson === "string" && draftContentJson.trim().length > 0) {
          try {
            const parsedContent = JSON.parse(draftContentJson);

            if (isTiptapDoc(parsedContent)) {
              nextEditor.commands.setContent(parsedContent, { emitUpdate: false });
            }
          } catch {
            // Ignore invalid local draft payload and continue with provided initial content.
          }
        }
      }

      setContentJson(JSON.stringify(nextEditor.getJSON()));
      setPlainText(nextEditor.getText({ blockSeparator: "\n\n" }).trim());
      syncToolbarState(nextEditor);
      syncSlashMenu(nextEditor);
    },
    onSelectionUpdate: ({ editor: nextEditor }) => {
      syncToolbarState(nextEditor);
      syncSlashMenu(nextEditor);
    },
    onTransaction: ({ editor: nextEditor }) => {
      syncToolbarState(nextEditor);
      syncSlashMenu(nextEditor);
    },
  });

  const editorAccent = activeTextColor ?? DEFAULT_EDITOR_ACCENT;

  const handleToggleBulletList = () => {
    const currentEditor = editor;
    if (!currentEditor) {
      return;
    }

    const didToggle =
      currentEditor.chain().focus().toggleBulletList().run() ||
      currentEditor.chain().focus().setParagraph().toggleBulletList().run();

    if (didToggle) {
      syncToolbarState(currentEditor);
    }
  };

  const handleToggleOrderedList = () => {
    const currentEditor = editor;
    if (!currentEditor) {
      return;
    }

    const didToggle =
      currentEditor.chain().focus().toggleOrderedList().run() ||
      currentEditor.chain().focus().setParagraph().toggleOrderedList().run();

    if (didToggle) {
      syncToolbarState(currentEditor);
    }
  };

  const handleToggleQuote = () => {
    const currentEditor = editor;
    if (!currentEditor) {
      return;
    }

    const didToggle =
      currentEditor.chain().focus().toggleBlockquote().run() ||
      currentEditor.chain().focus().clearNodes().toggleBlockquote().run();

    if (didToggle) {
      syncToolbarState(currentEditor);
    }
  };

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
            isActive={activeMarks.heading1}
          />
          <ToolbarButton
            label="H2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={activeMarks.heading2}
          />
          <ToolbarButton
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={activeMarks.bold}
          />
          <ToolbarButton
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={activeMarks.italic}
          />
          <ToolbarButton
            label="Strike"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={activeMarks.strike}
          />
          <ToolbarButton
            label="Bullet List"
            onClick={handleToggleBulletList}
            isActive={activeMarks.bulletList}
          />
          <ToolbarButton
            label="Numbered List"
            onClick={handleToggleOrderedList}
            isActive={activeMarks.orderedList}
          />
          <ToolbarButton
            label="Quote"
            onClick={handleToggleQuote}
            isActive={activeMarks.blockquote}
          />
          <ToolbarButton
            label="Callout"
            onClick={() => {
              const didToggle = editor.chain().focus().toggleCallout().run();
              if (didToggle) {
                syncToolbarState(editor);
              }
            }}
            isActive={activeMarks.callout}
          />
          <ToolbarButton
            label="Code"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={activeMarks.codeBlock}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Text color</span>
          {TEXT_COLORS.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => {
                const didApply = editor.chain().focus().setColor(tone.value).run();
                if (didApply) {
                  syncToolbarState(editor);
                }
              }}
              className="h-8 w-8 shrink-0 rounded-full border ring-offset-2 transition hover:scale-105 focus:outline-none"
              style={{
                backgroundColor: tone.value,
                borderColor:
                  activeTextColor === tone.value.toLowerCase() ? "#0f172a" : "#cbd5e1",
                boxShadow:
                  activeTextColor === tone.value.toLowerCase()
                    ? "0 0 0 2px rgba(15, 23, 42, 0.2)"
                    : undefined,
              }}
              title={tone.label}
              aria-label={`Set text color ${tone.label}`}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const didClear = editor.chain().focus().unsetColor().run();
              if (didClear) {
                syncToolbarState(editor);
              }
            }}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear color
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl border bg-white px-4 py-3 transition focus-within:ring-2"
        style={
          {
            borderColor: editorAccent,
            ["--tw-ring-color"]: `${editorAccent}55`,
          } as CSSProperties
        }
      >
        <EditorContent editor={editor} />
      </div>

      {slashMenuRange ? (
        <section className="grid gap-2 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-cyan-800">
            Slash commands {slashMenuQuery ? `(/${slashMenuQuery})` : "(/)"}
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredSlashCommands.length > 0 ? (
              filteredSlashCommands.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    applySlashCommand(command);
                  }}
                  className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
                >
                  {command.label}
                </button>
              ))
            ) : (
              <p className="text-xs text-cyan-800">No matching slash commands.</p>
            )}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-slate-500">
        Tip: type / to open block commands. You can also use Ctrl/Cmd + B for bold and Ctrl/Cmd + I for italic.
      </p>

      <input type="hidden" name="contentJson" value={contentJson} />
      <input type="hidden" name="content" value={plainText} />
    </section>
  );
}

"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import type { EditorView } from "prosemirror-view";
import { useState, type CSSProperties } from "react";
import CalloutNode from "@/app/admin/articles/extensions/CalloutNode";
import ResizableImage from "@/app/admin/articles/extensions/ResizableImage";

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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read image file."));
    };

    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

function sanitizeImageFileName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Article image";
  }

  return trimmed.replace(/\.[^.]+$/, "") || "Article image";
}

function insertImageAtSelection(view: EditorView, src: string, alt: string) {
  const imageNodeType = view.state.schema.nodes.image;

  if (!imageNodeType) {
    return false;
  }

  const imageNode = imageNodeType.create({
    src,
    alt,
    width: 100,
    maxHeight: 420,
  });

  const tr = view.state.tr.replaceSelectionWith(imageNode).scrollIntoView();
  view.dispatch(tr);
  return true;
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
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false);
  const [imageAltInput, setImageAltInput] = useState("");
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState("");
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [imagePanelError, setImagePanelError] = useState("");
  const [isEditorFocused, setIsEditorFocused] = useState(false);
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
      ResizableImage.configure({
        allowBase64: true,
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
          "max-w-none min-h-[320px] text-slate-900 outline-none leading-7 [&_p]:my-3 [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-200 [&_blockquote]:bg-emerald-50/40 [&_blockquote]:px-3 [&_blockquote]:py-2 [&_[data-callout='true']]:my-3 [&_[data-callout='true']]:rounded-xl [&_[data-callout='true']]:border [&_[data-callout='true']]:border-amber-200 [&_[data-callout='true']]:bg-amber-50 [&_[data-callout='true']]:px-3 [&_[data-callout='true']]:py-2 [&_img]:my-3 [&_img]:mx-auto [&_img]:max-h-[900px] [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 [&_img]:object-contain [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:px-4 [&_pre]:py-3 [&_pre]:text-sm [&_pre]:text-slate-100",
      },
      handlePaste: (view, event) => {
        const imageFile = Array.from(event.clipboardData?.files ?? []).find((file) => file.type.startsWith("image/"));

        if (!imageFile) {
          return false;
        }

        const maxUploadBytes = 5 * 1024 * 1024;
        if (imageFile.size > maxUploadBytes) {
          setImagePanelError("Pasted image must be 5MB or less.");
          return true;
        }

        void readFileAsDataUrl(imageFile)
          .then((dataUrl) => {
            const didInsert = insertImageAtSelection(view, dataUrl, sanitizeImageFileName(imageFile.name));

            if (!didInsert) {
              setImagePanelError("Unable to insert pasted image.");
              return;
            }

            setImagePanelError("");
          })
          .catch(() => {
            setImagePanelError("Unable to read pasted image.");
          });

        return true;
      },
      handleDrop: (view, event) => {
        const imageFile = Array.from(event.dataTransfer?.files ?? []).find((file) => file.type.startsWith("image/"));

        if (!imageFile) {
          return false;
        }

        const maxUploadBytes = 5 * 1024 * 1024;
        if (imageFile.size > maxUploadBytes) {
          setImagePanelError("Dropped image must be 5MB or less.");
          return true;
        }

        void readFileAsDataUrl(imageFile)
          .then((dataUrl) => {
            const didInsert = insertImageAtSelection(view, dataUrl, sanitizeImageFileName(imageFile.name));

            if (!didInsert) {
              setImagePanelError("Unable to insert dropped image.");
              return;
            }

            setImagePanelError("");
          })
          .catch(() => {
            setImagePanelError("Unable to read dropped image.");
          });

        return true;
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      setContentJson(JSON.stringify(nextEditor.getJSON()));
      setPlainText(nextEditor.getText({ blockSeparator: "\n\n" }).trim());
      syncToolbarState(nextEditor);
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
    },
    onSelectionUpdate: ({ editor: nextEditor }) => {
      syncToolbarState(nextEditor);
    },
    onTransaction: ({ editor: nextEditor }) => {
      syncToolbarState(nextEditor);
    },
    onFocus: () => {
      setIsEditorFocused(true);
    },
    onBlur: () => {
      setIsEditorFocused(false);
    },
  });

  const editorAccent = activeTextColor ?? DEFAULT_EDITOR_ACCENT;
  const bottomToolbarVisibilityClass = isEditorFocused
    ? "opacity-100 pointer-events-auto translate-y-0"
    : "opacity-100 pointer-events-auto translate-y-0 sm:opacity-0 sm:pointer-events-none sm:translate-y-2";

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

  const handleInsertImage = () => {
    if (!editor) {
      return;
    }

    const imageSrc = uploadedImageDataUrl;

    if (!imageSrc) {
      setImagePanelError("Please upload an image file first.");
      return;
    }

    const alt = imageAltInput.trim() || "Article image";

    const didInsert = insertImageAtSelection(editor.view, imageSrc, alt);

    if (!didInsert) {
      setImagePanelError("Unable to insert image. Try again.");
      return;
    }

    setImagePanelError("");
    setImageAltInput("");
    setUploadedImageDataUrl("");
    setUploadedImageName("");
    setIsImagePanelOpen(false);
  };

  const openImagePanel = () => {
    setImagePanelError("");
    if (!isImagePanelOpen) {
      setUploadedImageDataUrl("");
      setUploadedImageName("");
      setImageAltInput("");
    }
    setIsImagePanelOpen((current) => !current);
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

  const applyHeading = (level: 1 | 2) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const applyCallout = () => {
    const didToggle = editor.chain().focus().toggleCallout().run();
    if (didToggle) {
      syncToolbarState(editor);
    }
  };

  return (
    <section className="grid gap-3">
      <label className="text-sm font-medium text-slate-700">Article content</label>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap gap-2">
          <ToolbarButton
            label="H1"
            onClick={() => applyHeading(1)}
            isActive={activeMarks.heading1}
          />
          <ToolbarButton
            label="H2"
            onClick={() => applyHeading(2)}
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
            onClick={applyCallout}
            isActive={activeMarks.callout}
          />
          <ToolbarButton
            label="Code"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={activeMarks.codeBlock}
          />
          <ToolbarButton
            label="Image"
            onClick={openImagePanel}
          />
        </div>

        {isImagePanelOpen ? (
          <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Insert image</p>
            <label className="grid gap-1 text-xs font-medium text-slate-700">
              Upload image file
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.currentTarget.files?.[0] ?? null;

                  if (!file) {
                    setUploadedImageDataUrl("");
                    setUploadedImageName("");
                    return;
                  }

                  if (!file.type.startsWith("image/")) {
                    setUploadedImageDataUrl("");
                    setUploadedImageName("");
                    setImagePanelError("Uploaded file must be an image.");
                    return;
                  }

                  const maxUploadBytes = 5 * 1024 * 1024;
                  if (file.size > maxUploadBytes) {
                    setUploadedImageDataUrl("");
                    setUploadedImageName("");
                    setImagePanelError("Uploaded image must be 5MB or less.");
                    return;
                  }

                  try {
                    const dataUrl = await readFileAsDataUrl(file);
                    setUploadedImageDataUrl(dataUrl);
                    setUploadedImageName(file.name);
                    setImagePanelError("");
                    if (!imageAltInput.trim()) {
                      setImageAltInput(file.name.replace(/\.[^.]+$/, ""));
                    }
                  } catch {
                    setUploadedImageDataUrl("");
                    setUploadedImageName("");
                    setImagePanelError("Unable to read selected image file.");
                  }
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-1 file:font-semibold file:text-emerald-800"
              />
            </label>
            {uploadedImageName ? (
              <p className="text-xs text-slate-600">Selected file: {uploadedImageName}</p>
            ) : null}
            <label className="grid gap-1 text-xs font-medium text-slate-700">
              Alt text (optional)
              <input
                type="text"
                value={imageAltInput}
                onChange={(event) => setImageAltInput(event.target.value)}
                placeholder="Describe the image"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
            {imagePanelError ? <p className="text-xs text-rose-700">{imagePanelError}</p> : null}
            <p className="text-xs text-slate-500">
              After insertion, drag the image corner handle in the editor to resize. Aspect ratio stays locked automatically.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleInsertImage}
                className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
              >
                Insert image
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsImagePanelOpen(false);
                  setImagePanelError("");
                  setUploadedImageDataUrl("");
                  setUploadedImageName("");
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

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

      <div
        className={`sticky bottom-3 z-20 flex items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur transition-all duration-200 ${bottomToolbarVisibilityClass}`}
      >
        <button
          type="button"
          onClick={() => editor.commands.focus()}
          className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800"
          title="Quick formatting tools"
        >
          /
        </button>
        <ToolbarButton label="H1" onClick={() => applyHeading(1)} isActive={activeMarks.heading1} />
        <ToolbarButton label="H2" onClick={() => applyHeading(2)} isActive={activeMarks.heading2} />
        <ToolbarButton label="B" onClick={() => editor.chain().focus().toggleBold().run()} isActive={activeMarks.bold} />
        <ToolbarButton label="I" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={activeMarks.italic} />
        <ToolbarButton label="S" onClick={() => editor.chain().focus().toggleStrike().run()} isActive={activeMarks.strike} />
        <ToolbarButton label="• List" onClick={handleToggleBulletList} isActive={activeMarks.bulletList} />
        <ToolbarButton label="1. List" onClick={handleToggleOrderedList} isActive={activeMarks.orderedList} />
        <ToolbarButton label="Quote" onClick={handleToggleQuote} isActive={activeMarks.blockquote} />
        <ToolbarButton label="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={activeMarks.codeBlock} />
        <ToolbarButton label="Callout" onClick={applyCallout} isActive={activeMarks.callout} />
        <ToolbarButton label="Image" onClick={openImagePanel} />
      </div>

      <p className="text-xs text-slate-500">
        Tip: use Ctrl/Cmd + B for bold and Ctrl/Cmd + I for italic.
      </p>
      <p className="text-xs text-slate-500 sm:hidden">
        Mobile tip: use the bottom formatting bar to apply headings and text styles.
      </p>

      <input type="hidden" name="contentJson" value={contentJson} />
      <input type="hidden" name="content" value={plainText} />
    </section>
  );
}

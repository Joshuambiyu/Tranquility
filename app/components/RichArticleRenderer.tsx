import React from "react";

type JsonObject = Record<string, unknown>;

type TiptapNode = {
  type?: unknown;
  text?: unknown;
  attrs?: unknown;
  marks?: unknown;
  content?: unknown;
};

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTiptapDoc(value: unknown): value is { type: "doc"; content?: unknown[] } {
  return isJsonObject(value) && value.type === "doc" && (value.content === undefined || Array.isArray(value.content));
}

function sanitizeHref(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function sanitizeColor(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^rgb\([\d\s,.%]+\)$/.test(trimmed) || /^rgba\([\d\s,.%]+\)$/.test(trimmed)) {
    return trimmed;
  }

  if (/^hsl\([\d\s,.%]+\)$/.test(trimmed) || /^hsla\([\d\s,.%]+\)$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function sanitizeImageSrc(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("/") ||
    /^data:image\//i.test(trimmed)
  ) {
    return trimmed;
  }

  return null;
}

function sanitizeBoundedInteger(value: unknown, min: number, max: number) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  const rounded = Math.round(numeric);
  if (rounded < min || rounded > max) {
    return null;
  }

  return rounded;
}

function applyMarks(textNode: TiptapNode, key: string) {
  let output: React.ReactNode = typeof textNode.text === "string" ? textNode.text : "";
  const marks = Array.isArray(textNode.marks) ? textNode.marks : [];

  marks.forEach((mark, index) => {
    if (!isJsonObject(mark) || typeof mark.type !== "string") {
      return;
    }

    const markKey = `${key}-mark-${index}`;

    switch (mark.type) {
      case "bold":
        output = <strong key={markKey}>{output}</strong>;
        break;
      case "italic":
        output = <em key={markKey}>{output}</em>;
        break;
      case "strike":
        output = <s key={markKey}>{output}</s>;
        break;
      case "code":
        output = <code key={markKey} className="rounded bg-slate-100 px-1 py-0.5 text-sm">{output}</code>;
        break;
      case "textStyle": {
        const attrs = isJsonObject(mark.attrs) ? mark.attrs : null;
        const color = sanitizeColor(attrs?.color);

        if (!color) {
          break;
        }

        output = <span key={markKey} style={{ color }}>{output}</span>;
        break;
      }
      case "link": {
        const attrs = isJsonObject(mark.attrs) ? mark.attrs : null;
        const href = sanitizeHref(attrs?.href);

        if (!href) {
          break;
        }

        const isExternal = /^https?:\/\//i.test(href);
        output = (
          <a
            key={markKey}
            href={href}
            className="text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {output}
          </a>
        );
        break;
      }
      default:
        break;
    }
  });

  return output;
}

function renderInline(nodes: unknown, keyPrefix: string): React.ReactNode {
  if (!Array.isArray(nodes)) {
    return null;
  }

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (!isJsonObject(node)) {
      return null;
    }

    if (node.type === "text") {
      return <React.Fragment key={key}>{applyMarks(node as TiptapNode, key)}</React.Fragment>;
    }

    if (node.type === "hardBreak") {
      return <br key={key} />;
    }

    return <React.Fragment key={key}>{renderInline(node.content, key)}</React.Fragment>;
  });
}

function renderListItems(nodes: unknown, keyPrefix: string): React.ReactNode {
  if (!Array.isArray(nodes)) {
    return null;
  }

  return nodes.map((node, index) => {
    if (!isJsonObject(node) || node.type !== "listItem") {
      return null;
    }

    const key = `${keyPrefix}-item-${index}`;
    return <li key={key}>{renderInline(node.content, key)}</li>;
  });
}

function renderBlockNodes(nodes: unknown, keyPrefix: string): React.ReactNode {
  if (!Array.isArray(nodes)) {
    return null;
  }

  return nodes.map((node, index) => renderBlock(node, index, keyPrefix));
}

function renderBlock(node: unknown, index: number, keyPrefix = "block"): React.ReactNode {
  if (!isJsonObject(node) || typeof node.type !== "string") {
    return null;
  }

  const key = `${keyPrefix}-${index}`;

  switch (node.type) {
    case "heading": {
      const attrs = isJsonObject(node.attrs) ? node.attrs : null;
      const level = attrs?.level === 1 || attrs?.level === 2 || attrs?.level === 3 ? attrs.level : 2;
      const content = renderInline(node.content, key);

      if (level === 1) {
        return <h1 key={key} className="text-4xl font-semibold tracking-tight text-slate-950">{content}</h1>;
      }

      if (level === 2) {
        return <h2 key={key} className="text-3xl font-semibold text-slate-950">{content}</h2>;
      }

      return <h3 key={key} className="text-2xl font-semibold text-slate-950">{content}</h3>;
    }
    case "paragraph":
      return <p key={key} className="text-[1.06rem] leading-8 text-slate-900">{renderInline(node.content, key)}</p>;
    case "bulletList":
      return <ul key={key} className="ml-6 list-disc space-y-2 text-[1.03rem] leading-8 text-slate-900">{renderListItems(node.content, key)}</ul>;
    case "orderedList":
      return <ol key={key} className="ml-6 list-decimal space-y-2 text-[1.03rem] leading-8 text-slate-900">{renderListItems(node.content, key)}</ol>;
    case "listItem":
      return <li key={key}>{renderInline(node.content, key)}</li>;
    case "blockquote":
      return (
        <blockquote key={key} className="border-l-4 border-emerald-200 bg-emerald-50/40 px-4 py-3 text-[1.03rem] leading-8 text-slate-900">
          {renderInline(node.content, key)}
        </blockquote>
      );
    case "callout":
      return (
        <div key={key} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[1.03rem] leading-8 text-slate-900">
          {renderBlockNodes(node.content, `${key}-callout`) ?? renderInline(node.content, key)}
        </div>
      );
    case "horizontalRule":
      return <hr key={key} className="border-slate-200" />;
    case "codeBlock":
      return (
        <pre key={key} className="overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-sm text-slate-100">
          <code>{renderInline(node.content, key)}</code>
        </pre>
      );
    case "image": {
      const attrs = isJsonObject(node.attrs) ? node.attrs : null;
      const src = sanitizeImageSrc(attrs?.src);

      if (!src) {
        return null;
      }

      const alt = typeof attrs?.alt === "string" && attrs.alt.trim() ? attrs.alt : "Article image";
      const widthPercent = sanitizeBoundedInteger(attrs?.width, 20, 100);
      const maxHeight = sanitizeBoundedInteger(attrs?.maxHeight, 120, 900);

      return (
        <div key={key} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="mx-auto w-full object-contain"
            style={{
              maxHeight: `${maxHeight ?? 560}px`,
              width: `${widthPercent ?? 100}%`,
            }}
            loading="lazy"
          />
        </div>
      );
    }
    default:
      return <p key={key} className="text-[1.06rem] leading-8 text-slate-900">{renderInline(node.content, key)}</p>;
  }
}

export default function RichArticleRenderer({ content }: { content: unknown }) {
  if (!isTiptapDoc(content)) {
    return null;
  }

  const blocks = Array.isArray(content.content) ? content.content : [];
  return <div className="grid max-w-4xl gap-5">{blocks.map((block, index) => renderBlock(block, index, "root"))}</div>;
}

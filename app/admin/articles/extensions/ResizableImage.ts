import Image from "@tiptap/extension-image";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

const MIN_WIDTH_PERCENT = 20;
const MAX_WIDTH_PERCENT = 100;

function resolveWidthPercent(value: unknown) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return MAX_WIDTH_PERCENT;
  }

  return Math.max(MIN_WIDTH_PERCENT, Math.min(MAX_WIDTH_PERCENT, Math.round(numeric)));
}

function resolveMaxHeight(value: unknown) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 900;
  }

  return Math.max(120, Math.min(900, Math.round(numeric)));
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 100,
        parseHTML: (element) => {
          const value = Number(element.getAttribute("data-width"));
          return Number.isFinite(value) ? value : 100;
        },
        renderHTML: (attributes) => ({ "data-width": String(resolveWidthPercent(attributes.width)) }),
      },
      maxHeight: {
        default: 900,
        parseHTML: (element) => {
          const value = Number(element.getAttribute("data-max-height"));
          return Number.isFinite(value) ? value : 900;
        },
        renderHTML: (attributes) => ({ "data-max-height": String(resolveMaxHeight(attributes.maxHeight)) }),
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode: ProseMirrorNode = node;

      const dom = document.createElement("figure");
      dom.className = "relative my-3 flex justify-center";

      const image = document.createElement("img");
      image.draggable = false;
      image.className = "mx-auto block h-auto max-w-full rounded-xl border border-slate-200 object-contain";
      dom.append(image);

      const handle = document.createElement("button");
      handle.type = "button";
      handle.setAttribute("aria-label", "Resize image");
      handle.className =
        "absolute bottom-1 right-1 h-6 w-6 cursor-se-resize rounded-full border border-emerald-300 bg-white/95 text-emerald-700 shadow transition hover:bg-emerald-50";
      handle.textContent = "↘";
      dom.append(handle);

      const syncFromNode = (nextNode: ProseMirrorNode) => {
        const attrs = nextNode.attrs as Record<string, unknown>;
        image.src = typeof attrs.src === "string" ? attrs.src : "";
        image.alt = typeof attrs.alt === "string" && attrs.alt.trim().length > 0 ? attrs.alt : "Article image";
        image.style.width = `${resolveWidthPercent(attrs.width)}%`;
        image.style.maxHeight = `${resolveMaxHeight(attrs.maxHeight)}px`;
      };

      syncFromNode(currentNode);

      const onResizeStart = (event: PointerEvent) => {
        if (!editor.isEditable) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const editorElement = editor.view.dom as HTMLElement;
        const editorWidth = Math.max(editorElement.clientWidth, 1);
        const startX = event.clientX;
        const startWidth = resolveWidthPercent(currentNode.attrs.width);
        let draftWidth = startWidth;

        const onPointerMove = (moveEvent: PointerEvent) => {
          const deltaPx = moveEvent.clientX - startX;
          const deltaPercent = (deltaPx / editorWidth) * 100;
          draftWidth = Math.max(MIN_WIDTH_PERCENT, Math.min(MAX_WIDTH_PERCENT, startWidth + deltaPercent));
          image.style.width = `${Math.round(draftWidth)}%`;
        };

        const onPointerUp = () => {
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);

          const position = typeof getPos === "function" ? getPos() : null;
          if (typeof position !== "number") {
            return;
          }

          const roundedWidth = Math.round(draftWidth);
          const attrs = currentNode.attrs as Record<string, unknown>;
          const transaction = editor.view.state.tr.setNodeMarkup(position, undefined, {
            ...attrs,
            width: roundedWidth,
          });
          editor.view.dispatch(transaction);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
      };

      handle.addEventListener("pointerdown", onResizeStart);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }

          currentNode = updatedNode;
          syncFromNode(currentNode);
          return true;
        },
        destroy: () => {
          handle.removeEventListener("pointerdown", onResizeStart);
        },
      };
    };
  },
});

export default ResizableImage;

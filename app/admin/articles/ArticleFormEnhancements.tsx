"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PersistedFormState = {
  fields: Record<string, string>;
  savedAt: number;
};

const NON_DIRTY_FIELD_NAMES = new Set(["submitToken"]);

function safeParsePersistedState(raw: string | null): PersistedFormState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedFormState;

    if (!parsed || typeof parsed !== "object" || typeof parsed.savedAt !== "number") {
      return null;
    }

    if (!parsed.fields || typeof parsed.fields !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function captureFormState(form: HTMLFormElement) {
  const state: Record<string, string> = {};

  const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    "input[name], textarea[name], select[name]",
  );

  fields.forEach((field) => {
    if (!field.name || field.disabled) {
      return;
    }

    if (NON_DIRTY_FIELD_NAMES.has(field.name)) {
      return;
    }

    if (field instanceof HTMLInputElement) {
      if (field.type === "file") {
        return;
      }

      if (field.type === "checkbox") {
        state[field.name] = field.checked ? "true" : "false";
        return;
      }

      if (field.type === "radio") {
        if (field.checked) {
          state[field.name] = field.value;
        }
        return;
      }
    }

    state[field.name] = field.value;
  });

  return state;
}

function restoreFormState(form: HTMLFormElement, state: Record<string, string>) {
  const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    "input[name], textarea[name], select[name]",
  );

  fields.forEach((field) => {
    const nextValue = state[field.name];

    if (nextValue === undefined) {
      return;
    }

    if (field instanceof HTMLInputElement) {
      if (field.type === "file") {
        return;
      }

      if (field.type === "checkbox") {
        field.checked = nextValue === "true";
        field.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }

      if (field.type === "radio") {
        field.checked = field.value === nextValue;
        field.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }
    }

    field.value = nextValue;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function areStatesEqual(a: Record<string, string>, b: Record<string, string>) {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (let index = 0; index < aKeys.length; index += 1) {
    const key = aKeys[index];

    if (key !== bKeys[index]) {
      return false;
    }

    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export default function ArticleFormEnhancements({
  formId,
  storageKey,
  clearDraft,
  restoreDraft,
}: {
  formId: string;
  storageKey: string;
  clearDraft?: boolean;
  restoreDraft?: boolean;
}) {
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [wasRestored, setWasRestored] = useState(false);
  const initialStateRef = useRef<Record<string, string> | null>(null);
  const dirtyRef = useRef(false);
  const submittingRef = useRef(false);

  const statusLabel = useMemo(() => {
    if (lastSavedAt) {
      return `Draft autosaved locally at ${new Date(lastSavedAt).toLocaleTimeString()}.`;
    }

    if (wasRestored) {
      return "Recovered unsaved local draft.";
    }

    return "";
  }, [lastSavedAt, wasRestored]);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;

    if (!form) {
      return;
    }

    if (clearDraft) {
      localStorage.removeItem(storageKey);
    }

    const persisted = safeParsePersistedState(localStorage.getItem(storageKey));

    if (!clearDraft && restoreDraft && persisted) {
      restoreFormState(form, persisted.fields);
      setWasRestored(true);
      setLastSavedAt(persisted.savedAt);
    }

    initialStateRef.current = captureFormState(form);

    const updateDirtyState = () => {
      if (!initialStateRef.current) {
        return;
      }

      const current = captureFormState(form);
      dirtyRef.current = !areStatesEqual(initialStateRef.current, current);
    };

    const onFieldChange = () => {
      updateDirtyState();
    };

    const onSubmit = () => {
      submittingRef.current = true;
      dirtyRef.current = false;
    };

    form.addEventListener("input", onFieldChange);
    form.addEventListener("change", onFieldChange);
    form.addEventListener("submit", onSubmit);

    const autosaveInterval = window.setInterval(() => {
      if (!initialStateRef.current || submittingRef.current) {
        return;
      }

      const current = captureFormState(form);
      if (areStatesEqual(initialStateRef.current, current)) {
        return;
      }

      const payload: PersistedFormState = {
        fields: current,
        savedAt: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSavedAt(payload.savedAt);
      dirtyRef.current = true;
    }, 1500);

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current || submittingRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (!dirtyRef.current || submittingRef.current) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!link) {
        return;
      }

      if (link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }

      const shouldLeave = window.confirm("You have unsaved changes. Leave this page?");
      if (!shouldLeave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onDocumentClick, true);

    return () => {
      window.clearInterval(autosaveInterval);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onDocumentClick, true);
      form.removeEventListener("input", onFieldChange);
      form.removeEventListener("change", onFieldChange);
      form.removeEventListener("submit", onSubmit);
    };
  }, [clearDraft, formId, restoreDraft, storageKey]);

  if (!statusLabel) {
    return null;
  }

  return (
    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
      {statusLabel}
    </p>
  );
}

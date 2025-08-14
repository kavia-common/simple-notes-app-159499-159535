import { component$, type QRL } from "@builder.io/qwik";
import type { Note } from "~/lib/types";

export interface NoteEditorProps {
  note: Note | null;
  dirty: boolean;
  onChangeTitle$: QRL<(value: string) => void>;
  onChangeContent$: QRL<(value: string) => void>;
  onSave$: QRL<() => void>;
  status?: string;
}

// PUBLIC_INTERFACE
const NoteEditor = component$<NoteEditorProps>((props) => {
  /** Main note editor area for viewing and editing a single note. */
  if (!props.note) {
    return (
      <section class="editor empty" aria-label="Note editor">
        <div class="placeholder">
          Select a note from the list or create a new one.
        </div>
      </section>
    );
  }

  return (
    <section
      class="editor"
      aria-label="Note editor"
      onKeyDown$={(e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
          e.preventDefault();
          props.onSave$();
        }
      }}
    >
      <div class="editor-header">
        <input
          type="text"
          class="title-input"
          placeholder="Note title"
          value={props.note.title}
          onInput$={(e, el) => props.onChangeTitle$(el.value)}
          aria-label="Note title"
        />
        <div class="editor-actions">
          {props.dirty && <span class="dirty-indicator">Unsaved</span>}
          {props.status && !props.dirty && (
            <span class="status-indicator">{props.status}</span>
          )}
          <button class="btn btn-accent" onClick$={props.onSave$}>
            Save
          </button>
        </div>
      </div>
      <textarea
        class="content-textarea"
        placeholder="Start typing your note..."
        value={props.note.content}
        onInput$={(e, el) => props.onChangeContent$(el.value)}
        aria-label="Note content"
      />
      <div class="editor-footer">
        <span class="meta">
          Created: {new Date(props.note.createdAt).toLocaleString()}
        </span>
        <span class="meta">
          Last Updated: {new Date(props.note.updatedAt).toLocaleString()}
        </span>
      </div>
    </section>
  );
});

export default NoteEditor;

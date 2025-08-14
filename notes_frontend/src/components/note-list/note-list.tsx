import { component$, type QRL } from "@builder.io/qwik";
import type { Note } from "~/lib/types";

export interface NoteListProps {
  notes: Note[];
  selectedId?: string;
  filter: string;
  onSelect$: QRL<(id: string) => void>;
  onDelete$: QRL<(id: string) => void>;
  onCreate$: QRL<() => void>;
  onFilterChange$: QRL<(value: string) => void>;
}

// PUBLIC_INTERFACE
const NoteList = component$<NoteListProps>((props) => {
  /** Sidebar list of notes with search and actions. */
  return (
    <aside class="sidebar" aria-label="Notes list">
      <div class="sidebar-header">
        <input
          type="search"
          class="search-input"
          placeholder="Search notes…"
          value={props.filter}
          onInput$={(e, el) => props.onFilterChange$(el.value)}
          aria-label="Search notes"
        />
        <button class="btn btn-primary" onClick$={props.onCreate$}>
          + New
        </button>
      </div>

      <div class="list-container" role="list">
        {props.notes.length === 0 && (
          <div class="empty-state">
            No notes yet. Click "New" to create your first note.
          </div>
        )}

        {props.notes.map((note) => {
          const isSelected = note.id === props.selectedId;
          return (
            <div
              key={note.id}
              class={{
                "note-list-item": true,
                selected: isSelected,
              }}
              role="listitem"
              onClick$={() => props.onSelect$(note.id)}
            >
              <div class="note-row">
                <div class="note-title" title={note.title || "Untitled"}>
                  {note.title || "Untitled"}
                </div>
                <button
                  class="icon-btn"
                  title="Delete note"
                  aria-label={`Delete note ${note.title || "Untitled"}`}
                  onClick$={(e) => {
                    e.stopPropagation();
                    props.onDelete$(note.id);
                  }}
                >
                  🗑
                </button>
              </div>
              <div class="note-snippet" title={note.content}>
                {note.content ? note.content.slice(0, 80) : "No content"}
              </div>
              <div class="note-meta">
                {new Date(note.updatedAt).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
});

export default NoteList;

import { component$, useStore, $, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import type { Note } from "~/lib/types";
import { loadNotes, saveNotes } from "~/lib/storage";
import NoteList from "~/components/note-list/note-list";
import NoteEditor from "~/components/note-editor/note-editor";

// PUBLIC_INTERFACE
export default component$(() => {
  const state = useStore<{
    notes: Note[];
    selectedId: string | null;
    filter: string;
    draft: Note | null;
    dirty: boolean;
    status: string;
  }>({
    notes: [],
    selectedId: null,
    filter: "",
    draft: null,
    dirty: false,
    status: "",
  });

  useVisibleTask$(() => {
    // Initialize notes from localStorage on client
    const initial = loadNotes()
      .slice()
      // Sort by updatedAt desc
      .sort((a, b) => b.updatedAt - a.updatedAt);
    state.notes = initial;
    if (initial.length > 0) {
      state.selectedId = initial[0].id;
      state.draft = { ...initial[0] };
    }
  });

  const persist$ = $(() => {
    saveNotes(state.notes);
  });

  const generateId = $(() => {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    ).toUpperCase();
  });

  const handleCreate$ = $(async () => {
    const now = Date.now();
    const newNote: Note = {
      id: await generateId(),
      title: "Untitled",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    state.notes = [newNote, ...state.notes];
    state.selectedId = newNote.id;
    state.draft = { ...newNote };
    state.dirty = false;
    state.status = "Created";
    persist$();
  });

  const handleSelect$ = $((id: string) => {
    if (state.dirty) {
      // Discard unsaved changes on navigation
      // Minimal UX - can be enhanced to prompt in future
    }
    state.selectedId = id;
    const found = state.notes.find((n) => n.id === id) || null;
    state.draft = found ? { ...found } : null;
    state.dirty = false;
    state.status = "";
  });

  const handleDelete$ = $((id: string) => {
    if (typeof confirm !== "undefined") {
      const ok = confirm("Delete this note?");
      if (!ok) return;
    }
    const idx = state.notes.findIndex((n) => n.id === id);
    if (idx >= 0) {
      const updated = state.notes.slice();
      updated.splice(idx, 1);
      state.notes = updated;
    }
    if (state.selectedId === id) {
      if (state.notes.length > 0) {
        state.selectedId = state.notes[0].id;
        state.draft = { ...state.notes[0] };
      } else {
        state.selectedId = null;
        state.draft = null;
      }
      state.dirty = false;
    }
    state.status = "Deleted";
    persist$();
  });

  const handleFilterChange$ = $((value: string) => {
    state.filter = value;
  });

  const handleChangeTitle$ = $((value: string) => {
    if (!state.draft) return;
    state.draft.title = value;
    state.dirty = true;
    state.status = "";
  });

  const handleChangeContent$ = $((value: string) => {
    if (!state.draft) return;
    state.draft.content = value;
    state.dirty = true;
    state.status = "";
  });

  const handleSave$ = $(() => {
    if (!state.draft) return;
    const idx = state.notes.findIndex((n) => n.id === state.draft!.id);
    const now = Date.now();
    const updatedNote: Note = { ...state.draft, updatedAt: now };
    if (idx >= 0) {
      const next = state.notes.slice();
      next[idx] = updatedNote;
      // Sort so most recently updated is on top
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      state.notes = next;
      state.selectedId = updatedNote.id;
    } else {
      state.notes = [updatedNote, ...state.notes];
      state.selectedId = updatedNote.id;
    }
    state.draft = { ...updatedNote };
    state.dirty = false;
    state.status = "Saved";
    persist$();
  });

  const filteredNotes =
    state.filter.trim().length === 0
      ? state.notes
      : state.notes.filter((n) => {
          const q = state.filter.toLowerCase();
          return (
            (n.title || "").toLowerCase().includes(q) ||
            (n.content || "").toLowerCase().includes(q)
          );
        });

  return (
    <div class="app-shell">
      <NoteList
        notes={filteredNotes}
        selectedId={state.selectedId || undefined}
        filter={state.filter}
        onSelect$={handleSelect$}
        onDelete$={handleDelete$}
        onCreate$={handleCreate$}
        onFilterChange$={handleFilterChange$}
      />
      <NoteEditor
        note={state.draft}
        dirty={state.dirty}
        onChangeTitle$={handleChangeTitle$}
        onChangeContent$={handleChangeContent$}
        onSave$={handleSave$}
        status={state.status}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Simple Notes",
  meta: [
    {
      name: "description",
      content:
        "A minimalistic notes app built with Qwik: create, edit, delete, and search notes.",
    },
  ],
};

import type { InterlandNote } from "../../_types"

// TODO: Remove mock when API is ready
export async function addInterlandNote(
  notes: InterlandNote[],
  payload: Omit<InterlandNote, "id" | "createdAt">,
): Promise<InterlandNote[]> {
  return [
    {
      ...payload,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    ...notes,
  ]
}

// TODO: Remove mock when API is ready
export async function deleteInterlandNote(notes: InterlandNote[], id: string): Promise<InterlandNote[]> {
  return notes.filter((item) => item.id !== id)
}

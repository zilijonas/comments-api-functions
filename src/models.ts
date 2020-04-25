export interface Note {
  content: string;
  lastEdited: string;
}

export interface NoteResponse extends Note {
  id: string;
}

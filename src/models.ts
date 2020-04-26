export interface Note {
  content: string;
  lastEdited: string;
  editable: boolean;
}

export interface NoteResponse extends Note {
  id: string;
}

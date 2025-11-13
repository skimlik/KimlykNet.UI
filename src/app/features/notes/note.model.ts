export interface NoteBase {
  title: string;
  text: string;
  isPublic: boolean;
}

export interface Note extends NoteBase {
  noteId: string;
  createdDate: Date;
  modifiedDate: Date;
}

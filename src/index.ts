import { https } from "firebase-functions";
import { initializeApp, database } from "firebase-admin";
import { NoteResponse, Note } from "./models";

initializeApp();

const notesDb = database().ref("/notes");

const noteToResponse = (key: string | null, comment: Note): NoteResponse => ({
  id: key ?? "",
  content: comment.content,
  lastEdited: comment.lastEdited,
});

export const addNote = https.onRequest(async (req, res) => {
  const { content, lastEdited } = req.query;
  const addNoteSnapshot = notesDb.push({ content, lastEdited });
  await addNoteSnapshot
    .once("value")
    .then((snapshot) => res.status(200).send({ id: snapshot.key, ...snapshot.val() } as NoteResponse))
    .catch((error) => res.status(400).send({ error }));
});

export const removeNote = https.onRequest(async (req, res) => {
  const { id } = req.query;
  await notesDb
    .child(`${id}`)
    .remove()
    .then(() => res.status(200).send({ id }))
    .catch((error) => res.status(400).send({ error, id }));
});

export const getNotes = https.onRequest(async (req, res) => {
  await notesDb
    .orderByChild(`lastEdited`)
    .once("value")
    .then((snapshot) => {
      const notes: NoteResponse[] = [];
      snapshot.forEach((child) => {
        notes.unshift(noteToResponse(child.key, child.val()));
      });
      res.status(200).send({ notes });
    })
    .catch((error) => res.status(400).send({ error }));
});

export const getNote = https.onRequest(async (req, res) => {
  const { id } = req.query;
  await notesDb
    .child(`${id}`)
    .once("value")
    .then((snapshot) => res.status(200).send(snapshot.val() as NoteResponse))
    .catch((error) => res.status(400).send({ error }));
});

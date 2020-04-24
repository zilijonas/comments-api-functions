import { https } from "firebase-functions";
import { initializeApp, database } from "firebase-admin";
import { CommentsList, CommentResponse } from "./models";

initializeApp();

const commentsDB = database().ref("/comments");

const commentsFromSnapshot = (comments: database.DataSnapshot): CommentResponse[] =>
  Object.entries(comments.toJSON() as CommentsList).map(
    (e): CommentResponse => ({
      id: e[0],
      author: e[1].author,
      content: e[1].content,
      createdAt: e[1].createdAt,
    })
  );

export const addComment = https.onRequest(async (req, res) => {
  const { author, content, createdAt } = req.query;
  const addCommentSnapshot = await commentsDB.push({ author, content, createdAt });
  await addCommentSnapshot
    .once("value")
    .then((snapshot) => res.status(200).send({ id: snapshot.key, ...snapshot.val() } as CommentResponse))
    .catch((error) => res.status(400).send({ error }));
});

export const removeComment = https.onRequest(async (req, res) => {
  const { id } = req.query;
  await commentsDB
    .child(`${id}`)
    .remove()
    .then(() => res.status(200).send({ id }))
    .catch((error) => res.status(400).send({ error, id }));
});

export const getComments = https.onRequest(async (req, res) => {
  await commentsDB
    .once("value")
    .then((snapshot) => res.status(200).send({ comments: commentsFromSnapshot(snapshot) }))
    .catch((error) => res.status(400).send({ error }));
});

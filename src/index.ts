import { https } from "firebase-functions";
import { initializeApp, database } from "firebase-admin";
import { CommentResponse, Comment } from "./models";

initializeApp();

const commentsDB = database().ref("/comments");

const commentToResponse = (key: string | null, comment: Comment): CommentResponse => ({
  id: key ?? "",
  author: comment.author,
  content: comment.content,
  createdAt: comment.createdAt,
});

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
  const { orderByChild, direction } = req.query;
  await commentsDB
    .orderByChild(`${orderByChild}`)
    .once("value")
    .then((snapshot) => {
      const comments: CommentResponse[] = [];
      snapshot.forEach((child) => {
        const comment = child.val();
        comments.push(commentToResponse(child.key, comment));
      });
      if (direction === "desc") {
        comments.reverse();
      }
      res.status(200).send({ comments });
    })
    .catch((error) => res.status(400).send({ error }));
});

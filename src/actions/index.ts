import { db, Comment, eq, CommentReply } from "astro:db";
import { defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import { addComment } from "./comments";

export const commentResponse = {
  Comment: {
    id: Comment.id,
    author: Comment.author,
    body: Comment.body,
    createdAt: Comment.createdAt,
    updatedAt: Comment.updatedAt,
    postId: Comment.postId,
  },
  CommentReply: CommentReply,
};

export const server = {
  addComment,
  getComments: defineAction({
    input: z.number(),
    handler: async (postId) =>
      await db
        .select(commentResponse)
        .from(Comment)
        .where(eq(Comment.postId, postId))
        .leftJoin(CommentReply, eq(Comment.id, CommentReply.comment)),
  }),
};

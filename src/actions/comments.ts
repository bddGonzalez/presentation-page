import { db, Comment, CommentReply, eq } from "astro:db";
import { defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro/zod";

const input = z.object({
  author: z.string().max(20, "Name is too long"),
  body: z.string(),
  postId: z.string(),
  replyingTo: z.string().optional(),
});

export const addComment = defineAction({
  input,
  handler: async (input, ctx) => {
    await preventSpam(input, ctx);
    const updatedComments = await db
      .insert(Comment)
      .values({
        ...input,
        postId: +input.postId,
        authorsIp: ctx.clientAddress,
        createdAt: new Date(),
      })
      .returning();
    if (input.replyingTo && +input.replyingTo >= 0)
      await db.insert(CommentReply).values({
        originalCommentId: +input.replyingTo,
        comment: updatedComments[0].id,
      });
    return updatedComments;
  },
  accept: "form",
});

const preventSpam = async (
  _params: z.infer<typeof input>,
  ctx: ActionAPIContext
) => {
  const ip = ctx.clientAddress;
  if (!ip) throw new Error("Something went wrong: 1");
  const comments = await db
    .select()
    .from(Comment)
    .where(eq(Comment.authorsIp, ip));
  if (comments.length) {
    let commentsInLastHour = 0;
    for (const comment of comments) {
      if (+comment.createdAt - +new Date() < 3600000) commentsInLastHour++;
    }
    if (commentsInLastHour >= 10) throw new Error("Spamming D:");
  }
};

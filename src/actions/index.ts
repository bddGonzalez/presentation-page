import { db, Comment, eq, CommentReply } from "astro:db";
import { defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
// import * as jwt from "jsonwebtoken";
import pkg from "jsonwebtoken";
const { verify, TokenExpiredError, JsonWebTokenError } = pkg;

export const server = {
  addComment: defineAction({
    input: z.object({
      author: z.string().max(20, "Name is too long"),
      body: z.string(),
      postId: z.string(),
      replyingTo: z.string(),
    }),
    handler: async (input, ctx) => {
      const updatedComments = await db
        .insert(Comment)
        .values({ ...input, postId: +input.postId, createdAt: new Date() })
        .returning();
      if (input.replyingTo && +input.replyingTo >= 0)
        await db.insert(CommentReply).values({
          originalCommentId: +input.replyingTo,
          comment: updatedComments[0].id,
        });
      return updatedComments;
    },
    accept: "form",
  }),
  getComments: defineAction({
    input: z.number(),
    handler: async (postId) => {
      return db
        .select()
        .from(Comment)
        .where(eq(Comment.postId, postId))
        .leftJoin(CommentReply, eq(Comment.id, CommentReply.comment));
    },
  }),
  deleteComment: defineAction({
    input: z.number(),
    handler: async (commentId, ctx) => {
      const email = getMail(ctx);
      if (email !== import.meta.env.ROOT_USER_EMAIL)
        throw new Error("Something went wrong: 8");
      return db.delete(Comment).where(eq(Comment.id, commentId));
    },
  }),
  getCurrentUserMail: defineAction({
    handler: async (_, ctx): Promise<string> => {
      const email = getMail(ctx);
      return await email;
    },
  }),
};

export const getMail = async (ctx: ActionAPIContext): Promise<string> => {
  const rawToken = ctx.cookies.get("Authorization");
  console.log({ rawToken });
  if (!rawToken) throw new Error("Something went wrong: 1");
  const [bearer, token] = rawToken.value.split(" ");
  if (bearer !== "Bearer" || !token || !import.meta.env.JSONWEBTOKEN_SECRET)
    throw new Error("Something went wrong: 2");
  let payload;
  try {
    payload = verify(token, import.meta.env.JSONWEBTOKEN_SECRET!);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new Error("Something went wrong: 3");
    } else if (err instanceof JsonWebTokenError) {
      throw new Error("Something went wrong: 4");
    } else {
      throw new Error("Something went wrong: 5");
    }
  }
  if (!payload) throw new Error("Something went wrong: 6");
  const email = (payload as { email?: string })["email"];
  console.log({ email, payload });
  if (!email) throw new Error("Something went wrong: 7");
  return email;
};

/* 
// https://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
export function parseCookies(request: Request) {
  const list: { [key: string]: string } = {};
  const cookieHeader = request.headers?.get("Cookie");
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach(function (cookie: string) {
    let [name, ...rest] = cookie.split("=");
    name = name?.trim();
    if (!name) return;
    const value = rest.join("=").trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });
  return list;
}
 */

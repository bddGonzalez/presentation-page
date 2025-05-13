import { db, Comment, eq } from "astro:db";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
  addComment: defineAction({
    input: z.object({
      author: z.string().max(20, "Name is too long"),
      body: z.string(),
    }),
    handler: async (input, ctx) => {
      console.log(ctx.request);
      if (ctx.request.method !== "POST") return {};
      const updatedComments = await db
        .insert(Comment)
        .values({ ...input, createdAt: new Date() })
        .returning();
      return updatedComments;
    },
    accept: "form",
  }),
};

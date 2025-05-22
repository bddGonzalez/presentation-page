import { column, defineDb, defineTable } from "astro:db";

export const Post = defineTable({
  columns: {
    id: column.number({
      primaryKey: true,
      autoIncremental: true,
      unique: true,
    }),
    slug: column.text({ unique: true }),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ optional: true }),
  },
});

export const PostContent = defineTable({
  columns: {
    id: column.number({
      primaryKey: true,
      autoIncremental: true,
      unique: true,
    }),
    postId: column.number({ references: () => Post.columns.id }),
    lang: column.text(),
    title: column.text(),
    description: column.text(),
    content: column.text(),
  },
});

export const Comment = defineTable({
  columns: {
    id: column.number({
      primaryKey: true,
      autoIncremental: true,
      unique: true,
    }),
    authorsIp: column.text(),
    author: column.text(),
    body: column.text(),
    createdAt: column.date(),
    updatedAt: column.date({ optional: true }),
    postId: column.number({
      references: () => Post.columns.id,
      optional: true,
    }),
  },
});

export const CommentReply = {
  columns: {
    id: column.number({
      primaryKey: true,
      autoIncremental: true,
      unique: true,
    }),
    originalCommentId: column.number({
      references: () => Comment.columns.id,
    }),
    comment: column.number({ references: () => Comment.columns.id }),
  },
};

// https://astro.build/db/config
export default defineDb({
  tables: { Post, PostContent, Comment, CommentReply },
});

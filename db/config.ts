import { column, defineDb, defineTable } from "astro:db";

export const Comment = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncremental: true }),
    author: column.text(),
    body: column.text(),
    createdAt: column.date(),
    updatedAt: column.date({ optional: true }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Comment },
});

import { db, Comment } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.delete(Comment);
  await db.insert(Comment).values(
    Array.from({ length: 5 }).map((_v, i) => ({
      id: i++,
      author: "Brian" + i,
      body: "some comment" + i++,
      createdAt: new Date(),
    }))
  );
}

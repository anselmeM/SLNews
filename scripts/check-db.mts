import { db } from "../src/lib/db";

async function main() {
  const users = await db.user.count();
  const writer = await db.user.findFirst({ where: { role: { not: "USER" } } });
  const articles = await db.article.count();
  const prices = await db.marketPrice.count();
  const announcements = await db.announcement.count();
  console.log(JSON.stringify({ users, writerId: writer?.id, writerName: writer?.name, articles, prices, announcements }));
}

main().catch((e) => { console.error(e.message); process.exit(1); });

import "dotenv/config";
import { db } from "../src/lib/db";

const MISSING = ["Sports", "Environment", "Culture"];

for (const name of MISSING) {
  await db.category.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  console.log(`category ensured: ${name}`);
}

await db.$disconnect();
console.log("done");

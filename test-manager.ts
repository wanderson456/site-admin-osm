import "dotenv/config";
import dotenv from "dotenv";
import path from "node:path";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

dotenv.config({ path: ".env.local" });

export default definePrismaConfig({
  schema: path.resolve(__dirname, "./prisma/schema.prisma"),
  orm: ormConfig({
    contract: path.resolve(__dirname, "./prisma/schema.json"),
    db: {
      connection: process.env["DATABASE_URL"]!,
    },
  }),
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
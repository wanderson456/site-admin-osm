import "dotenv/config";

import dotenv from "dotenv";
import path from "node:path";

import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

dotenv.config({ path: ".env.local" });

export default definePrismaConfig({
  orm: ormConfig({
    contract: path.resolve(__dirname, "./prisma/contract.prisma"),

    db: {
      connection: process.env["DATABASE_URL"]!,
    },
  }),

  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const url = process.env.MIGRATE_DATABASE_URL ?? process.env.DATABASE_URL;
      return new PrismaNeon({ connectionString: url! });
    },
  },
});
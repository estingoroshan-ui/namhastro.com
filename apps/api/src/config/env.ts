import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../../.env" });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  APP_DOMAIN: z.string().url().default("https://namhastro.com"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);

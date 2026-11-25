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
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default("namhastro_jwt_access_super_secret_development_key_2026_vedic_wisdom_token_auth_32bytes"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default("namhastro_jwt_refresh_super_secret_development_key_2026_vedic_wisdom_token_auth_32bytes"),
  OTP_PROVIDER_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  RTC_PROVIDER: z.string().default("agora"),
  RTC_APP_ID: z.string().optional(),
  RTC_APP_CERTIFICATE: z.string().optional(),
});

export const env = envSchema.parse(process.env);

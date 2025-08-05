import { cleanEnv, str, port, url, bool } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
  DATABASE_URL: url({ desc: "Database connection URL" }),
  PORT: port({ desc: "Server port", default: 3000 }),
  NODE_ENV: str({
    desc: "Node environment",
    default: "development",
    choices: ["development", "production", "test"],
  }),
  LOG_LEVEL: str({
    desc: "Log level",
    default: "INFO",
    choices: ["ERROR", "WARN", "INFO", "DEBUG"],
  }),
  ENABLE_HTTP_LOGS: bool({
    desc: "Enable HTTP request logging",
    default: false,
  }),
  CORS_ORIGIN: str({
    desc: "CORS origin URL",
    default: "",
  }),
  BODY_LIMIT: str({
    desc: "Body limit",
    default: "1mb",
  }),
  OPENAI_API_KEY: str({
    desc: "OpenAI API key",
  }),
  OPENAI_FALLBACK_MODEL: str({
    desc: "OpenAI fallback model",
    default: "gpt-3.5-turbo",
  }),
  OPENAI_MAIN_MODEL: str({
    desc: "OpenAI main model",
    default: "gpt-4o",
  }),
  PDL_API_KEY: str({
    desc: "PDL API key",
  }),
});

export type EnvConfig = typeof env;

export const isDevelopment = () => env.NODE_ENV === "development";
export const isProduction = () => env.NODE_ENV === "production";
export const isTest = () => env.NODE_ENV === "test";

export const dbConfig = {
  url: env.DATABASE_URL,
  ssl: isProduction() ? { rejectUnauthorized: false } : false,
};

export const serverConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  bodyLimit: env.BODY_LIMIT,
};

export const openaiConfig = {
  fallbackModel: env.OPENAI_FALLBACK_MODEL,
  mainModel: env.OPENAI_MAIN_MODEL,
};

export const loggingConfig = {
  level: env.LOG_LEVEL,
  enableHttpLogs: env.ENABLE_HTTP_LOGS,
};

export const securityConfig = {
  corsOrigin:
    env.CORS_ORIGIN || (isDevelopment() ? "*" : env.CORS_ORIGIN.split(",")),
};

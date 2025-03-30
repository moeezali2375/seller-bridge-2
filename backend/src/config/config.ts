import dotenv from "dotenv";

dotenv.config();

function getEnvVariable(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value as string;
}

export const config = {
  PORT: getEnvVariable("PORT"),
  FASTAPI_PORT: getEnvVariable("FASTAPI_PORT"),
  DATABASE_URL: getEnvVariable("DATABASE_URL"),
  TELEGRAM_API_ID: getEnvVariable("TELEGRAM_API_ID"),
  TELEGRAM_API_HASH: getEnvVariable("TELEGRAM_API_HASH"),
  OPEN_API_KEY: getEnvVariable("OPENAI_API_KEY"),
  NODE_ENV: getEnvVariable("NODE_ENV"),
};

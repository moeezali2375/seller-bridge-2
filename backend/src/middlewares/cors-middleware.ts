import cors from "cors";
import { config } from "../config/config";

const allowedOrigins: Record<"development" | "production", string> = {
  development: config.CLIENT_DEV_URL,
  production: config.CLIENT_PROD_URL,
};

const corsMiddleware = cors({
  origin: (origin, callback) => {
    const env = config.NODE_ENV as "development" | "production";
    const allowedOrigin = allowedOrigins[env];

    if (!origin || origin === allowedOrigin) {
      callback(null, allowedOrigin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
});

export default corsMiddleware;

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception");
  console.log(err.name, err.message);
  console.log("Uncaught Exception occured! Shutting down...");
  process.exit(1);
});

import { config } from "./config/config";
import app from "./app";

const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});

process.on("unhandledRejection", (err: unknown) => {
  console.log("Unhandled Rejection");
  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log("Unknown error:", err);
  }

  console.log("Unhandled rejection occurred! Shutting down...");

  server.close(() => {
    process.exit(1);
  });
});

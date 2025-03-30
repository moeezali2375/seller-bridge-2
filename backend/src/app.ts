import express from "express";
import "dotenv/config";
import authRouter from "./routes/auth-route";
import cors from "cors";
import errorMiddleware from "./middlewares/error-middleware";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);

// NOTE:Keep this middleware at the end so it can be handled be req, res functions
app.use(errorMiddleware);

export default app;

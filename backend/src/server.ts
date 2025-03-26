import express from "express";
import "dotenv/config";
import authRouter from "./routes/auth-route";
import cors from "cors";
import { config } from "./config/config";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});

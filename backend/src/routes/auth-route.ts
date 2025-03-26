import express from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler";
import { registerBuyer } from "../controllers/auth-controller";

const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
  res.status(200).json({ msg: "heello" });
});

authRouter.post("/register/buyer", asyncErrorHandler(registerBuyer));
export default authRouter;

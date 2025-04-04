import express from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler";
import {
  initiateResetPasswordController,
  loginController,
  regenerateVerificationTokenController,
  registerBuyerController,
  resetPasswordController,
  verifyVerificationTokenController,
} from "../controllers/auth-controller";
import { protectBuyer } from "../middlewares/auth-middleware";

const authRouter = express.Router();

authRouter.post("/register/buyer", asyncErrorHandler(registerBuyerController));

// NOTE: buyer seller will have separate because of unique middlewares

authRouter.get(
  "/buyer/verify-token/:verificationToken",
  protectBuyer,
  asyncErrorHandler(verifyVerificationTokenController),
);

// authRouter.get(
//   "/seller/verify-token/:verificationToken",
//   protectSeller,
//   asyncErrorHandler(verifyVerificationTokenController),
// );

authRouter.get(
  "/buyer/regenerate-token",
  protectBuyer,
  asyncErrorHandler(regenerateVerificationTokenController),
);

// authRouter.get("/seller/regenerate-token", protectSeller);

authRouter.post("/login", asyncErrorHandler(loginController));

authRouter.put(
  "/reset-password",
  asyncErrorHandler(initiateResetPasswordController),
);

authRouter.post("/reset-password", asyncErrorHandler(resetPasswordController));

export default authRouter;

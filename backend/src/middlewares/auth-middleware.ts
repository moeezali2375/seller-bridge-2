import { NextFunction, Request } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler";
import CustomError from "../utils/customError";
import { getBuyerByIdService } from "../services/auth-service";
import { verifyJwtToken } from "../utils/authUtils";

export const checkIfUserVerified = asyncErrorHandler(
  async (req: Request, _, next: NextFunction) => {
    if (req.user && req.user.isVerified) {
      next();
    } else {
      throw new CustomError("User not Verfied! 🧑🏻‍💻", 403);
    }
  },
);

// export const checkIfSellerApproved = asyncErrorHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     if (req.user && req.user.role === "seller" && req.user.isApproved) {
//       next();
//     } else {
//       throw new CustomError("User not Verfied! 🧑🏻‍💻", 403);
//     }
//   },
// );

export const protectBuyer = asyncErrorHandler(
  async (req: Request, _, next: NextFunction) => {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new CustomError("No token provided! 🧑🏻‍💻", 400);

    const decoded = verifyJwtToken(token);

    if (!decoded.id) throw new CustomError("Invalid token! 🧑🏻‍💻", 401);

    const buyer = await getBuyerByIdService(Number(decoded.id));

    req.user = buyer;
    next();
  },
);

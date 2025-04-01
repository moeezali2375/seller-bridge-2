import { userBuyer, userSeller } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: userBuyer | userSeller;
    }
  }
}

export {};

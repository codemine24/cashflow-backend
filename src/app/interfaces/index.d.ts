import { TAuthUser } from "./common";

declare global {
  namespace Express {
    interface Request {
      user?: TAuthUser;
    }
  }
}

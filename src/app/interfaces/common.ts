import { UserRole } from "../../generated/prisma/enums";

export type TAuthUser = {
  id: string;
  contact_number: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

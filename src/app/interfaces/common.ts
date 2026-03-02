import { UserRole } from "../../generated/prisma/enums";

export type TAuthUser = {
  id: string;
  name: string;
  contact_number: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

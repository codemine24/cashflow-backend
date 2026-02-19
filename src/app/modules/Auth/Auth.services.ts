import bcrypt from "bcrypt";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { RegisterPayload } from "./Auth.interfaces";

const register = async (payload: RegisterPayload) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  return user;
};

export const AuthServices = {
  register,
};

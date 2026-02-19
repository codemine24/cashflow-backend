import bcrypt from "bcrypt";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { LoginPayload, RegisterPayload } from "./Auth.interfaces";
import { UserStatus } from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import CustomizedError from "../../error/customized-error";
import { tokenGenerator } from "../../utils/jwt-helpers";

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

// -------------------------------------- LOGIN ---------------------------------------------
const login = async (credential: LoginPayload) => {
  const { email, password } = credential;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: email,
        },
        {
          contact_number: email,
        },
      ],
      status: UserStatus.ACTIVE,
      is_deleted: false,
    },
  });

  if (!user) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    throw new CustomizedError(
      httpStatus.FORBIDDEN,
      "Email/Contact number or password is invalid",
    );
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    contact_number: user.contact_number,
    email: user.email,
    role: user.role,
  };

  const accessToken = tokenGenerator(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiresin,
  );

  const refreshToken = tokenGenerator(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiresin,
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    contact_number: user.contact_number,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
    access_token: accessToken,
    refreshToken,
  };
};

export const AuthServices = {
  register,
  login,
};

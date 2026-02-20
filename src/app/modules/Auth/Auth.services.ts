import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { RegisterPayload, ValidateOTPPayload } from "./Auth.interfaces";
import { UserStatus } from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import CustomizedError from "../../error/customized-error";
import { tokenGenerator } from "../../utils/jwt-helpers";
import { OTPGenerator, OTPVerifier } from "../../utils/sms-sender";
import emailSender from "../../utils/email-sender";
import { OTPTemplate } from "../../template/otp-template";

// -------------------------------------- GET OTP --------------------------------------------
const getOTP = async (payload: RegisterPayload) => {
  let user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
      },
    });
  }

  const generatedOTP = OTPGenerator();
  const expirationTime = (new Date().getTime() + 5 * 60000).toString();

  const emailBody = OTPTemplate(String(generatedOTP));

  let emailResponse;
  if (user.email) {
    emailResponse = await emailSender(user.email, emailBody, "Verify OTP");
  }

  if (emailResponse?.accepted?.length === 0)
    throw new CustomizedError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send OTP",
    );

  const result = await prisma.oTP.create({
    data: {
      email: user.email,
      otp: generatedOTP,
      expires_at: expirationTime,
    },
    select: {
      email: true,
      expires_at: true,
    },
  });

  return result;
};

// -------------------------------------- VALIDATE OTP ---------------------------------------
const validateOTP = async (credential: ValidateOTPPayload) => {
  const { otp, email } = credential;

  const storedOTP = await prisma.oTP.findFirst({
    where: {
      otp: Number(otp),
      email: email,
    },
  });

  if (!storedOTP) {
    throw new CustomizedError(httpStatus.FORBIDDEN, "OTP not matched");
  }

  const verifiedOTP = await OTPVerifier(
    Number(otp),
    storedOTP.otp,
    Number(storedOTP.expires_at),
  );

  if (verifiedOTP.success === false) {
    throw new CustomizedError(httpStatus.FORBIDDEN, verifiedOTP.message);
  }

  const user = await prisma.user.findFirst({
    where: {
      email: email,
      status: UserStatus.ACTIVE,
      is_deleted: false,
    },
  });

  if (!user) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "User not found");
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
  getOTP,
  validateOTP,
};

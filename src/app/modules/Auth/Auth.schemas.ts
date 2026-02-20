import z from "zod";

// -------------------------------------- GET OTP --------------------------------------------
const register = z.object({
  body: z
    .object({
      email: z.email({ message: "Email is required" }),
    })
    .strict(),
});

// -------------------------------------- VALIDATE OTP ---------------------------------------
const validateOTP = z.object({
  body: z
    .object({
      otp: z
        .number({ message: "OTP should be a number" })
        .min(1, "OTP is required"),
      email: z.email({ message: "Email is required" }),
    })
    .strict(),
});

export const AuthSchemas = {
  register,
  validateOTP,
};

import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export const tokenGenerator = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export const tokenVerifier = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

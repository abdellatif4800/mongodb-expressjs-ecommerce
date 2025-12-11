import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function generateToken(jwtPayload: any) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the configuration.");
  }
  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}
export async function decodeToken(token: string) {
  const decode = jwt.verify(token, process.env.JWT_SECRET!);
  return decode
}


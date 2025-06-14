import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export default class AuthService {
  static async register({ email, password, name }: any) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { status: 400, message: "User already exists" };

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password_hash: hashed },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return { status: 201, token, user };
  }

  static async login({ email, password }: any) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { status: 401, message: "Invalid credentials" };

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return { status: 401, message: "Invalid credentials" };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return { status: 200, token, user };
  }
}

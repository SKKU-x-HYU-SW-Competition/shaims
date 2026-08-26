import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  return {
    userId: session.userId,
    teamName: session.teamName,
    role: session.role,
  };
}

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/submissions");
  return user;
}

import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import type { Role } from "@prisma/client";

export type SessionPayload = {
  userId: string;
  teamName: string;
  role: Role;
};

export const sessionOptions: SessionOptions = {
  cookieName: "shaims_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  },
};

export async function getSession() {
  return getIronSession<SessionPayload>(await cookies(), sessionOptions);
}

import type { FastifyInstance } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { supabaseServer } from "@/supabase";
import type { SignInBody, SignUpBody } from "@/types/user";

export async function authRoutes(app: FastifyInstance) {
  // ---------- SIGN UP ----------
  app.post<{ Body: SignUpBody }>("/auth/sign-up", async (request, reply) => {
    const { email, password, firstName, lastName } = request.body;

    if (!email?.trim() || !password || !firstName?.trim() || !lastName?.trim()) {
      return reply
        .status(400)
        .send({ error: "email, password, firstName and lastName are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: signUpData, error: signUpError } = await supabaseServer.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already")) {
        return reply.status(409).send({ error: "Email already registered" });
      }
      request.log.error({ err: signUpError }, "Supabase signUp failed");
      return reply.status(400).send({ error: signUpError.message });
    }

    if (!signUpData.user) {
      return reply.status(500).send({ error: "User creation failed" });
    }

    try {
      await db.insert(users).values({
        supabaseUserId: signUpData.user.id,
        email: signUpData.user.email!,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (err) {
      request.log.error({ err }, "Insert user failed");
      return reply.status(500).send({ error: "Failed to create profile" });
    }

    return reply.status(201).send({
      user: {
        email: signUpData.user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      message: "Account created. Check your email to confirm your account, then sign in.",
    });
  });

  app.post<{ Body: SignInBody }>("/auth/sign-in", async (request, reply) => {
    const { email, password } = request.body;

    if (!email?.trim() || !password) {
      return reply.status(400).send({ error: "email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login")) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return reply.status(403).send({ error: "Please confirm your email before signing in." });
      }
      request.log.error({ err: error }, "Sign in failed");
      return reply.status(401).send({ error: error.message });
    }

    if (!data.session || !data.user) {
      return reply.status(401).send({ error: "Sign in failed" });
    }

    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        emailConfirmed: users.emailConfirmed,
      })
      .from(users)
      .where(and(eq(users.supabaseUserId, data.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (!row) {
      return reply.status(401).send({ error: "User profile not found" });
    }

    if (!row.emailConfirmed) {
      return reply.status(403).send({
        error: "Please confirm your email before signing in.",
        code: "EMAIL_NOT_CONFIRMED",
      });
    }

    return reply.send({
      user: {
        id: row.id,
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        emailConfirmed: row.emailConfirmed,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    });
  });
}

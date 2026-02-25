import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { supabaseServer } from "@/supabase";
import { AuthenticatedUser } from "@/types/auth";

async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabaseServer.auth.getUser(token);

    if (error || !data.user) {
      return reply.status(401).send({ error: "Invalid token" });
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
        error: "Email not confirmed. Check your inbox to confirm your account.",
        code: "EMAIL_NOT_CONFIRMED",
      });
    }

    const user: AuthenticatedUser = {
      id: row.id,
      supabaseId: data.user.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    };

    request.user = user;
  } catch (err) {
    request.log.error(err);
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

export async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", authenticate);
}

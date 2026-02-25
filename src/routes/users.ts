import type { FastifyInstance } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { supabaseServer } from "@/supabase";
import type { UpdateUserBody, UserResponse } from "@/types/user";

function toUserResponse(row: {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailConfirmed: boolean;
  paymentCustomerId: string | null;
  createdAt: Date;
}): UserResponse {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    emailConfirmed: row.emailConfirmed,
    paymentCustomerId: row.paymentCustomerId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function userRoutes(app: FastifyInstance) {
  app.get("/users/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, request.user!.id), isNull(users.deletedAt)))
      .limit(1);

    if (!row) {
      return reply.status(404).send({ error: "User not found" });
    }

    return toUserResponse(row);
  });

  app.patch<{ Body: UpdateUserBody }>(
    "/users/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { firstName, lastName } = request.body;

      const updates: { firstName?: string; lastName?: string } = {};
      if (firstName !== undefined) updates.firstName = firstName.trim();
      if (lastName !== undefined) updates.lastName = lastName.trim();

      if (Object.keys(updates).length === 0) {
        return reply.status(400).send({ error: "No fields to update" });
      }

      const [row] = await db
        .update(users)
        .set(updates)
        .where(and(eq(users.id, request.user!.id), isNull(users.deletedAt)))
        .returning();

      if (!row) {
        return reply.status(404).send({ error: "User not found" });
      }

      return toUserResponse(row);
    }
  );

  app.delete("/users/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user!.id;

    const [row] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .returning({ id: users.id });

    if (!row) {
      return reply.status(404).send({ error: "User not found" });
    }

    try {
      await supabaseServer.auth.admin.deleteUser(request.user!.supabaseId);
    } catch {
      request.log.warn("Supabase user already removed or delete failed");
    }

    return reply.status(204).send();
  });
}

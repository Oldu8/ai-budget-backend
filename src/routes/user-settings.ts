import type { FastifyInstance } from "fastify";
import { db } from "@/db/client";
import { userSettings } from "@/db/schema";
import type { UserSettingsBody, UserSettingsResponse } from "@/types/user-settings";

function toResponse(row: {
  id: number;
  userId: number;
  currency: string;
  language: string;
  timezone: string;
}): UserSettingsResponse {
  return {
    id: row.id,
    userId: row.userId,
    currency: row.currency,
    language: row.language,
    timezone: row.timezone,
  };
}

export async function userSettingsRoutes(app: FastifyInstance) {
  app.put<{ Body: UserSettingsBody }>(
    "/users/me/settings",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { currency, language, timezone } = request.body;
      const userId = request.user!.id;

      const trimmed = {
        currency: currency.trim(),
        language: language.trim(),
        timezone: timezone.trim(),
      };

      if (!trimmed.currency || !trimmed.language || !trimmed.timezone) {
        return reply.status(400).send({ error: "currency, language and timezone are required" });
      }

      const [row] = await db
        .insert(userSettings)
        .values({
          userId,
          currency: trimmed.currency,
          language: trimmed.language,
          timezone: trimmed.timezone,
        })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: {
            currency: trimmed.currency,
            language: trimmed.language,
            timezone: trimmed.timezone,
          },
        })
        .returning();

      if (!row) {
        return reply.status(500).send({ error: "Failed to save settings" });
      }

      return toResponse(row);
    }
  );
}

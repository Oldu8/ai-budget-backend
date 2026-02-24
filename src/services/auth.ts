import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { supabaseServer } from "@/supabase";
import { AuthenticatedUser } from "@/types/auth";

export async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
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

      const user: AuthenticatedUser = {
        id: data.user.id,
        email: data.user.email ?? undefined,
      };

      request.user = user;
    } catch (err) {
      request.log.error(err);
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });
}

import type { FastifyReply as FReply, FastifyRequest as FRequest } from "fastify";
import { AuthenticatedUser } from "@/types/auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }

  interface FastifyInstance {
    authenticate: (request: FRequest, reply: FReply) => Promise<void>;
  }
}

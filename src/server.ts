import Fastify from "fastify";
import dotenv from "dotenv";
import { sql } from "./db/client";

dotenv.config();

const app = Fastify({
  logger: true,
});

app.get("/health", async (_, reply) => {
  const timestamp = new Date().toISOString();

  try {
    await sql`select 1`;

    return {
      status: "ok",
      database: "up",
      timestamp,
    };
  } catch (error) {
    app.log.error({ error }, "Health check failed");
    reply.code(503);

    return {
      status: "degraded",
      database: "down",
      timestamp,
    };
  }
});

const start = async () => {
  try {
    await app.listen({ port: parseInt(process.env.PORT || "3001"), host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

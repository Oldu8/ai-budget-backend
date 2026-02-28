import "dotenv/config";
import Fastify from "fastify";
import { sql } from "@/db/client";
import { authPlugin } from "@/services/auth";
import { authRoutes } from "@/routes/auth";
import { userRoutes } from "@/routes/users";
import { userSettingsRoutes } from "@/routes/user-settings";
import { testAiRoute } from "@/routes/test-ai";

const app = Fastify({
  logger: true,
});

app.register(authPlugin);
app.register(authRoutes);
app.register(userRoutes);
app.register(userSettingsRoutes);
app.register(testAiRoute);

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

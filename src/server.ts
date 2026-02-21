import Fastify from "fastify";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await app.listen({ port: parseInt(process.env.PORT || "3000"), host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

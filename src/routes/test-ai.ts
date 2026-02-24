import { FastifyInstance } from "fastify";
import { openai } from "@/services/openai";

export async function testAiRoute(app: FastifyInstance) {
  app.get("/test-ai", async () => {
    try {
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: "Say hello in one short sentence",
      });

      return {
        success: true,
        output: response.output_text,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "Unknown error",
      };
    }
  });
}

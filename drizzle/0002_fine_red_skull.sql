CREATE TYPE "public"."transaction_created_by" AS ENUM('user', 'ai');--> statement-breakpoint
ALTER TABLE "chats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "chats" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "transactions" DROP CONSTRAINT "transactions_message_id_messages_id_fk"; EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "created_by" "transaction_created_by" NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "img_path" text;--> statement-breakpoint
CREATE INDEX "transactions_user_date_idx" ON "transactions" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "transactions_user_category_date_idx" ON "transactions" USING btree ("user_id","category_id","date");--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "message_id";--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_type_unique" UNIQUE("type");--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
DROP TYPE "public"."message_status";
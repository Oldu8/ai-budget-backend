DO $$ BEGIN ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_user_id_users_id_fk"; EXCEPTION WHEN undefined_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL; EXCEPTION WHEN undefined_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL; EXCEPTION WHEN undefined_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ADD COLUMN "supabase_user_id" text NOT NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ADD COLUMN "email_confirmed" boolean DEFAULT false NOT NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp; EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" DROP COLUMN "password"; EXCEPTION WHEN undefined_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ADD CONSTRAINT "users_supabase_user_id_unique" UNIQUE("supabase_user_id"); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
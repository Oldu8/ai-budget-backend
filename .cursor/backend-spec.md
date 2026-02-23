🛠 AI Budget: Backend Technical Specification (v1.0)

1. Project Overview
   The backend for AI Budget is a Node.js-based API that serves as the "brain" for the mobile application. Its primary responsibilities include:

Authenticating users via Supabase Auth.

Processing receipt images using OpenAI's GPT-4o-mini.

Managing a complex, hierarchical expense category system.

Handling subscription billing and usage limits via Stripe.

Serving as a bridge to Google Sheets for data export.

2. Core Tech Stack
   Runtime: Node.js (TypeScript)

Framework: Fastify (for high performance and low latency)

ORM: Drizzle ORM

Database: PostgreSQL (Managed via Supabase)

AI Integration: OpenAI SDK (Model: gpt-4o-mini with JSON mode)

Payment Gateway: Stripe SDK (Subscriptions & Webhooks)

Storage: Supabase Storage SDK

3. Database Schema (Drizzle ORM)
   3.1. User & Personalization
   user: Core profile linked to Supabase Auth and Stripe payment_customer_id.

User_Settings: Stores user preferences: currency, language, and timezone (IANA format).

Crucial: Timezone is used to calculate the correct transaction date relative to the user's location.

3.2. Categories & Visibility System
Categories: A static, hierarchical table of predefined categories.

category_id: Self-referencing FK. If null = Level 1 (e.g., Housing), if set = Level 2 (e.g., Rent).

visibility_tag: Metadata (e.g., kids, car, pets) used to bulk-toggle categories based on user lifestyle.

User_Category_Settings: Junction table determining which static categories are is_active for a specific user.

3.3. Financial Records & AI Logging
Transaction:

amount: Stored as Integer (in cents/smallest units) to prevent floating-point errors.

type: Enum (income, expense).

raw_ai_data: JSONB field storing the full OpenAI response for auditing.

deleted_at: Soft-delete timestamp.

Chat & Message:

Stores interaction history. Message includes img_path for receipt storage.

status: pending, processed, error.

3.4. Subscription & Billing (Stripe)
Plan: Catalog of subscription tiers (Free, Basic, Standard, Premium). Includes payment_price_id and check_limit (AI scans per month).

UserSubscription: Real-time subscription state.

used_checks_count: Incremented after every successful AI scan.

Reset Logic: Must reset to 0 when a new billing cycle starts (via Stripe invoice.paid webhook).

Payment: Records individual transactions with links to Stripe invoices.

Statuses: Normalized dictionary for subscription/payment states.

4. Key Logic & Business Rules
   4.1. The AI Processing Pipeline
   Receive Image: API receives a file path and chat_id.

Prompt Construction: The system fetches the user's active categories and sends them to OpenAI.

JSON Extraction: OpenAI must return: amount, date, vendor, and the category_id from the provided list.

Transaction Creation: The backend validates the AI response, creates a Transaction record, and updates the Message status to processed.

Quota Consumption: Increment used_checks_count in UserSubscription.

4.2. Quota Enforcement
Before calling the OpenAI API, the backend must verify:
UserSubscription.used_checks_count < Plan.check_limit.

If the limit is reached, return a 403 Forbidden with a "Limit Exceeded" payload.

4.3. Stripe Webhook Handling
The backend must listen for:

checkout.session.completed: Activate a new subscription.

invoice.paid: Reset used_checks_count for the new month.

customer.subscription.deleted: Update status to Canceled and restrict access.

5. Deployment & Environment
   Host: Railway.app

Database: Supabase (PostgreSQL)

Environment Variables:

DATABASE_URL, OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY.

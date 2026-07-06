CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" jsonb DEFAULT '["customers:write","demands:write"]'::jsonb NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_field_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"field_type" text NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_workflow_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"demand_type" "demand_type" NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"is_initial" boolean DEFAULT false NOT NULL,
	"is_final" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"webhook_id" uuid,
	"event" "webhook_event" NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"status_code" integer,
	"error" text,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demands" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "demands" ALTER COLUMN "status" SET DEFAULT 'open';--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_workflow_statuses" ADD CONSTRAINT "demand_workflow_statuses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_organization_idx" ON "api_keys" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_prefix_idx" ON "api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "custom_field_definitions_organization_idx" ON "custom_field_definitions" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_field_definitions_org_entity_key_idx" ON "custom_field_definitions" USING btree ("organization_id","entity_type","key");--> statement-breakpoint
CREATE INDEX "demand_workflow_statuses_organization_idx" ON "demand_workflow_statuses" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "demand_workflow_statuses_org_type_key_idx" ON "demand_workflow_statuses" USING btree ("organization_id","demand_type","key");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_organization_idx" ON "webhook_deliveries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_webhook_idx" ON "webhook_deliveries" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_event_idx" ON "webhook_deliveries" USING btree ("event");
CREATE TABLE "distribution_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"condition_demand_type" "demand_type",
	"condition_priority" "demand_priority",
	"condition_team_id" uuid,
	"condition_customer_status" "customer_status",
	"action_team_id" uuid,
	"action_assignee_id" uuid,
	"action_priority" "demand_priority",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "distribution_rules" ADD CONSTRAINT "distribution_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_rules" ADD CONSTRAINT "distribution_rules_condition_team_id_teams_id_fk" FOREIGN KEY ("condition_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_rules" ADD CONSTRAINT "distribution_rules_action_team_id_teams_id_fk" FOREIGN KEY ("action_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_rules" ADD CONSTRAINT "distribution_rules_action_assignee_id_users_id_fk" FOREIGN KEY ("action_assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "distribution_rules_organization_idx" ON "distribution_rules" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "distribution_rules_active_idx" ON "distribution_rules" USING btree ("is_active");
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const memberRole = pgEnum("member_role", ["owner", "admin", "manager", "member"]);
export const customerStatus = pgEnum("customer_status", [
  "prospect",
  "active",
  "at_risk",
  "inactive",
]);
export const demandType = pgEnum("demand_type", ["client", "internal"]);
export const demandPriority = pgEnum("demand_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const demandStatus = pgEnum("demand_status", [
  "open",
  "in_progress",
  "waiting",
  "done",
  "canceled",
]);
export const webhookEvent = pgEnum("webhook_event", [
  "customer.created",
  "customer.updated",
  "demand.created",
  "demand.updated",
  "demand.status_changed",
  "demand.assigned",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logo: text("logo"),
  metadata: text("metadata"),
  ...timestamps,
}, (table) => [
  uniqueIndex("organizations_slug_idx").on(table.slug),
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  image: text("image"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email),
]);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  activeOrganizationId: uuid("active_organization_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
  activeTeamId: uuid("active_team_id").references(() => teams.id, { onDelete: "set null" }),
  ...timestamps,
}, (table) => [
  uniqueIndex("sessions_token_idx").on(table.token),
  index("sessions_user_idx").on(table.userId),
  index("sessions_active_organization_idx").on(table.activeOrganizationId),
]);

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
}, (table) => [
  index("accounts_user_idx").on(table.userId),
  uniqueIndex("accounts_provider_account_idx").on(table.providerId, table.accountId),
]);

export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
}, (table) => [
  index("verifications_identifier_idx").on(table.identifier),
]);

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: memberRole("role").default("member").notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("organization_members_org_user_idx").on(table.organizationId, table.userId),
  index("organization_members_user_idx").on(table.userId),
]);

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ...timestamps,
}, (table) => [
  index("teams_organization_idx").on(table.organizationId),
]);

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("team_members_team_user_idx").on(table.teamId, table.userId),
  index("team_members_user_idx").on(table.userId),
]);

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  inviterId: uuid("inviter_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  role: memberRole("role").default("member").notNull(),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("invitations_organization_idx").on(table.organizationId),
  index("invitations_email_idx").on(table.email),
]);

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  document: text("document"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  status: customerStatus("status").default("prospect").notNull(),
  customFields: jsonb("custom_fields").default({}).notNull(),
  ...timestamps,
}, (table) => [
  index("customers_organization_idx").on(table.organizationId),
  index("customers_owner_idx").on(table.ownerId),
]);

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customer_id")
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  ...timestamps,
}, (table) => [
  index("contacts_organization_idx").on(table.organizationId),
  index("contacts_customer_idx").on(table.customerId),
]);

export const demands = pgTable("demands", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  type: demandType("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("open").notNull(),
  priority: demandPriority("priority").default("medium").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  customFields: jsonb("custom_fields").default({}).notNull(),
  ...timestamps,
}, (table) => [
  index("demands_organization_idx").on(table.organizationId),
  index("demands_customer_idx").on(table.customerId),
  index("demands_team_idx").on(table.teamId),
  index("demands_assignee_idx").on(table.assigneeId),
  index("demands_status_idx").on(table.status),
]);

export const distributionRules = pgTable("distribution_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  conditionDemandType: demandType("condition_demand_type"),
  conditionPriority: demandPriority("condition_priority"),
  conditionTeamId: uuid("condition_team_id").references(() => teams.id, { onDelete: "set null" }),
  conditionCustomerStatus: customerStatus("condition_customer_status"),
  actionTeamId: uuid("action_team_id").references(() => teams.id, { onDelete: "set null" }),
  actionAssigneeId: uuid("action_assignee_id").references(() => users.id, { onDelete: "set null" }),
  actionPriority: demandPriority("action_priority"),
  ...timestamps,
}, (table) => [
  index("distribution_rules_organization_idx").on(table.organizationId),
  index("distribution_rules_active_idx").on(table.isActive),
]);

export const webhooks = pgTable("webhooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  event: webhookEvent("event").notNull(),
  secretHash: text("secret_hash").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
}, (table) => [
  index("webhooks_organization_idx").on(table.organizationId),
  index("webhooks_event_idx").on(table.event),
]);

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  webhookId: uuid("webhook_id").references(() => webhooks.id, { onDelete: "cascade" }),
  event: webhookEvent("event").notNull(),
  payload: jsonb("payload").default({}).notNull(),
  status: text("status").default("pending").notNull(),
  statusCode: integer("status_code"),
  error: text("error"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("webhook_deliveries_organization_idx").on(table.organizationId),
  index("webhook_deliveries_webhook_idx").on(table.webhookId),
  index("webhook_deliveries_event_idx").on(table.event),
]);

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  scopes: jsonb("scopes").default(["customers:write", "demands:write"]).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("api_keys_organization_idx").on(table.organizationId),
  uniqueIndex("api_keys_prefix_idx").on(table.prefix),
]);

export const customFieldDefinitions = pgTable("custom_field_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  entityType: text("entity_type").notNull(),
  key: text("key").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull(),
  options: jsonb("options").default([]).notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
}, (table) => [
  index("custom_field_definitions_organization_idx").on(table.organizationId),
  uniqueIndex("custom_field_definitions_org_entity_key_idx").on(
    table.organizationId,
    table.entityType,
    table.key,
  ),
]);

export const demandWorkflowStatuses = pgTable("demand_workflow_statuses", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  demandType: demandType("demand_type").notNull(),
  key: text("key").notNull(),
  label: text("label").notNull(),
  isInitial: boolean("is_initial").default(false).notNull(),
  isFinal: boolean("is_final").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
}, (table) => [
  index("demand_workflow_statuses_organization_idx").on(table.organizationId),
  uniqueIndex("demand_workflow_statuses_org_type_key_idx").on(
    table.organizationId,
    table.demandType,
    table.key,
  ),
]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  action: text("action").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_events_organization_idx").on(table.organizationId),
  index("audit_events_entity_idx").on(table.entityType, table.entityId),
]);

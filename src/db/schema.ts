import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const memberRole = pgEnum("member_role", ["admin", "manager", "member"]);
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
  status: demandStatus("status").default("open").notNull(),
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

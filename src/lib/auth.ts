import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { getAuthAllowedHosts, getAuthTrustedOrigins } from "@/lib/auth-url";

function createAuth() {
  return betterAuth({
    appName: "CRM INTELIGENTTE",
    secret: process.env.AUTH_SECRET,
    baseURL: {
      allowedHosts: getAuthAllowedHosts(),
      fallback: process.env.NEXT_PUBLIC_APP_URL,
      protocol: process.env.NODE_ENV === "production" ? "https" : "auto",
    },
    trustedOrigins: getAuthTrustedOrigins(),
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema,
    }),
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    user: {
      modelName: "users",
    },
    session: {
      modelName: "sessions",
    },
    account: {
      modelName: "accounts",
    },
    verification: {
      modelName: "verifications",
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        creatorRole: "owner",
        schema: {
          organization: {
            modelName: "organizations",
          },
          member: {
            modelName: "organizationMembers",
          },
          invitation: {
            modelName: "invitations",
          },
          team: {
            modelName: "teams",
          },
          teamMember: {
            modelName: "teamMembers",
          },
        },
        teams: {
          enabled: true,
          defaultTeam: {
            enabled: true,
          },
        },
      }),
      nextCookies(),
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;

let auth: Auth | null = null;

export function getAuth(): Auth {
  if (!auth) {
    auth = createAuth();
  }

  return auth;
}

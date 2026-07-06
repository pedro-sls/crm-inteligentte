const LOCAL_DEV_HOST_PATTERNS = [
  "localhost:*",
  "127.*.*.*:*",
  "[::1]:*",
  "10.*.*.*:*",
  "192.168.*.*:*",
  ...Array.from({ length: 16 }, (_, index) => `172.${index + 16}.*.*:*`),
];

const LOCAL_DEV_ORIGIN_PATTERNS = LOCAL_DEV_HOST_PATTERNS.flatMap((host) => [
  `http://${host}`,
  `https://${host}`,
]);

type AuthUrlEnv = Record<string, string | undefined>;

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function splitCommaSeparated(value: string | undefined) {
  return (
    value
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

function getHostFromUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function getOriginFromUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getAuthAllowedHosts(env: AuthUrlEnv = process.env, nodeEnv = process.env.NODE_ENV) {
  const configuredAppHost = getHostFromUrl(env.NEXT_PUBLIC_APP_URL);
  const configuredHosts = splitCommaSeparated(env.AUTH_ALLOWED_HOSTS);
  const devHosts = nodeEnv === "production" ? [] : LOCAL_DEV_HOST_PATTERNS;

  return unique([configuredAppHost ?? "", ...configuredHosts, ...devHosts]);
}

export function getAuthTrustedOrigins(env: AuthUrlEnv = process.env, nodeEnv = process.env.NODE_ENV) {
  const configuredAppOrigin = getOriginFromUrl(env.NEXT_PUBLIC_APP_URL);
  const configuredOrigins = [
    ...splitCommaSeparated(env.AUTH_TRUSTED_ORIGINS),
    ...splitCommaSeparated(env.BETTER_AUTH_TRUSTED_ORIGINS),
  ];
  const devOrigins = nodeEnv === "production" ? [] : LOCAL_DEV_ORIGIN_PATTERNS;

  return unique([configuredAppOrigin ?? "", ...configuredOrigins, ...devOrigins]);
}

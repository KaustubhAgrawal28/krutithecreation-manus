export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

export function validateJwtSecret(secret: string) {
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
}

export function validateRuntimeConfiguration() {
  console.log("[DEBUG] JWT_SECRET length:", process.env.JWT_SECRET?.length ?? "undefined");
  console.log("[DEBUG] JWT_SECRET is set:", !!process.env.JWT_SECRET);
  
  const requiredInProduction = [
    ["JWT_SECRET", ENV.cookieSecret],
    ["VITE_APP_ID", ENV.appId],
    ["OAUTH_SERVER_URL", ENV.oAuthServerUrl],
    ["DATABASE_URL", ENV.databaseUrl],
  ] as const;
  const missing = requiredInProduction
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (ENV.isProduction && missing.length > 0) {
    throw new Error(
      `Missing required production configuration: ${missing.join(", ")}`
    );
  }
  if (ENV.isProduction) validateJwtSecret(ENV.cookieSecret);
}

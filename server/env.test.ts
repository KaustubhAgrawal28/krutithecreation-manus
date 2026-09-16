import { describe, expect, it } from "vitest";
import { validateJwtSecret } from "./_core/env";

describe("runtime security configuration", () => {
  it("accepts a JWT secret with at least 32 characters", () => {
    expect(() => validateJwtSecret("a".repeat(32))).not.toThrow();
  });

  it("rejects missing or short JWT secrets", () => {
    expect(() => validateJwtSecret("")).toThrow(/at least 32 characters/i);
    expect(() => validateJwtSecret("too-short")).toThrow(
      /at least 32 characters/i
    );
  });
});

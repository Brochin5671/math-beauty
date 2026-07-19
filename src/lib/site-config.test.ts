import { describe, expect, it } from "vitest";
import { socials } from "./site-config";

describe("socials", () => {
  it("is non-empty", () => {
    expect(socials.length).toBeGreaterThan(0);
  });

  it("every social has href, icon, and label", () => {
    for (const social of socials) {
      expect(social.href).toBeTruthy();
      expect(social.icon).toBeTruthy();
      expect(social.label).toBeTruthy();
    }
  });

  it("every social href is a valid URL", () => {
    for (const social of socials) {
      expect(() => new URL(social.href)).not.toThrow();
    }
  });
});

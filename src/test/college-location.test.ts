import { describe, expect, it } from "vitest";
import { normalizeLabel, uniqueLabels } from "@/lib/college-data";
import { distanceKm } from "@/lib/postal-location";

describe("college location filters", () => {
  it("deduplicates city and stream labels without case or whitespace variants", () => {
    expect(uniqueLabels(["Coimbatore", " coimbatore ", "ENGINEERING", "Engineering"])).toEqual([
      "Coimbatore",
      "ENGINEERING",
    ]);
    expect(normalizeLabel("  Tamil   Nadu ")).toBe("tamil nadu");
  });

  it("measures nearby PIN-code locations in kilometers", () => {
    const chennai = { latitude: 13.0827, longitude: 80.2707 };
    const nearby = { latitude: 13.09, longitude: 80.27 };
    const fartherAway = { latitude: 13.2, longitude: 80.27 };
    expect(distanceKm(chennai, nearby)).toBeLessThan(1);
    expect(distanceKm(chennai, fartherAway)).toBeGreaterThan(10);
  });
});

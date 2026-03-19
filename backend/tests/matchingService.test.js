import { describe, expect, it } from "vitest";
import { getRecommendationForJob } from "../src/services/matchingService.js";

describe("matching service", () => {
  it("calculates match and missing skills", () => {
    const job = {
      company: "TestCo",
      role: "Frontend Engineer",
      category: "Web",
      requiredSkills: ["javascript", "react", "css"],
      learningResources: [],
    };

    const result = getRecommendationForJob(["javascript", "css"], job);

    expect(result.matchPercentage).toBe(67);
    expect(result.missingSkills).toEqual(["react"]);
    expect(result.matchedSkills).toEqual(["javascript", "css"]);
  });
});

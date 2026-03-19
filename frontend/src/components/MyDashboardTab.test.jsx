import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyDashboardTab } from "./MyDashboardTab";

vi.mock("../api/client", () => ({
  api: {
    updateGoals: vi.fn(),
    updateProgress: vi.fn(),
    addCareerPath: vi.fn(),
    updateCareerPath: vi.fn(),
    deleteCareerPath: vi.fn(),
    compareRoles: vi.fn(),
    feedbackDetailed: vi.fn(),
  },
}));

const dashboard = {
  recommendations: [{ company: "Google", role: "Frontend Engineer", category: "Web", matchPercentage: 40 }],
  personalDashboard: {
    profileSnapshot: { experienceLevel: "Fresher", knownSkillsCount: 2, profileCompleteness: 70 },
    careerGoals: { targetRole: "Frontend Engineer", backupRole: "" },
    progressTracker: { not_started: 2, in_progress: 1, practicing: 0, job_ready: 0, completed: 0 },
    roleReadinessScorecard: [
      {
        company: "Google",
        role: "Frontend Engineer",
        matchPercentage: 40,
        strengthSkills: ["react"],
        gapSkills: ["typescript"],
        estimatedWeeksToReady: 6,
      },
    ],
    nextSkillsToLearn: ["typescript"],
    learningPlan: [{ phase: "0-30 Days", focus: "Foundations", tasks: ["Practice typescript"] }],
    projectSuggestions: [{ level: "Beginner", title: "Starter", mappedSkills: ["react"], outcome: "Build basics" }],
    savedCareerPaths: [],
    feedbackSummary: { total: 0, relevantCount: 0 },
    applicationReadiness: { resumeReady: false, githubPortfolioReady: false, interviewReady: false },
    learningStats: { streakDays: 0, hoursThisWeek: 0 },
  },
};

describe("MyDashboardTab", () => {
  it("renders readiness scorecard and learning plan", () => {
    render(<MyDashboardTab token="abc" dashboard={dashboard} analytics={{}} onRefresh={() => {}} />);
    expect(screen.getByText("Role Readiness Scorecard")).toBeInTheDocument();
    expect(screen.getByText("30/60/90 Day Learning Plan")).toBeInTheDocument();
    expect(screen.getByText("Saved Career Paths")).toBeInTheDocument();
  });
});

import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { TopBar } from "../components/TopBar";
import { JobsTab } from "../components/JobsTab";
import { SkillsTab } from "../components/SkillsTab";
import { MyDashboardTab } from "../components/MyDashboardTab";

export const DashboardPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("my-dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const [dashboardData, analyticsData] = await Promise.all([
        api.dashboard(token),
        api.analytics(token),
      ]);
      const data = dashboardData;
      setDashboard(data);
      setAnalytics(analyticsData.analytics);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSaveSkill = async (skill) => {
    await api.saveSkill(token, skill);
    loadDashboard();
  };

  return (
    <main className="dashboard-layout">
      <TopBar
        title="Personalized Skill Intelligence"
        subtitle="Compare your profile with industry roles, close your skill gaps, and discover trending opportunities."
      />

      <section className="tab-switcher">
        <button
          className={activeTab === "my-dashboard" ? "active" : ""}
          onClick={() => setActiveTab("my-dashboard")}
        >
          My Dashboard
        </button>
        <button
          className={activeTab === "jobs" ? "active" : ""}
          onClick={() => setActiveTab("jobs")}
        >
          Jobs
        </button>
        <button
          className={activeTab === "skills" ? "active" : ""}
          onClick={() => setActiveTab("skills")}
        >
          Skills
        </button>
      </section>

      {error ? <p className="error">{error}</p> : null}
      {!dashboard ? <p>Loading dashboard...</p> : null}

      {dashboard && activeTab === "my-dashboard" ? (
        <MyDashboardTab token={token} dashboard={dashboard} analytics={analytics} onRefresh={loadDashboard} />
      ) : null}

      {dashboard && activeTab === "jobs" ? (
        <JobsTab
          recommendations={dashboard.recommendations}
        />
      ) : null}

      {dashboard && activeTab === "skills" ? (
        <SkillsTab
          token={token}
          trendingSkills={dashboard.trendingSkills}
          savedSkills={dashboard.profile.savedSkills}
          onSaveSkill={handleSaveSkill}
        />
      ) : null}
    </main>
  );
};

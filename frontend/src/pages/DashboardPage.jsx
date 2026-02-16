import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { TopBar } from "../components/TopBar";
import { JobsTab } from "../components/JobsTab";
import { SkillsTab } from "../components/SkillsTab";

export const DashboardPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("jobs");
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const data = await api.dashboard(token);
      setDashboard(data);
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

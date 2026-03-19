import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const STATUS_LABELS = {
  not_started: "Not Started",
  in_progress: "Learning",
  practicing: "Practicing",
  job_ready: "Job Ready",
  completed: "Completed",
};

const emptyPath = { company: "", role: "", targetDate: "", notes: "", status: "planned" };

export const MyDashboardTab = ({ token, dashboard, analytics, onRefresh }) => {
  const personal = dashboard?.personalDashboard;
  const [goals, setGoals] = useState({
    targetRole: personal?.careerGoals?.targetRole || "",
    backupRole: personal?.careerGoals?.backupRole || "",
    experienceLevel: personal?.profileSnapshot?.experienceLevel || "Fresher",
  });
  const [newPath, setNewPath] = useState(emptyPath);
  const [careerPaths, setCareerPaths] = useState(personal?.savedCareerPaths || []);
  const [careerPathMessage, setCareerPathMessage] = useState("");
  const [comparePayload, setComparePayload] = useState({ roleA: "", roleB: "" });
  const [comparison, setComparison] = useState(null);
  const [feedback, setFeedback] = useState({
    company: "",
    jobRole: "",
    relevant: true,
    reason: "",
  });
  const [resumeProfile, setResumeProfile] = useState(personal?.resumeProfile || { headline: "", summary: "", achievements: [] });
  const [portfolio, setPortfolio] = useState(personal?.portfolioProjects || []);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    skills: "",
    githubUrl: "",
    liveUrl: "",
    status: "idea",
  });
  const [reminders, setReminders] = useState(personal?.reminders || []);
  const [reminderMessage, setReminderMessage] = useState("");

  useEffect(() => {
    setGoals({
      targetRole: personal?.careerGoals?.targetRole || "",
      backupRole: personal?.careerGoals?.backupRole || "",
      experienceLevel: personal?.profileSnapshot?.experienceLevel || "Fresher",
    });
    setCareerPaths(personal?.savedCareerPaths || []);
    setResumeProfile(personal?.resumeProfile || { headline: "", summary: "", achievements: [] });
    setPortfolio(personal?.portfolioProjects || []);
    setReminders(personal?.reminders || []);
  }, [personal]);

  const roleOptions = useMemo(
    () => [...new Set((dashboard?.recommendations || []).map((item) => item.role))],
    [dashboard]
  );

  const companyRoleLookup = useMemo(() => {
    const lookup = new Map();
    (dashboard?.recommendations || []).forEach((item) => {
      if (!lookup.has(item.company)) lookup.set(item.company, []);
      lookup.get(item.company).push(item.role);
    });
    return lookup;
  }, [dashboard]);

  const companyOptions = useMemo(() => [...companyRoleLookup.keys()], [companyRoleLookup]);
  const newPathRoleOptions = useMemo(
    () => (newPath.company ? companyRoleLookup.get(newPath.company) || [] : []),
    [companyRoleLookup, newPath.company]
  );

  const updateGoals = async () => {
    await api.updateGoals(token, goals);
    onRefresh();
  };

  const updateSkillStatus = async (skill, status) => {
    await api.updateProgress(token, {
      skill,
      status,
      confidence: status === "job_ready" ? 4 : 2,
    });
    onRefresh();
  };

  const handleAddPath = async () => {
    const payload = {
      company: String(newPath.company || "").trim(),
      role: String(newPath.role || "").trim(),
      targetDate: String(newPath.targetDate || "").trim(),
      notes: String(newPath.notes || "").trim(),
      status: String(newPath.status || "planned").trim(),
    };

    if (!payload.company || !payload.role) {
      setCareerPathMessage("Select both company and role before saving.");
      return;
    }
    try {
      const data = await api.addCareerPath(token, payload);
      if (data?.careerPath) {
        setCareerPaths((prev) => [...prev, data.careerPath]);
      }
      setCareerPathMessage("Career path saved.");
      setNewPath(emptyPath);
      onRefresh();
    } catch (error) {
      setCareerPathMessage(error.message || "Failed to save career path.");
    }
  };

  const handlePathStatus = async (pathId, status) => {
    try {
      await api.updateCareerPath(token, pathId, { status });
      setCareerPaths((prev) => prev.map((path) => (path.id === pathId ? { ...path, status } : path)));
      onRefresh();
    } catch (error) {
      setCareerPathMessage(error.message || "Failed to update path.");
    }
  };

  const handleDeletePath = async (pathId) => {
    try {
      await api.deleteCareerPath(token, pathId);
      setCareerPaths((prev) => prev.filter((path) => path.id !== pathId));
      onRefresh();
    } catch (error) {
      setCareerPathMessage(error.message || "Failed to delete path.");
    }
  };

  const runComparison = async () => {
    if (!comparePayload.roleA || !comparePayload.roleB) return;
    const data = await api.compareRoles(token, comparePayload);
    setComparison(data.comparison);
  };

  const submitFeedback = async () => {
    if (!feedback.jobRole) return;
    await api.feedbackDetailed(token, feedback);
    setFeedback({ company: "", jobRole: "", relevant: true, reason: "" });
    onRefresh();
  };

  const saveResume = async () => {
    await api.updateResumeProfile(token, resumeProfile);
    onRefresh();
  };

  const downloadResume = () => {
    const lines = [
      resumeProfile.headline,
      resumeProfile.summary,
      "",
      "Key Achievements:",
      ...(resumeProfile.achievements || []),
      "",
      "Skills:",
      ...(dashboard?.profile?.knownSkills || []),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resume.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const addPortfolioProject = async () => {
    if (!portfolioForm.title.trim()) return;
    const payload = {
      title: portfolioForm.title.trim(),
      description: portfolioForm.description.trim(),
      skills: portfolioForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      githubUrl: portfolioForm.githubUrl.trim(),
      liveUrl: portfolioForm.liveUrl.trim(),
      status: portfolioForm.status,
    };
    const data = await api.addPortfolioProject(token, payload);
    if (data?.project) {
      setPortfolio((prev) => [...prev, data.project]);
      setPortfolioForm({ title: "", description: "", skills: "", githubUrl: "", liveUrl: "", status: "idea" });
    }
    onRefresh();
  };

  const removePortfolioProject = async (id) => {
    await api.deletePortfolioProject(token, id);
    setPortfolio((prev) => prev.filter((item) => item._id !== id));
    onRefresh();
  };

  const saveReminders = async () => {
    await api.updateReminders(token, { reminders });
    setReminderMessage("Reminders updated.");
    onRefresh();
  };

  if (!personal) return null;

  return (
    <section className="tab-content">
      <div className="dual-grid mydash-top-grid">
        <article className="panel skills-panel">
          <h3 className="skills-title">Profile Snapshot</h3>
          <div className="metric-grid compact">
            <div className="metric-card">
              <p>Experience</p>
              <h3>{personal.profileSnapshot.experienceLevel}</h3>
            </div>
            <div className="metric-card">
              <p>Known Skills</p>
              <h3>{personal.profileSnapshot.knownSkillsCount}</h3>
            </div>
            <div className="metric-card">
              <p>Profile Complete</p>
              <h3>{personal.profileSnapshot.profileCompleteness}%</h3>
            </div>
          </div>
          <div className="metric-grid compact">
            {Object.entries(personal.progressTracker || {}).map(([status, count]) => (
              <div key={status} className="metric-card">
                <p>{STATUS_LABELS[status] || status}</p>
                <h3>{count}</h3>
              </div>
            ))}
          </div>
        </article>

        <article className="panel skills-panel">
          <h3 className="skills-title">Career Goals</h3>
          <div className="goal-form-grid">
            <label>
              Target Role
              <select
                className="goals-select"
                value={goals.targetRole}
                onChange={(e) => setGoals((prev) => ({ ...prev, targetRole: e.target.value }))}
              >
                <option value="">Select target role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Backup Role
              <select
                className="goals-select"
                value={goals.backupRole}
                onChange={(e) => setGoals((prev) => ({ ...prev, backupRole: e.target.value }))}
              >
                <option value="">Select backup role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Level
              <select
                className="goals-select"
                value={goals.experienceLevel}
                onChange={(e) => setGoals((prev) => ({ ...prev, experienceLevel: e.target.value }))}
              >
                <option>Fresher</option>
                <option>Beginner</option>
                <option>Intermediate</option>
              </select>
            </label>
          </div>
          <button className="ghost-btn" onClick={updateGoals}>
            Save Goals
          </button>
        </article>
      </div>

      <article className="panel skills-panel">
        <h3 className="skills-title">Role Readiness Scorecard</h3>
        <div className="all-roles-grid">
          {(personal.roleReadinessScorecard || []).map((item) => (
            <div key={`${item.company}-${item.role}`} className="panel role-detail-card">
              <div className="job-head">
                <h3>{item.role}</h3>
                <span>Match {item.matchPercentage}%</span>
              </div>
              <p className="subtitle">{item.company}</p>
              <p className="job-label">Strong Skills</p>
              <div className="chips">
                {item.strengthSkills.length ? item.strengthSkills.map((skill) => (
                  <span key={`${item.role}-strength-${skill}`} className="chip success">
                    {skill}
                  </span>
                )) : <span className="chip">No strong skills yet</span>}
              </div>
              <p className="job-label">Gap Skills</p>
              <div className="chips">
                {item.gapSkills.map((skill) => (
                  <span key={`${item.role}-gap-${skill}`} className="chip missing">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="subtitle">Estimated time to ready: {item.estimatedWeeksToReady} weeks</p>
            </div>
          ))}
        </div>
      </article>

      <div className="dual-grid">
        <article className="panel skills-panel">
          <h3 className="skills-title">Next 3 Skills to Learn</h3>
          <p className="subtitle">Click a status to track progress per skill.</p>
          {(personal.nextSkillsToLearn || []).map((skill) => (
            <div key={skill} className="progress-row">
              <strong>{skill}</strong>
              <div className="chips">
                <button className="chip action" onClick={() => updateSkillStatus(skill, "in_progress")}>
                  Learning
                </button>
                <button className="chip action" onClick={() => updateSkillStatus(skill, "practicing")}>
                  Practicing
                </button>
                <button className="chip action" onClick={() => updateSkillStatus(skill, "job_ready")}>
                  Job Ready
                </button>
              </div>
            </div>
          ))}
        </article>

        <article className="panel skills-panel">
          <h3 className="skills-title">30/60/90 Day Learning Plan</h3>
          <div className="roadmap-grid">
            {(personal.learningPlan || []).map((phase) => (
              <div key={phase.phase} className="roadmap-step">
                <p className="roadmap-phase">{phase.phase}</p>
                <p className="roadmap-time">{phase.focus}</p>
                <ul className="roadmap-list">
                  {phase.tasks.map((task) => (
                    <li key={`${phase.phase}-${task}`}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="dual-grid">
        <article className="panel skills-panel">
          <h3 className="skills-title">Saved Career Paths</h3>
          <div className="goal-form-grid">
            <label>
              Company
              <select
                className="goals-select"
                value={newPath.company}
                onChange={(e) => setNewPath((prev) => ({ ...prev, company: e.target.value, role: "" }))}
              >
                <option value="">Select company</option>
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Role
              <select
                className="goals-select"
                value={newPath.role}
                onChange={(e) => setNewPath((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="">Select role</option>
                {newPathRoleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Target Date
              <input
                type="date"
                value={newPath.targetDate}
                onChange={(e) => setNewPath((prev) => ({ ...prev, targetDate: e.target.value }))}
              />
            </label>
          </div>
          <label>
            Notes
            <input
              value={newPath.notes}
              onChange={(e) => setNewPath((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Why this path?"
            />
          </label>
          <button className="ghost-btn" onClick={handleAddPath}>
            Save Career Path
          </button>
          {careerPathMessage ? <p className="subtitle">{careerPathMessage}</p> : null}
          <ul className="job-list related-job-list">
            {careerPaths.map((path) => (
              <li key={path.id} className="related-job-item">
                <div>
                  <strong className="related-company">{path.company}</strong>
                  <span className="related-role">{path.role}</span>
                  <span className="related-role">{path.targetDate || "No target date"}</span>
                  <span className="related-role">Status: {path.status}</span>
                </div>
                <div className="chips">
                  <button className="chip action" onClick={() => handlePathStatus(path.id, "active")}>
                    Active
                  </button>
                  <button className="chip action" onClick={() => handlePathStatus(path.id, "completed")}>
                    Done
                  </button>
                  <button className="chip missing" onClick={() => handleDeletePath(path.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {!careerPaths.length ? (
              <li className="related-job-item">
                <span className="related-role">No career paths saved yet.</span>
              </li>
            ) : null}
          </ul>
        </article>

        <article className="panel skills-panel">
          <h3 className="skills-title">Role Comparison</h3>
          <div className="goal-form-grid">
            <label>
              Role A
              <select
                className="goals-select"
                value={comparePayload.roleA}
                onChange={(e) => setComparePayload((prev) => ({ ...prev, roleA: e.target.value }))}
              >
                <option value="">Select role</option>
                {roleOptions.map((role) => (
                  <option key={`a-${role}`} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Role B
              <select
                className="goals-select"
                value={comparePayload.roleB}
                onChange={(e) => setComparePayload((prev) => ({ ...prev, roleB: e.target.value }))}
              >
                <option value="">Select role</option>
                {roleOptions.map((role) => (
                  <option key={`b-${role}`} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="ghost-btn" onClick={runComparison}>
            Compare Roles
          </button>
          {comparison ? (
            <div className="compare-box">
              <p>
                <strong>{comparison.roleA.role}</strong> ({comparison.roleA.matchPercentage}%)
              </p>
              <p>
                <strong>{comparison.roleB.role}</strong> ({comparison.roleB.matchPercentage}%)
              </p>
              <p className="job-label">Common Skills</p>
              <div className="chips">
                {comparison.summary.commonSkills.map((skill) => (
                  <span key={`common-${skill}`} className="chip success">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </div>

      <article className="panel skills-panel">
        <h3 className="skills-title">Project Suggestions (Recruiter Style)</h3>
        <div className="all-roles-grid">
          {(personal.projectSuggestions || []).map((project) => (
            <div key={project.title} className="panel role-detail-card">
              <p className="match-pill">{project.level}</p>
              <h3>{project.title}</h3>
              <p className="subtitle">{project.outcome}</p>
              <div className="chips">
                {project.mappedSkills.map((skill) => (
                  <span key={`${project.title}-${skill}`} className="chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="dual-grid">
        <article className="panel skills-panel">
          <h3 className="skills-title">Portfolio Hub</h3>
          <div className="goal-form-grid">
            <label>
              Project Title
              <input value={portfolioForm.title} onChange={(e) => setPortfolioForm((p) => ({ ...p, title: e.target.value }))} />
            </label>
            <label>
              Status
              <select
                className="goals-select"
                value={portfolioForm.status}
                onChange={(e) => setPortfolioForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="idea">Idea</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <input value={portfolioForm.description} onChange={(e) => setPortfolioForm((p) => ({ ...p, description: e.target.value }))} />
          </label>
          <label>
            Skills (comma separated)
            <input value={portfolioForm.skills} onChange={(e) => setPortfolioForm((p) => ({ ...p, skills: e.target.value }))} />
          </label>
          <div className="goal-form-grid">
            <label>
              GitHub URL
              <input value={portfolioForm.githubUrl} onChange={(e) => setPortfolioForm((p) => ({ ...p, githubUrl: e.target.value }))} />
            </label>
            <label>
              Live URL
              <input value={portfolioForm.liveUrl} onChange={(e) => setPortfolioForm((p) => ({ ...p, liveUrl: e.target.value }))} />
            </label>
          </div>
          <button className="ghost-btn" onClick={addPortfolioProject}>Add Project</button>
          <ul className="job-list related-job-list">
            {portfolio.map((item) => (
              <li key={item._id} className="related-job-item">
                <div>
                  <strong className="related-company">{item.title}</strong>
                  <span className="related-role">{item.description || "No description"}</span>
                  <span className="related-role">Status: {item.status}</span>
                </div>
                <button className="chip missing" onClick={() => removePortfolioProject(item._id)}>Remove</button>
              </li>
            ))}
            {!portfolio.length ? (
              <li className="related-job-item">
                <span className="related-role">No projects added yet.</span>
              </li>
            ) : null}
          </ul>
        </article>

        <article className="panel skills-panel">
          <h3 className="skills-title">Resume Builder</h3>
          <label>
            Headline
            <input
              value={resumeProfile.headline}
              onChange={(e) => setResumeProfile((p) => ({ ...p, headline: e.target.value }))}
              placeholder="Frontend Engineer | React | TypeScript"
            />
          </label>
          <label>
            Summary
            <input
              value={resumeProfile.summary}
              onChange={(e) => setResumeProfile((p) => ({ ...p, summary: e.target.value }))}
              placeholder="2-3 lines about your strengths and goals"
            />
          </label>
          <label>
            Achievements (comma separated)
            <input
              value={(resumeProfile.achievements || []).join(", ")}
              onChange={(e) =>
                setResumeProfile((p) => ({
                  ...p,
                  achievements: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                }))
              }
            />
          </label>
          <div className="chips">
            <button className="ghost-btn" onClick={saveResume}>Save Resume</button>
            <button className="primary-btn" onClick={downloadResume}>Download</button>
          </div>
        </article>
      </div>

      <article className="panel skills-panel">
        <h3 className="skills-title">Learning Reminders</h3>
        <div className="goal-form-grid">
          <label>
            Weekly Goal Reminder
            <select
              className="goals-select"
              value={reminders[0]?.enabled ? "on" : "off"}
              onChange={(e) => setReminders([{ label: "Weekly Goal", frequency: "weekly", enabled: e.target.value === "on" }])}
            >
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </select>
          </label>
          <label>
            Frequency
            <select
              className="goals-select"
              value={reminders[0]?.frequency || "weekly"}
              onChange={(e) => setReminders([{ label: "Weekly Goal", frequency: e.target.value, enabled: reminders[0]?.enabled ?? true }])}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
        </div>
        <button className="ghost-btn" onClick={saveReminders}>Save Reminders</button>
        {reminderMessage ? <p className="subtitle">{reminderMessage}</p> : null}
      </article>

      <div className="dual-grid">
        <article className="panel skills-panel">
          <h3 className="skills-title">Recommendation Feedback Loop</h3>
          <div className="goal-form-grid">
            <label>
              Company
              <select
                className="goals-select"
                value={feedback.company}
                onChange={(e) => setFeedback((prev) => ({ ...prev, company: e.target.value }))}
              >
                <option value="">Optional</option>
                {companyOptions.map((company) => (
                  <option key={`feedback-company-${company}`} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Role
              <select
                className="goals-select"
                value={feedback.jobRole}
                onChange={(e) => setFeedback((prev) => ({ ...prev, jobRole: e.target.value }))}
              >
                <option value="">Select role</option>
                {roleOptions.map((role) => (
                  <option key={`feedback-role-${role}`} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Relevant?
              <select
                className="goals-select"
                value={feedback.relevant ? "yes" : "no"}
                onChange={(e) => setFeedback((prev) => ({ ...prev, relevant: e.target.value === "yes" }))}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>
          <label>
            Reason
            <input
              value={feedback.reason}
              onChange={(e) => setFeedback((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Example: I need cloud-first backend roles"
            />
          </label>
          <button className="ghost-btn" onClick={submitFeedback}>
            Save Feedback
          </button>
          <p className="subtitle">
            Feedback submitted: {personal.feedbackSummary?.total || 0} |
            Relevant: {personal.feedbackSummary?.relevantCount || 0}
          </p>
        </article>

        <article className="panel skills-panel">
          <h3 className="skills-title">Platform Analytics</h3>
          <ul className="job-list">
            <li>Total Users: {analytics?.totalUsers || 0}</li>
            <li>Total Roles: {analytics?.totalJobs || 0}</li>
          </ul>
          <p className="job-label">Top Target Roles</p>
          <div className="chips">
            {(analytics?.topTargetRoles || []).map((item) => (
              <span key={`target-${item.name}`} className="chip trend">
                {item.name} ({item.count})
              </span>
            ))}
          </div>
          <p className="job-label">Most Saved Skills</p>
          <div className="chips">
            {(analytics?.mostSavedSkills || []).map((item) => (
              <span key={`saved-${item.name}`} className="chip">
                {item.name} ({item.count})
              </span>
            ))}
          </div>
        </article>
      </div>

      <article className="panel skills-panel">
        <h3 className="skills-title">Application Readiness</h3>
        <ul className="job-list">
          <li>Resume Ready: {personal.applicationReadiness.resumeReady ? "Yes" : "No"}</li>
          <li>GitHub Portfolio Ready: {personal.applicationReadiness.githubPortfolioReady ? "Yes" : "No"}</li>
          <li>Interview Ready: {personal.applicationReadiness.interviewReady ? "Yes" : "No"}</li>
          <li>Learning Streak: {personal.learningStats.streakDays} days</li>
          <li>Hours This Week: {personal.learningStats.hoursThisWeek}</li>
        </ul>
      </article>
    </section>
  );
};

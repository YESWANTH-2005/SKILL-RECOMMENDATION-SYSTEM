import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const companyDescriptions = {
  Google: "A global technology company focused on search, cloud, AI, and modern web platforms used by billions.",
  Microsoft: "An enterprise and cloud leader building productivity, developer, and backend systems for global businesses.",
  Amazon: "A technology and e-commerce giant known for large-scale platforms, operations, and data-driven decisions.",
  Netflix: "A streaming and product engineering company that uses data, machine learning, and cloud-native architectures.",
  Adobe: "A digital experience and creative software company focused on design systems, user experience, and web tools.",
  Meta: "A social and immersive technology company building large-scale platforms for communication and digital experiences.",
  Apple: "A consumer technology company known for tightly integrated hardware, software, and premium product ecosystems.",
  IBM: "An enterprise technology company focused on hybrid cloud, consulting, data, and secure business solutions.",
  Oracle: "A global software and cloud company known for database technology and enterprise infrastructure products.",
  Salesforce: "A cloud CRM leader helping organizations manage customer relationships and business workflows.",
  SAP: "An enterprise software company focused on ERP, business process integration, and large-scale operations.",
  Intel: "A semiconductor and platform engineering company focused on processors, firmware, and hardware innovation.",
  NVIDIA: "A computing company leading GPU acceleration, AI platforms, and high-performance system development.",
  Cisco: "A networking and cybersecurity company building infrastructure for global communication systems.",
  Uber: "A mobility and logistics technology company driven by real-time systems and operational analytics.",
};

const buildRoadmap = (job) => {
  const skills = job.requiredSkills || [];
  const resources = (job.learningResources || []).map((item) => item.title);

  const getItem = (index, fallback) => skills[index] || resources[index] || fallback;

  return [
    {
      phase: "Phase 1: Foundations",
      timeline: "Week 1-2",
      items: [getItem(0, "Core fundamentals"), getItem(1, "Primary framework/tool")],
    },
    {
      phase: "Phase 2: Core Build Skills",
      timeline: "Week 3-4",
      items: [getItem(2, "Core implementation skill"), getItem(3, "Quality and best practices")],
    },
    {
      phase: "Phase 3: Applied Practice",
      timeline: "Week 5-6",
      items: [
        `Build one mini project using ${getItem(0, "core skills")}`,
        `Build one real-world project using ${getItem(2, "role-specific tools")}`,
      ],
    },
    {
      phase: "Phase 4: Production + Interview Prep",
      timeline: "Week 7-8",
      items: [getItem(4, "Advanced role skill"), "Revision, mock interviews, and portfolio polish"],
    },
  ];
};

export const RoleDetailPage = () => {
  const { company: companyParam, role: roleParam } = useParams();
  const company = decodeURIComponent(companyParam || "");
  const role = decodeURIComponent(roleParam || "");
  const { token } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.dashboard(token);
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err.message || "Failed to load role details");
      }
    };
    load();
  }, [token]);

  const job = useMemo(
    () => recommendations.find((item) => item.company === company && item.role === role),
    [recommendations, company, role]
  );
  const roadmap = useMemo(() => (job ? buildRoadmap(job) : []), [job]);

  const openLearningResource = (skill) => {
    if (!job?.learningResources?.length) return;
    const matched = job.learningResources.find((resource) =>
      resource.title.toLowerCase().includes(skill.toLowerCase().split(" ")[0])
    );
    const target = matched || job.learningResources[0];
    window.open(target.url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="dashboard-layout company-page-layout">
      <header className="company-page-header">
        <div>
          <p className="eyebrow">{company}</p>
          <h1>{role}</h1>
          <p className="subtitle">Tap any skill to open its learning material.</p>
        </div>
        <div className="company-page-actions">
          <button className="ghost-btn" onClick={() => navigate(`/dashboard/company/${encodeURIComponent(company)}`)}>
            Back to Roles
          </button>
          <Link className="primary-btn" to="/dashboard">Dashboard</Link>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {!error && !job ? (
        <article className="panel">
          <p className="subtitle">Role details not found.</p>
        </article>
      ) : null}

      {job ? (
        <section className="company-roles-list role-page-shell">
          <article className="panel role-hero-card">
            <div className="role-hero-top">
              <div className="company-tile-head">
                <h3>{job.role}</h3>
                <span className="mini-dot" />
              </div>
              <span className="match-badge">Match {job.matchPercentage}%</span>
            </div>
            <p className="company-description">
              {companyDescriptions[company] ||
                "A leading technology organization with strong demand for modern engineering skills."}
            </p>
            <div className="chips">
              <span className="chip">{company}</span>
              <span className="chip">{job.category}</span>
            </div>
          </article>

          <section className="role-content-grid">
            <article className="panel role-detail-card">
              <div className="job-section">
                <strong className="job-label">Required Skills (Tap any skill)</strong>
                <div className="chips">
                  {job.requiredSkills.map((skill) => (
                    <button
                      key={`required-${skill}`}
                      className="chip action"
                      onClick={() => openLearningResource(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel role-detail-card resources-block">
              <div className="job-section">
                <strong className="job-label">Roadmap: What To Study</strong>
                <div className="roadmap-grid">
                  {roadmap.map((step) => (
                    <div key={step.phase} className="roadmap-step">
                      <p className="roadmap-phase">{step.phase}</p>
                      <p className="roadmap-time">{step.timeline}</p>
                      <ul className="roadmap-list">
                        {step.items.map((item) => (
                          <li key={`${step.phase}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel role-detail-card resources-block">
              <div className="job-section">
                <strong className="job-label">Learning Resources</strong>
                <ul className="links-list resource-list">
                  {job.learningResources.map((resource) => (
                    <li key={resource.url}>
                      <a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </section>
        </section>
      ) : null}
    </main>
  );
};

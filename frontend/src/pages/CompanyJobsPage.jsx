import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const roleDescriptions = {
  "Frontend Engineer": "Build modern web interfaces with strong UX, performance, and accessibility practices.",
  "Site Reliability Engineer": "Improve platform reliability, monitoring, and incident response for large-scale systems.",
  "ML Engineer": "Design and productionize machine learning systems with robust data and model pipelines.",
  "Backend Engineer": "Develop secure and scalable APIs, services, and data layers.",
  "Cloud Engineer": "Build and operate cloud-native infrastructure, networking, and deployment pipelines.",
  "Power Platform Developer": "Create business apps and workflow automations using Microsoft Power Platform.",
  "Data Analyst": "Analyze datasets to generate insights, dashboards, and decision support metrics.",
  "DevOps Engineer": "Automate build, deployment, and operations with CI/CD and infrastructure tooling.",
  "QA Automation Engineer": "Ensure product quality through automated testing, API validation, and defect tracking.",
  "Platform Engineer": "Create internal platforms and systems that improve developer productivity and reliability.",
  "Data Engineer": "Build ETL pipelines and data platforms for analytics and machine learning workloads.",
  "Video QA Engineer": "Validate media quality, playback stability, and streaming behavior across devices.",
  "UI Engineer": "Implement polished UI systems and reusable front-end components for product experiences.",
  "Product Designer": "Design user-centered flows, prototypes, and visual systems for digital products.",
  "Security Engineer": "Protect applications and infrastructure through secure design and risk mitigation.",
};

export const CompanyJobsPage = () => {
  const { company: companyParam } = useParams();
  const company = decodeURIComponent(companyParam || "");
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
        setError(err.message || "Failed to load company roles");
      }
    };
    load();
  }, [token]);

  const companyJobs = useMemo(
    () =>
      recommendations
        .filter((item) => item.company === company)
        .sort((a, b) => b.matchPercentage - a.matchPercentage),
    [recommendations, company]
  );

  return (
    <main className="dashboard-layout company-page-layout">
      <header className="company-page-header">
        <div>
          <p className="eyebrow">Company Roles</p>
          <h1>{company}</h1>
          <p className="subtitle">Tap any skill chip to open learning material directly.</p>
        </div>
        <div className="company-page-actions">
          <button className="ghost-btn" onClick={() => navigate("/dashboard")}>Back to Jobs</button>
          <Link className="primary-btn" to="/dashboard">Dashboard</Link>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {!error && !companyJobs.length ? (
        <article className="panel">
          <p className="subtitle">No roles found for this company.</p>
        </article>
      ) : null}

      {companyJobs.length ? (
        <section className="company-roles-list">
          {companyJobs.map((job) => (
            <button
              key={`${job.company}-${job.role}`}
              className="panel role-nav-card"
              onClick={() =>
                navigate(`/dashboard/company/${encodeURIComponent(company)}/role/${encodeURIComponent(job.role)}`)
              }
            >
              <div className="company-tile-head">
                <h3>{job.role}</h3>
                <span className="mini-dot" />
              </div>
              <p className="company-description">
                {roleDescriptions[job.role] || "Role-focused responsibilities and growth path details."}
              </p>
              <div className="chips">
                <span className="chip">{job.category}</span>
                <span className="chip">Match {job.matchPercentage}%</span>
              </div>
            </button>
          ))}
        </section>
      ) : null}
    </main>
  );
};

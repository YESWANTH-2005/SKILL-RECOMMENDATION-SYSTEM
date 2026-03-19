import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { TopBar } from "../components/TopBar";

const emptyJob = {
  company: "",
  role: "",
  category: "",
  requiredSkills: "",
  learningResources: "",
};

export const AdminPage = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyJob);
  const [message, setMessage] = useState("");

  const loadJobs = async (page = 1) => {
    try {
      const data = await api.adminJobs(token, { page, limit: 8, q: query });
      setJobs(data.jobs || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      setMessage(error.message || "Failed to load jobs");
    }
  };

  useEffect(() => {
    loadJobs(1);
  }, [query]);

  const handleCreate = async () => {
    try {
      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        category: form.category.trim(),
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        learningResources: form.learningResources
          .split("\n")
          .map((line) => {
            const [title, url] = line.split("|").map((s) => s.trim());
            if (!title || !url) return null;
            return { title, url };
          })
          .filter(Boolean),
      };
      await api.adminCreateJob(token, payload);
      setForm(emptyJob);
      setMessage("Job added.");
      loadJobs(pagination.page);
    } catch (error) {
      setMessage(error.message || "Failed to add job");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.adminDeleteJob(token, id);
      setMessage("Job deleted.");
      loadJobs(pagination.page);
    } catch (error) {
      setMessage(error.message || "Failed to delete job");
    }
  };

  return (
    <main className="dashboard-layout">
      <TopBar
        title="Admin Console"
        subtitle="Manage company roles and learning resources."
      />

      <section className="panel skills-panel">
        <h3 className="skills-title">Add New Job Role</h3>
        <div className="goal-form-grid">
          <label>
            Company
            <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
          </label>
          <label>
            Role
            <input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} />
          </label>
          <label>
            Category
            <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
          </label>
        </div>
        <label>
          Required Skills (comma separated)
          <input
            value={form.requiredSkills}
            onChange={(e) => setForm((p) => ({ ...p, requiredSkills: e.target.value }))}
          />
        </label>
        <label>
          Learning Resources (one per line: `Title | URL`)
          <textarea
            className="admin-textarea"
            rows={4}
            value={form.learningResources}
            onChange={(e) => setForm((p) => ({ ...p, learningResources: e.target.value }))}
          />
        </label>
        <button className="primary-btn" onClick={handleCreate}>Create Job</button>
        {message ? <p className="subtitle">{message}</p> : null}
      </section>

      <section className="panel skills-panel">
        <h3 className="skills-title">Job Catalog</h3>
        <label>
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, category" />
        </label>
        <div className="job-grid">
          {jobs.map((job) => (
            <article key={job._id} className="panel role-detail-card">
              <div className="job-head">
                <h3>{job.role}</h3>
                <span>{job.company}</span>
              </div>
              <p className="subtitle">{job.category}</p>
              <div className="chips">
                {(job.requiredSkills || []).slice(0, 6).map((skill) => (
                  <span key={`${job._id}-${skill}`} className="chip">{skill}</span>
                ))}
              </div>
              <button className="chip missing" onClick={() => handleDelete(job._id)}>Delete</button>
            </article>
          ))}
        </div>
        <div className="jobs-filter-actions">
          <button className="ghost-btn" onClick={() => loadJobs(Math.max(1, pagination.page - 1))}>
            Prev
          </button>
          <button className="ghost-btn" onClick={() => loadJobs(Math.min(pagination.totalPages, pagination.page + 1))}>
            Next
          </button>
        </div>
      </section>
    </main>
  );
};

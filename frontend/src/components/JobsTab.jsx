import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const JobsTab = ({ recommendations = [] }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const companyDescriptions = {
    Google:
      "A global technology company focused on search, cloud, AI, and modern web platforms used by billions.",
    Microsoft:
      "An enterprise and cloud leader building productivity, developer, and backend systems for global businesses.",
    Amazon:
      "A technology and e-commerce giant known for large-scale platforms, operations, and data-driven decisions.",
    Netflix:
      "A streaming and product engineering company that uses data, machine learning, and cloud-native architectures.",
    Adobe:
      "A digital experience and creative software company focused on design systems, user experience, and web tools.",
    Meta:
      "A social and immersive technology company building large-scale platforms for communication and digital experiences.",
    Apple:
      "A consumer technology company known for tightly integrated hardware, software, and premium product ecosystems.",
    IBM:
      "An enterprise technology company focused on hybrid cloud, consulting, data, and secure business solutions.",
    Oracle:
      "A global software and cloud company known for database technology and enterprise infrastructure products.",
    Salesforce:
      "A cloud CRM leader helping organizations manage customer relationships and business workflows.",
    SAP:
      "An enterprise software company focused on ERP, business process integration, and large-scale operations.",
    Intel:
      "A semiconductor and platform engineering company focused on processors, firmware, and hardware innovation.",
    NVIDIA:
      "A computing company leading GPU acceleration, AI platforms, and high-performance system development.",
    Cisco:
      "A networking and cybersecurity company building infrastructure for global communication systems.",
    Uber:
      "A mobility and logistics technology company driven by real-time systems and operational analytics.",
  };

  const companies = useMemo(() => [...new Set(recommendations.map((item) => item.company))], [recommendations]);

  const companyCards = useMemo(
    () =>
      companies
        .map((company) =>
          recommendations
            .filter((item) => item.company === company)
            .sort((a, b) => b.matchPercentage - a.matchPercentage)[0]
        )
        .filter(Boolean),
    [companies, recommendations]
  );

  const roleOptions = useMemo(
    () => ["All", ...new Set(recommendations.map((item) => item.role).sort())],
    [recommendations]
  );

  const categoryOptions = useMemo(
    () => ["All", ...new Set(recommendations.map((item) => item.category).sort())],
    [recommendations]
  );

  const filteredCompanyCards = useMemo(() => {
    const term = query.toLowerCase().trim();

    return companyCards.filter((job) => {
      const companyRoles = recommendations
        .filter((item) => item.company === job.company)
        .map((item) => item.role);
      const companyCategories = recommendations
        .filter((item) => item.company === job.company)
        .map((item) => item.category);

      const text = `${job.company} ${job.role} ${job.category} ${companyRoles.join(" ")} ${companyCategories.join(" ")}`.toLowerCase();
      const queryMatch = !term || text.includes(term);
      const roleMatch = roleFilter === "All" || companyRoles.includes(roleFilter);
      const categoryMatch = categoryFilter === "All" || companyCategories.includes(categoryFilter);

      return queryMatch && roleMatch && categoryMatch;
    });
  }, [companyCards, query, roleFilter, categoryFilter, recommendations]);

  const handleOpenCompany = (company) => {
    navigate(`/dashboard/company/${encodeURIComponent(company)}`);
  };

  return (
    <section className="tab-content">
      <div className="panel jobs-search-panel">
        <div className="jobs-filter-grid">
          <label className="jobs-search-label">
            Search Companies
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, role, or category..."
            />
          </label>

          <label className="jobs-search-label">
            Job Role
            <select
              className="jobs-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          <label className="jobs-search-label">
            Category
            <select
              className="jobs-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="jobs-filter-actions">
          <button
            className="ghost-btn"
            onClick={() => {
              setQuery("");
              setRoleFilter("All");
              setCategoryFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="company-selector-grid">
        {filteredCompanyCards.map((job) => (
          <button
            key={job.company}
            className="panel company-tile"
            onClick={() => handleOpenCompany(job.company)}
          >
            <div className="company-tile-head">
              <h3>{job.company}</h3>
              <span className="mini-dot" />
            </div>
            <p className="company-description">
              {companyDescriptions[job.company] ||
                "A leading technology organization with strong demand for modern engineering skills."}
            </p>
            <div className="chips">
              <span className="chip">{job.category}</span>
              <span className="chip">{job.role}</span>
            </div>
          </button>
        ))}
      </div>

      {!filteredCompanyCards.length ? (
        <article className="panel">
          <p className="subtitle">No companies found for your search.</p>
        </article>
      ) : null}
    </section>
  );
};

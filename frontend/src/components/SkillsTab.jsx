import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export const SkillsTab = ({ token, trendingSkills = [], savedSkills = [], onSaveSkill }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryDetails, setCategoryDetails] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await api.skillCategories(token);
      setCategories(data.categories);
      if (data.categories.length) setSelectedCategory(data.categories[0]);
    };
    loadCategories();
  }, [token]);

  useEffect(() => {
    if (!selectedCategory) return;
    const loadDetails = async () => {
      const data = await api.categoryDetails(token, selectedCategory);
      setCategoryDetails(data);
    };
    loadDetails();
  }, [token, selectedCategory]);

  const mergedTrendingSkills = useMemo(
    () => [...(categoryDetails?.trendingSkills || []), ...trendingSkills].filter((value, index, arr) => arr.indexOf(value) === index),
    [categoryDetails, trendingSkills]
  );

  const beginnerSkills = (categoryDetails?.skills || []).slice(0, 4);
  const practiceSkills = (categoryDetails?.skills || []).slice(4, 8);

  const rolePaths = (categoryDetails?.relatedJobs || []).map((job) => ({
    ...job,
    firstResource: job.learningResources?.[0],
  }));

  const skillResourceRows = useMemo(() => {
    const skills = categoryDetails?.skills || [];
    const relatedJobs = categoryDetails?.relatedJobs || [];

    return skills.map((skill) => {
      const lowerSkill = skill.toLowerCase();
      let resource = null;

      for (const job of relatedJobs) {
        resource = (job.learningResources || []).find((item) => {
          const title = item.title.toLowerCase();
          const firstWord = lowerSkill.split(" ")[0];
          return title.includes(firstWord) || title.includes(lowerSkill);
        });
        if (resource) break;
      }

      if (!resource) {
        resource = relatedJobs[0]?.learningResources?.[0] || null;
      }

      return { skill, resource };
    });
  }, [categoryDetails]);

  return (
    <section className="tab-content">
      <div className="panel filters">
        <label>
          Skill Category
          <select
            className="skills-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="dual-grid skills-beginner-grid">
        <article className="panel skills-panel beginner-hero">
          <h3 className="skills-title">Fresher Guide for {selectedCategory || "Skills"}</h3>
          <p className="subtitle">
            Start small, build consistency, and focus on project-ready skills. Save skills as you complete them.
          </p>
          <div className="chips skills-chip-grid">
            {beginnerSkills.map((skill) => (
              <button
                key={skill}
                className={`chip action ${savedSkills.includes(skill) ? "saved" : ""}`}
                onClick={() => onSaveSkill(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </article>

        <article className="panel skills-panel">
          <h3 className="skills-title">Next Skills to Practice</h3>
          <p className="subtitle">After foundations, focus on these to become interview-ready.</p>
          <div className="chips skills-chip-grid">
            {practiceSkills.length ? practiceSkills.map((skill) => (
              <button
                key={skill}
                className={`chip action ${savedSkills.includes(skill) ? "saved" : ""}`}
                onClick={() => onSaveSkill(skill)}
              >
                {skill}
              </button>
            )) : <span className="chip">Add more skills in this category</span>}
          </div>
        </article>
      </div>

      <article className="panel skills-panel roadmap-panel">
        <h3 className="skills-title">Simple 4-Week Roadmap</h3>
        <div className="roadmap-grid">
          <div className="roadmap-step">
            <p className="roadmap-phase">Week 1</p>
            <ul className="roadmap-list">
              <li>Understand basics of the first 2 skills</li>
              <li>Build tiny practice tasks daily</li>
            </ul>
          </div>
          <div className="roadmap-step">
            <p className="roadmap-phase">Week 2</p>
            <ul className="roadmap-list">
              <li>Complete mini project using foundation skills</li>
              <li>Save completed skills in your profile</li>
            </ul>
          </div>
          <div className="roadmap-step">
            <p className="roadmap-phase">Week 3</p>
            <ul className="roadmap-list">
              <li>Learn next set of practical skills</li>
              <li>Improve project quality and debugging</li>
            </ul>
          </div>
          <div className="roadmap-step">
            <p className="roadmap-phase">Week 4</p>
            <ul className="roadmap-list">
              <li>Apply to role-based tasks from below</li>
              <li>Start interview preparation with projects</li>
            </ul>
          </div>
        </div>
      </article>

      <article className="panel skills-panel">
        <h3 className="skills-title">Career Paths You Can Target</h3>
        <ul className="job-list related-job-list">
          {rolePaths.map((job) => (
            <li key={`${job.company}-${job.role}`} className="related-job-item role-path-item">
              <div>
                <strong className="related-company">{job.company}</strong>
                <span className="related-role">{job.role}</span>
              </div>
              {job.firstResource ? (
                <a href={job.firstResource.url} target="_blank" rel="noreferrer" className="path-link">
                  Start Learning
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </article>

      <article className="panel skills-panel">
        <h3 className="skills-title">All Skills in This Category</h3>
        <div className="chips skills-chip-grid">
          {categoryDetails?.skills?.map((skill) => (
            <button
              key={skill}
              className={`chip action ${savedSkills.includes(skill) ? "saved" : ""}`}
              onClick={() => onSaveSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      </article>

      <article className="panel skills-panel">
        <h3 className="skills-title">Learning Resources by Skill</h3>
        <ul className="job-list related-job-list">
          {skillResourceRows.map((row) => (
            <li key={row.skill} className="related-job-item role-path-item">
              <div>
                <strong className="related-company">{row.skill}</strong>
                <span className="related-role">
                  {row.resource ? row.resource.title : "Resource unavailable"}
                </span>
              </div>
              {row.resource ? (
                <a href={row.resource.url} target="_blank" rel="noreferrer" className="path-link">
                  Open Resource
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </article>

      <article className="panel skills-panel">
        <h3 className="skills-title">Trending Skills</h3>
        <div className="chips trending-chip-grid">
          {mergedTrendingSkills.map((skill) => (
            <span key={skill} className="chip trend">{skill}</span>
          ))}
        </div>
      </article>

      <article className="panel skills-panel">
        <h3 className="skills-title">Beginner Tip</h3>
        <p className="subtitle">
          Do not learn everything at once. Pick one role, complete one project, and use that project for resume and interview answers.
        </p>
      </article>
    </section>
  );
};

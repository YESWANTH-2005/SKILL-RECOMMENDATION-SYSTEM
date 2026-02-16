import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";

const workflow = [
  "Sign up with known skills and interests",
  "Get role-wise skill match percentage",
  "Identify missing skills and resource links",
  "Track trending skills and save learning goals",
];

const highlights = [
  { label: "Stack", value: "MongoDB + Express + React + Node" },
  { label: "Core Engine", value: "Skill Match + Gap Analysis" },
  { label: "Dashboard", value: "Jobs Tab + Skills Tab" },
];

export const LandingPage = () => {
  const [trendingSkills, setTrendingSkills] = useState([]);

  useEffect(() => {
    const loadTrendingSkills = async () => {
      try {
        const data = await api.trendingSkillsPublic();
        setTrendingSkills(data.trendingSkills || []);
      } catch (error) {
        setTrendingSkills([
          "Generative AI",
          "MLOps",
          "TypeScript",
          "Cloud Security",
          "Data Engineering",
          "Prompt Engineering",
          "Kubernetes",
          "System Design",
        ]);
      }
    };
    loadTrendingSkills();
  }, []);

  return (
    <main className="landing-layout">
      <header className="landing-nav">
        <div className="brand">Skill Recommendation System</div>
        <nav>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="landing-nav-actions">
          <Link to="/login" className="ghost-btn">Login</Link>
          <Link to="/signup" className="primary-btn">Sign Up</Link>
        </div>
      </header>

      <section className="landing-hero">
        <p className="hero-badge">Trusted by skill-focused learners worldwide</p>
        <h1>Build Your Career Path with Smart Skill Intelligence</h1>
        <p className="subtitle">
          This platform analyzes your current skills against real job requirements, highlights gaps, and
          recommends focused learning resources to improve job readiness.
        </p>
        <div className="landing-cta">
          <Link to="/signup" className="primary-btn">Sign Up</Link>
          <Link to="/login" className="ghost-btn">Login</Link>
        </div>
      </section>

      <section className="panel landing-trending-panel">
        <h3>Trending Skills</h3>
        <div className="landing-ticker">
          <div className="landing-ticker-track">
            {[...trendingSkills, ...trendingSkills].map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="landing-trend-chip"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-grid" id="features">
        <article className="panel landing-card">
          <h3 id="how-it-works">How It Works</h3>
          <ul className="landing-list">
            {workflow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel landing-card" id="pricing">
          <h3>Platform Highlights</h3>
          <div className="landing-highlights">
            {highlights.map((item) => (
              <div key={item.label} className="highlight-item">
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};

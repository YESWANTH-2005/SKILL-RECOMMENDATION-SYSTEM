import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    knownSkills: [],
    interests: "",
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [showSkillList, setShowSkillList] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const skillBoxRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await api.publicSkillsList();
        setAvailableSkills(data.skills || []);
      } catch (err) {
        setAvailableSkills([]);
      }
    };
    loadSkills();
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!skillBoxRef.current?.contains(event.target)) {
        setShowSkillList(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toArray = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const filteredSkills = useMemo(() => {
    const query = skillQuery.toLowerCase().trim();
    if (!query) return availableSkills.slice(0, 40);
    return availableSkills
      .filter((skill) => skill.toLowerCase().includes(query))
      .slice(0, 40);
  }, [availableSkills, skillQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        knownSkills: form.knownSkills,
        interests: toArray(form.interests),
      });
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-card wide">
        <p className="eyebrow">Career Intelligence Platform</p>
        <h1>Create account</h1>
        <form onSubmit={handleSubmit} className="auth-form two-col">
          <label>
            Full Name
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>
          <label>
            Known Skills
            <div className="skill-picker-row" ref={skillBoxRef}>
              <input
                value={skillQuery}
                onChange={(e) => {
                  setSkillQuery(e.target.value);
                  setShowSkillList(true);
                }}
                onFocus={() => setShowSkillList(true)}
                placeholder="Search skills and click to add..."
              />
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  const selectedSkill = skillQuery.trim().toLowerCase();
                  if (!selectedSkill || !availableSkills.includes(selectedSkill)) return;
                  setForm((prev) => ({
                    ...prev,
                    knownSkills: prev.knownSkills.includes(selectedSkill)
                      ? prev.knownSkills
                      : [...prev.knownSkills, selectedSkill],
                  }));
                  setSkillQuery("");
                  setShowSkillList(false);
                }}
              >
                Add
              </button>
              {showSkillList ? (
                <div className="skills-dropdown-list">
                  {filteredSkills.length ? filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="skills-dropdown-item"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          knownSkills: prev.knownSkills.includes(skill)
                            ? prev.knownSkills
                            : [...prev.knownSkills, skill],
                        }));
                        setSkillQuery("");
                        setShowSkillList(false);
                      }}
                    >
                      {skill}
                    </button>
                  )) : <p className="skills-dropdown-empty">No matching skills</p>}
                </div>
              ) : null}
            </div>
            <div className="chips">
              {form.knownSkills.length ? form.knownSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="chip action"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      knownSkills: prev.knownSkills.filter((item) => item !== skill),
                    }))
                  }
                >
                  {skill} x
                </button>
              )) : <span className="chip">Add at least one skill</span>}
            </div>
          </label>
          <label className="full-row">
            Interests (optional)
            <input
              value={form.interests}
              onChange={(e) => setForm((prev) => ({ ...prev, interests: e.target.value }))}
              placeholder="machine learning, analytics"
            />
          </label>
          {error ? <p className="error full-row">{error}</p> : null}
          <button type="submit" className="primary-btn full-row" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
};

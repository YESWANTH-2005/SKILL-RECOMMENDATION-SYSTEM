const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const api = {
  signup: (payload) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  dashboard: (token) =>
    request("/recommendations/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  skillCategories: (token) =>
    request("/skills/categories", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  publicSkillsList: () => request("/skills/public/list"),
  categoryDetails: (token, category) =>
    request(`/skills/categories/${encodeURIComponent(category)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  saveSkill: (token, skill) =>
    request("/recommendations/save-skill", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skill }),
    }),
  feedback: (token, jobRole, rating) =>
    request("/recommendations/feedback", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ jobRole, rating }),
    }),
  trendingSkillsPublic: () => request("/public/trending-skills"),
};

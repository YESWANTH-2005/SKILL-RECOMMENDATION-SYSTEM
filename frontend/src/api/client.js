const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
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
  refresh: (payload) =>
    request("/auth/refresh", { method: "POST", body: JSON.stringify(payload) }),
  logout: (token, refreshToken) =>
    request("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ refreshToken }),
    }),
  dashboard: (token) =>
    request("/recommendations/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  analytics: (token) =>
    request("/recommendations/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  mockInterview: (token, role) =>
    request(`/recommendations/mock-interview/${encodeURIComponent(role)}`, {
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
  feedbackDetailed: (token, payload) =>
    request("/recommendations/feedback", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateGoals: (token, payload) =>
    request("/recommendations/goals", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateProgress: (token, payload) =>
    request("/recommendations/progress", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  compareRoles: (token, payload) =>
    request("/recommendations/compare-roles", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  addCareerPath: (token, payload) =>
    request("/recommendations/career-paths", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateCareerPath: (token, pathId, payload) =>
    request(`/recommendations/career-paths/${pathId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  deleteCareerPath: (token, pathId) =>
    request(`/recommendations/career-paths/${pathId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  addPortfolioProject: (token, payload) =>
    request("/recommendations/portfolio", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updatePortfolioProject: (token, projectId, payload) =>
    request(`/recommendations/portfolio/${projectId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  deletePortfolioProject: (token, projectId) =>
    request(`/recommendations/portfolio/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateResumeProfile: (token, payload) =>
    request("/recommendations/resume-profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateReminders: (token, payload) =>
    request("/recommendations/reminders", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  adminJobs: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/jobs${query ? `?${query}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  adminCreateJob: (token, payload) =>
    request("/admin/jobs", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  adminUpdateJob: (token, id, payload) =>
    request(`/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  adminDeleteJob: (token, id) =>
    request(`/admin/jobs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  trendingSkillsPublic: () => request("/public/trending-skills"),
};

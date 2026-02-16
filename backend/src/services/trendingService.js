const fallbackTrendingSkills = [
  "Generative AI",
  "MLOps",
  "TypeScript",
  "Cloud Security",
  "Data Engineering",
  "Prompt Engineering",
  "Kubernetes",
  "System Design"
];

export const getTrendingSkills = async () => {
  // In production, replace this with a real external API integration.
  // Keeping async behavior ensures drop-in replacement with fetch/axios later.
  return fallbackTrendingSkills;
};

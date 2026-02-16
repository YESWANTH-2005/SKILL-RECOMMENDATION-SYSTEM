export const normalizeSkills = (skills = []) =>
  skills
    .map((skill) => skill.toLowerCase().trim())
    .filter(Boolean);

export const getRecommendationForJob = (userSkills, job) => {
  const normalizedUserSkills = normalizeSkills(userSkills);
  const normalizedRequiredSkills = normalizeSkills(job.requiredSkills);

  const matchedSkills = normalizedRequiredSkills.filter((skill) =>
    normalizedUserSkills.includes(skill)
  );

  const missingSkills = normalizedRequiredSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  const matchPercentage = Math.round(
    (matchedSkills.length / normalizedRequiredSkills.length) * 100
  );

  return {
    company: job.company,
    role: job.role,
    category: job.category,
    requiredSkills: job.requiredSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    learningResources: job.learningResources,
  };
};

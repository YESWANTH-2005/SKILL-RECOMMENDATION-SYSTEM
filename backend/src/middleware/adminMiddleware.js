export const adminMiddleware = (req, res, next) => {
  const allowlist = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!allowlist.length) {
    return res.status(403).json({ message: "Admin access not configured" });
  }

  const email = (req.user?.email || "").toLowerCase();
  if (!allowlist.includes(email)) {
    return res.status(403).json({ message: "Admin access denied" });
  }

  return next();
};

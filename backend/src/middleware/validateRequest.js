export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid request payload",
    });
  }

  req.validatedBody = result.data;
  return next();
};

export const isNGO = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No user context",
    });
  }

  if (req.user.role !== 2) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Only NGOs can submit verification docs",
    });
  }

  next();
};

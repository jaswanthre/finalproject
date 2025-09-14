export const isNGO = (req, res, next) => {
  if (!req.user || req.user.role !== 2) {
    return res
      .status(403)
      .json({
        success: false,
        message: "Only NGOs can submit verification docs",
      });
  }
  next();
};

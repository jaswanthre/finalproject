export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 1) {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

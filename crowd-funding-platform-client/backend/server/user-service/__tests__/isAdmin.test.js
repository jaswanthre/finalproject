import { isAdmin } from "../middleware/isAdmin.js";

describe("isAdmin middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should allow access when user role is admin (1)", () => {
    req.user = { role: 1 };
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should deny access if no user", () => {
    req.user = null;
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Access denied. Admins only.",
    });
  });

  it("should deny access if user is not admin", () => {
    req.user = { role: 2 };
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Access denied. Admins only.",
    });
  });
});

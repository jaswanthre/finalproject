import { isNGO } from "../middleware/isNGO.js";

describe("isNGO middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("should return 401 if no user", () => {
    isNGO(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: No user context",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 403 if user is not NGO", () => {
    req.user = { role: 1 }; // admin instead of NGO

    isNGO(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Access denied: Only NGOs can submit verification docs",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() if user is NGO", () => {
    req.user = { role: 2 };

    isNGO(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

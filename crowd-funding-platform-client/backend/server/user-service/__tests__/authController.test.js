import * as authController from "../controllers/authController.js";
import * as userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../models/userModel.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
    jest.clearAllMocks();
  });

  // ---------------- REGISTER -----------------
  test("register - success", async () => {
    req.body = {
      name: "John",
      email: "john@test.com",
      password: "123",
      roleId: 2,
    };
    bcrypt.hash.mockResolvedValue("hashed123");
    userModel.createUser.mockResolvedValue({ id: 1, name: "John" });

    await authController.register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("123", 10);
    expect(userModel.createUser).toHaveBeenCalledWith(
      "John",
      "john@test.com",
      "hashed123",
      2
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { id: 1, name: "John" },
    });
  });

  test("register - error", async () => {
    req.body = {
      name: "John",
      email: "john@test.com",
      password: "123",
      roleId: 2,
    };
    bcrypt.hash.mockRejectedValue(new Error("fail"));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });

  // ---------------- LOGIN -----------------
  test("login - user not found", async () => {
    req.body = { email: "notfound@test.com", password: "123" };
    userModel.findUserByEmail.mockResolvedValue(null);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  test("login - invalid password", async () => {
    req.body = { email: "john@test.com", password: "wrong" };
    userModel.findUserByEmail.mockResolvedValue({ id: 1, password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid credentials",
    });
  });

  test("login - success", async () => {
    req.body = { email: "john@test.com", password: "123" };
    const fakeUser = {
      id: 1,
      email: "john@test.com",
      password: "hashed",
      role_id: 2,
      is_verified: true,
    };
    userModel.findUserByEmail.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token123");

    await authController.login(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, role: 2, email: "john@test.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      id: 1,
      token: "token123",
      email: "john@test.com",
      role: 2,
      is_verified: true,
    });
  });

  test("login - error", async () => {
    req.body = { email: "john@test.com", password: "123" };
    userModel.findUserByEmail.mockRejectedValue(new Error("fail"));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });
});

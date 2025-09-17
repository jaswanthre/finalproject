import * as adminController from "../controllers/adminController.js";
import * as userModel from "../models/userModel.js";
import * as profileModel from "../models/profileModel.js";
import * as verificationModel from "../models/verificationModel.js";

jest.mock("../models/userModel.js");
jest.mock("../models/profileModel.js");
jest.mock("../models/verificationModel.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Admin Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = mockRes();
    jest.clearAllMocks();
  });

  test("getUserByEmail - success", async () => {
    req.params.email = "test@example.com";
    userModel.findUserByEmail.mockResolvedValue({
      id: 1,
      email: "test@example.com",
    });
    await adminController.getUserByEmail(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { id: 1, email: "test@example.com" },
    });
  });

  test("getUserByEmail - not found", async () => {
    userModel.findUserByEmail.mockResolvedValue(null);
    req.params.email = "notfound@example.com";
    await adminController.getUserByEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateUserRole - success", async () => {
    req.body = { email: "test@example.com", roleId: 2 };
    userModel.updateUserRoleByEmail.mockResolvedValue({ id: 1, role_id: 2 });
    await adminController.updateUserRole(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { id: 1, role_id: 2 },
    });
  });

  test("updateUserRole - not found", async () => {
    userModel.updateUserRoleByEmail.mockResolvedValue(null);
    await adminController.updateUserRole(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deleteUserAccount - success", async () => {
    req.body.email = "test@example.com";
    userModel.deleteUserByEmail.mockResolvedValue({ id: 1 });
    await adminController.deleteUserAccount(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User deleted",
      user: { id: 1 },
    });
  });

  test("deleteUserAccount - not found", async () => {
    userModel.deleteUserByEmail.mockResolvedValue(null);
    await adminController.deleteUserAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getProfileByUserEmail - success", async () => {
    req.params.email = "test@example.com";
    profileModel.getProfileByEmail.mockResolvedValue({ id: 1 });
    await adminController.getProfileByUserEmail(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      profile: { id: 1 },
    });
  });

  test("getProfileByUserEmail - not found", async () => {
    profileModel.getProfileByEmail.mockResolvedValue(null);
    await adminController.getProfileByUserEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deleteProfileByUserEmail - success", async () => {
    req.body.email = "test@example.com";
    profileModel.deleteProfileByEmail.mockResolvedValue({ id: 1 });
    await adminController.deleteProfileByUserEmail(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Profile deleted",
      profile: { id: 1 },
    });
  });

  test("deleteProfileByUserEmail - not found", async () => {
    profileModel.deleteProfileByEmail.mockResolvedValue(null);
    await adminController.deleteProfileByUserEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("listAllUsers - success", async () => {
    userModel.getAllUsers.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    await adminController.listAllUsers(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      users: [{ id: 1 }, { id: 2 }],
    });
  });

  test("updateVerificationStatus - invalid status", async () => {
    req.params.email = "test@example.com";
    req.body.status = "INVALID";
    await adminController.updateVerificationStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateVerificationStatus - not found", async () => {
    req.params.email = "test@example.com";
    req.body.status = "APPROVED";
    verificationModel.adminUpdateVerificationStatus.mockResolvedValue(null);
    await adminController.updateVerificationStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateVerificationStatus - success", async () => {
    req.params.email = "test@example.com";
    req.body.status = "APPROVED";
    verificationModel.adminUpdateVerificationStatus.mockResolvedValue({
      id: 1,
      status: "APPROVED",
    });
    await adminController.updateVerificationStatus(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      verification: { id: 1, status: "APPROVED" },
    });
  });

  test("listAllVerifications - success", async () => {
    verificationModel.getAllVerifications.mockResolvedValue([{ id: 1 }]);
    await adminController.listAllVerifications(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      verifications: [{ id: 1 }],
    });
  });
});

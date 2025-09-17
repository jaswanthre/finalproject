import * as profileController from "../controllers/profileController.js";
import * as profileModel from "../models/profileModel.js";
import { uploadToS3 } from "../middleware/uploadMiddleware.js";

jest.mock("../models/profileModel.js");
jest.mock("../middleware/uploadMiddleware.js");

describe("profileController", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1 }, body: {}, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  test("createUserProfile should handle success", async () => {
    uploadToS3.mockResolvedValue("s3://img.png");
    profileModel.createProfile.mockResolvedValue({ id: 1 });
    req.body = { email: "t@t.com", first_name: "A", last_name: "B" };

    await profileController.createUserProfile(req, res);

    expect(uploadToS3).toHaveBeenCalled();
    expect(profileModel.createProfile).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      profile: { id: 1 },
    });
  });

  test("getUserProfile should return 404 if not found", async () => {
    profileModel.getProfile.mockResolvedValue(null);

    await profileController.getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Profile not found",
    });
  });

  test("getUserProfile should return profile if found", async () => {
    profileModel.getProfile.mockResolvedValue({ id: 1, bio: "test bio" });

    await profileController.getUserProfile(req, res);

    expect(profileModel.getProfile).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      profile: { id: 1, bio: "test bio" },
    });
  });

  test("updateUserProfile should work without file", async () => {
    profileModel.updateProfile.mockResolvedValue({ id: 2 });
    req.body = { first_name: "X", last_name: "Y" };

    await profileController.updateUserProfile(req, res);

    expect(profileModel.updateProfile).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      profile: { id: 2 },
    });
  });

  test("updateUserProfile should work with file", async () => {
    req.file = {
      buffer: Buffer.from("img"),
      originalname: "a.png",
      mimetype: "image/png",
    };
    uploadToS3.mockResolvedValue("s3://img.png");
    profileModel.updateProfile.mockResolvedValue({ id: 3 });

    await profileController.updateUserProfile(req, res);

    expect(uploadToS3).toHaveBeenCalled();
    expect(profileModel.updateProfile).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      profile: { id: 3 },
    });
  });

  test("deleteUserProfile should return 404 if not found", async () => {
    profileModel.deleteProfile.mockResolvedValue(null);

    await profileController.deleteUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Profile not found",
    });
  });

  test("deleteUserProfile should delete and return profile", async () => {
    profileModel.deleteProfile.mockResolvedValue({ id: 1, deleted: true });

    await profileController.deleteUserProfile(req, res);

    expect(profileModel.deleteProfile).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Profile deleted",
      profile: { id: 1, deleted: true },
    });
  });
});

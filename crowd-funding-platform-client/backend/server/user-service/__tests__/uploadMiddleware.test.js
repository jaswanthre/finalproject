import { uploadToS3, profileUpload } from "../middleware/uploadMiddleware.js";
import { Upload } from "@aws-sdk/lib-storage";

// mock AWS SDK Upload
jest.mock("@aws-sdk/lib-storage", () => ({
  Upload: jest.fn(),
}));

// Mock s3 client
jest.mock("../db/aws.js", () => ({}));
// silence console logs/errors during tests
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe("uploadMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("profileUpload should be a function", () => {
    expect(typeof profileUpload).toBe("function");
  });

  it("uploadToS3 returns null if no file is provided", async () => {
    const result = await uploadToS3(null, "folder");
    expect(result).toBeNull();
  });

  it("uploadToS3 uploads successfully and returns location", async () => {
    const fakeDone = jest.fn().mockResolvedValue({ Location: "s3://mocked" });
    Upload.mockImplementation(() => ({ done: fakeDone }));

    const file = {
      originalname: "test.png",
      buffer: Buffer.from("abc"),
      mimetype: "image/png",
    };

    const result = await uploadToS3(file, "avatars");
    expect(result).toBe("s3://mocked");
    expect(Upload).toHaveBeenCalled();
  });

  it("uploadToS3 handles errors gracefully", async () => {
    Upload.mockImplementation(() => ({
      done: jest.fn().mockRejectedValue(new Error("S3 failed")),
    }));

    const file = {
      originalname: "fail.png",
      buffer: Buffer.from("abc"),
      mimetype: "image/png",
    };

    const result = await uploadToS3(file, "avatars");
    expect(result).toBeNull();
  });

  it("uses mock storage when NODE_ENV is test", () => {
    process.env.NODE_ENV = "test";
    // re-import module to re-evaluate the branch
    jest.resetModules();
    const {
      profileUpload: reloadedProfileUpload,
    } = require("../middleware/uploadMiddleware.js");
    expect(typeof reloadedProfileUpload).toBe("function");
  });
});

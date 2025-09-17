import * as verificationController from "../controllers/verificationController.js";
import * as verificationModel from "../models/verificationModel.js";
import { uploadToS3 } from "../middleware/uploadMiddleware.js";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {}); // suppress console.error
});

afterAll(() => {
  console.error.mockRestore();
});

jest.mock("../models/verificationModel.js");
jest.mock("../middleware/uploadMiddleware.js");

describe("verificationController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { email: "ngo@test.com" },
      params: { email: "ngo@test.com" },
      files: {},
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.clearAllMocks());

  // ---------- CREATE VERIFICATION ----------
  test("createVerification should create new record if none exists", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue(null);
    verificationModel.createVerificationByEmail.mockResolvedValue({
      id: 1,
      status: "PENDING",
    });
    uploadToS3.mockResolvedValue("s3://doc");

    await verificationController.createVerification(req, res);

    expect(verificationModel.createVerificationByEmail).toHaveBeenCalledWith(
      "ngo@test.com",
      expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        verification: { id: 1, status: "PENDING" },
      })
    );
  });

  test("createVerification should reject if existing is PENDING", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "PENDING",
    });

    await verificationController.createVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createVerification should reject if existing is APPROVED", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "APPROVED",
    });

    await verificationController.createVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createVerification should re-upload docs if REJECTED", async () => {
    req.files = { pan_card: [{ originalname: "pan.pdf" }] };
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "REJECTED",
      pan_card: "old_pan.pdf",
    });
    uploadToS3.mockResolvedValue("s3://new_pan");
    verificationModel.updateVerificationByEmail.mockResolvedValue({
      id: 2,
      status: "PENDING",
    });

    await verificationController.createVerification(req, res);

    expect(verificationModel.updateVerificationByEmail).toHaveBeenCalledWith(
      "ngo@test.com",
      expect.objectContaining({ pan_card: "s3://new_pan" }),
      "PENDING"
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test("createVerification should fallback on invalid state", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "UNKNOWN",
    });

    await verificationController.createVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ---------- GET VERIFICATIONS ----------
  test("getVerifications should 404 if not found", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue(null);

    await verificationController.getVerifications(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getVerifications should return record if found", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue({
      id: 5,
      status: "APPROVED",
    });

    await verificationController.getVerifications(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        verification: { id: 5, status: "APPROVED" },
      })
    );
  });

  // ---------- UPDATE VERIFICATION ----------
  test("updateVerification should 404 when not found", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue(null);

    await verificationController.updateVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateVerification should reject when status is PENDING", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "PENDING",
    });

    await verificationController.updateVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateVerification should reject when status is APPROVED", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "APPROVED",
    });

    await verificationController.updateVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateVerification should reject when status is not REJECTED", async () => {
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "OTHER",
    });

    await verificationController.updateVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateVerification should re-upload when status is REJECTED", async () => {
    req.files = { id_proof: [{ originalname: "id.pdf" }] };
    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "REJECTED",
    });
    uploadToS3.mockResolvedValue("s3://id_doc");
    verificationModel.updateVerificationByEmail.mockResolvedValue({
      id: 10,
      status: "PENDING",
    });

    await verificationController.updateVerification(req, res);

    expect(verificationModel.updateVerificationByEmail).toHaveBeenCalledWith(
      "ngo@test.com",
      expect.objectContaining({ id_proof: "s3://id_doc" }),
      "PENDING"
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  // ---------- DELETE VERIFICATION ----------
  test("deleteVerification should 404 if not found", async () => {
    verificationModel.deleteVerificationByEmail.mockResolvedValue(null);

    await verificationController.deleteVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deleteVerification should return success if deleted", async () => {
    verificationModel.deleteVerificationByEmail.mockResolvedValue({
      id: 9,
      email: "ngo@test.com",
    });

    await verificationController.deleteVerification(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Verification deleted",
        verification: { id: 9, email: "ngo@test.com" },
      })
    );
  });
  test("createVerification should handle internal error", async () => {
    const err = new Error("DB fail");
    verificationModel.getVerificationByEmail.mockRejectedValue(err);

    await verificationController.createVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });

  test("getVerifications should handle internal error", async () => {
    const err = new Error("DB fail");
    verificationModel.getVerificationByEmail.mockRejectedValue(err);

    await verificationController.getVerifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });

  test("updateVerification should handle internal error", async () => {
    const err = new Error("Update fail");
    verificationModel.getVerificationByEmail.mockRejectedValue(err);

    await verificationController.updateVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });

  test("deleteVerification should handle internal error", async () => {
    const err = new Error("Delete fail");
    verificationModel.deleteVerificationByEmail.mockRejectedValue(err);

    await verificationController.deleteVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });
  test("createVerification should create new record when no existing verification", async () => {
    req.files = {
      ngo_registration_doc: [{ originalname: "ngo.pdf" }],
      pan_card: [{ originalname: "pan.pdf" }],
      bank_proof: [{ originalname: "bank.pdf" }],
      id_proof: [{ originalname: "id.pdf" }],
    };

    verificationModel.getVerificationByEmail.mockResolvedValue(null);
    uploadToS3.mockResolvedValue("s3://uploaded");
    verificationModel.createVerificationByEmail.mockResolvedValue({
      id: 1,
      status: "PENDING",
    });

    await verificationController.createVerification(req, res);

    expect(uploadToS3).toHaveBeenCalledTimes(4);
    expect(verificationModel.createVerificationByEmail).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        verification: { id: 1, status: "PENDING" },
      })
    );
  });
  test("createVerification should re-upload docs if status is REJECTED", async () => {
    req.files = {
      pan_card: [{ originalname: "pan.pdf" }],
    };

    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "REJECTED",
      ngo_registration_doc: "oldNgo",
      pan_card: "oldPan",
      bank_proof: "oldBank",
      id_proof: "oldId",
    });

    uploadToS3.mockResolvedValue("s3://new_pan");
    verificationModel.updateVerificationByEmail.mockResolvedValue({
      id: 2,
      status: "PENDING",
    });

    await verificationController.createVerification(req, res);

    expect(uploadToS3).toHaveBeenCalled();
    expect(verificationModel.updateVerificationByEmail).toHaveBeenCalledWith(
      "ngo@test.com",
      expect.objectContaining({ pan_card: "s3://new_pan" }),
      "PENDING"
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
  test("updateVerification should upload new docs and reset to PENDING when REJECTED", async () => {
    req.files = {
      id_proof: [{ originalname: "id.pdf" }],
    };

    verificationModel.getVerificationByEmail.mockResolvedValue({
      status: "REJECTED",
    });
    uploadToS3.mockResolvedValue("s3://new_id");
    verificationModel.updateVerificationByEmail.mockResolvedValue({
      id: 3,
      status: "PENDING",
    });

    await verificationController.updateVerification(req, res);

    expect(uploadToS3).toHaveBeenCalledWith(req.files.id_proof[0], "ngo_docs");
    expect(verificationModel.updateVerificationByEmail).toHaveBeenCalledWith(
      "ngo@test.com",
      expect.objectContaining({ id_proof: "s3://new_id" }),
      "PENDING"
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});

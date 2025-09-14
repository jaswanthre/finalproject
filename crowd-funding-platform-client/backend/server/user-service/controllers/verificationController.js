import {
  createVerificationByEmail,
  getVerificationByEmail,
  updateVerificationByEmail,
  deleteVerificationByEmail,
} from "../models/verificationModel.js";
import { uploadToS3 } from "../middleware/uploadMiddleware.js";

export const createVerification = async (req, res) => {
  const { email } = req.body;
  const existing = await getVerificationByEmail(email);

  // If no record, proceed with new verification
  if (!existing) {
    const files = req.files || {};
    const docs = {
      ngo_registration_doc: files.ngo_registration_doc
        ? await uploadToS3(files.ngo_registration_doc[0], "ngo_docs")
        : null,
      pan_card: files.pan_card
        ? await uploadToS3(files.pan_card[0], "ngo_docs")
        : null,
      bank_proof: files.bank_proof
        ? await uploadToS3(files.bank_proof[0], "ngo_docs")
        : null,
      id_proof: files.id_proof
        ? await uploadToS3(files.id_proof[0], "ngo_docs")
        : null,
    };

    const record = await createVerificationByEmail(email, docs);
    return res.json({ success: true, verification: record });
  }

  // Handle existing record by status
  if (existing.status === "PENDING") {
    return res.status(400).json({
      success: false,
      message: "Docs are being verified. Please wait until review is complete.",
    });
  }

  if (existing.status === "APPROVED") {
    return res.status(400).json({
      success: false,
      message: "Docs are already approved. No further uploads required.",
    });
  }

  if (existing.status === "REJECTED") {
    // Allow re-upload and reset status to PENDING
    const files = req.files || {};
    const docs = {
      ngo_registration_doc: files.ngo_registration_doc
        ? await uploadToS3(files.ngo_registration_doc[0], "ngo_docs")
        : existing.ngo_registration_doc,
      pan_card: files.pan_card
        ? await uploadToS3(files.pan_card[0], "ngo_docs")
        : existing.pan_card,
      bank_proof: files.bank_proof
        ? await uploadToS3(files.bank_proof[0], "ngo_docs")
        : existing.bank_proof,
      id_proof: files.id_proof
        ? await uploadToS3(files.id_proof[0], "ngo_docs")
        : existing.id_proof,
    };

    const updated = await updateVerificationByEmail(email, docs, "PENDING");
    return res.json({
      success: true,
      message: "Docs re-submitted successfully. Status set back to PENDING.",
      verification: updated,
    });
  }

  // Default fallback
  return res.status(400).json({
    success: false,
    message: "Invalid verification state. Contact support.",
  });
};

export const getVerifications = async (req, res) => {
  const { email } = req.params;
  const record = await getVerificationByEmail(email);
  if (!record)
    return res
      .status(404)
      .json({ success: false, message: "No verification found" });
  res.json({ success: true, verification: record });
};

export const updateVerification = async (req, res) => {
  const { email } = req.params;
  const { status } = req.body;

  const existing = await getVerificationByEmail(email);
  if (!existing)
    return res.status(404).json({ success: false, message: "No record found" });

  if (existing.status === "PENDING")
    return res.status(400).json({
      success: false,
      message: "Verification pending, cannot update now",
    });

  if (existing.status === "APPROVED")
    return res
      .status(400)
      .json({ success: false, message: "Already approved, cannot update" });

  if (existing.status !== "REJECTED")
    return res
      .status(400)
      .json({ success: false, message: "Update not allowed" });

  const files = req.files || {};
  const docs = {
    ngo_registration_doc: files.ngo_registration_doc
      ? await uploadToS3(files.ngo_registration_doc[0], "ngo_docs")
      : null,
    pan_card: files.pan_card
      ? await uploadToS3(files.pan_card[0], "ngo_docs")
      : null,
    bank_proof: files.bank_proof
      ? await uploadToS3(files.bank_proof[0], "ngo_docs")
      : null,
    id_proof: files.id_proof
      ? await uploadToS3(files.id_proof[0], "ngo_docs")
      : null,
  };

  const updated = await updateVerificationByEmail(email, docs, "PENDING");
  res.json({ success: true, verification: updated });
};

export const deleteVerification = async (req, res) => {
  const { email } = req.params;
  const deleted = await deleteVerificationByEmail(email);
  if (!deleted)
    return res
      .status(404)
      .json({ success: false, message: "Verification not found" });
  res.json({
    success: true,
    message: "Verification deleted",
    verification: deleted,
  });
};

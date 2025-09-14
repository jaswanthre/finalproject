import {
  findUserByEmail,
  updateUserRoleByEmail,
  deleteUserByEmail,
  getAllUsers,
} from "../models/userModel.js";
import {
  getProfileByEmail,
  deleteProfileByEmail,
} from "../models/profileModel.js";

import {
  getAllVerifications,
  adminUpdateVerificationStatus,
} from "../models/verificationModel.js";

export const getUserByEmail = async (req, res) => {
  const { email } = req.params;
  const user = await findUserByEmail(email);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
};

export const updateUserRole = async (req, res) => {
  const { email, roleId } = req.body;
  const updated = await updateUserRoleByEmail(email, roleId);
  if (!updated)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: updated });
};

export const deleteUserAccount = async (req, res) => {
  const { email } = req.body;
  const deleted = await deleteUserByEmail(email);
  if (!deleted)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User deleted", user: deleted });
};

export const getProfileByUserEmail = async (req, res) => {
  const { email } = req.params;
  const profile = await getProfileByEmail(email);
  if (!profile)
    return res
      .status(404)
      .json({ success: false, message: "Profile not found" });
  res.json({ success: true, profile });
};

export const deleteProfileByUserEmail = async (req, res) => {
  const { email } = req.body;
  const deleted = await deleteProfileByEmail(email);
  if (!deleted)
    return res
      .status(404)
      .json({ success: false, message: "Profile not found" });
  res.json({ success: true, message: "Profile deleted", profile: deleted });
};
export const listAllUsers = async (req, res) => {
  const users = await getAllUsers();
  res.json({ success: true, users });
};

export const updateVerificationStatus = async (req, res) => {
  const { email } = req.params;
  const { status, feedback } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const updated = await adminUpdateVerificationStatus(
    email,
    status,
    feedback || null
  );
  if (!updated)
    return res
      .status(404)
      .json({ success: false, message: "Verification not found" });

  res.json({ success: true, verification: updated });
};

export const listAllVerifications = async (req, res) => {
  const { status } = req.query; // optional filter: PENDING, APPROVED, REJECTED
  const records = await getAllVerifications(status || null);
  res.json({ success: true, verifications: records });
};

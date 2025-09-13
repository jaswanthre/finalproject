import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../models/profileModel.js";
import { uploadToS3 } from "../middleware/uploadMiddleware.js";

export const createUserProfile = async (req, res) => {
  const { email, first_name, last_name, mobile_number, bio, address } =
    req.body;
  const profileImage = await uploadToS3(req.file, "profiles");
  const profile = await createProfile(
    req.user.id,
    email,
    first_name,
    last_name,
    mobile_number,
    bio,
    address,
    profileImage
  );
  res.json({ success: true, profile });
};

export const getUserProfile = async (req, res) => {
  const profile = await getProfile(req.user.id);
  if (!profile)
    return res
      .status(404)
      .json({ success: false, message: "Profile not found" });
  res.json({ success: true, profile });
};

export const updateUserProfile = async (req, res) => {
  const { first_name, last_name, mobile_number, bio, address } = req.body;
  const profileImage = req.file ? await uploadToS3(req.file, "profiles") : null;
  const updated = await updateProfile(
    req.user.id,
    first_name,
    last_name,
    mobile_number,
    bio,
    address,
    profileImage
  );
  res.json({ success: true, profile: updated });
};

export const deleteUserProfile = async (req, res) => {
  const deleted = await deleteProfile(req.user.id);
  if (!deleted)
    return res
      .status(404)
      .json({ success: false, message: "Profile not found" });
  res.json({ success: true, message: "Profile deleted", profile: deleted });
};

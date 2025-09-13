import pool from "../db/db.js";

export const createProfile = async (
  userId,
  email,
  firstName,
  lastName,
  mobile,
  bio,
  address,
  profileImage
) => {
  const query = `
    INSERT INTO profiles (user_id, email, first_name, last_name, mobile_number, bio, address, profile_image) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
  const values = [
    userId,
    email,
    firstName,
    lastName,
    mobile,
    bio,
    address,
    profileImage,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getProfile = async (userId) => {
  const result = await pool.query(`SELECT * FROM profiles WHERE user_id=$1`, [
    userId,
  ]);
  return result.rows[0];
};

export const updateProfile = async (
  userId,
  firstName,
  lastName,
  mobile,
  bio,
  address,
  profileImage
) => {
  const query = `
    UPDATE profiles SET 
      first_name=$1, last_name=$2, mobile_number=$3, bio=$4, address=$5, profile_image=$6, updated_at=NOW()
    WHERE user_id=$7 RETURNING *`;
  const result = await pool.query(query, [
    firstName,
    lastName,
    mobile,
    bio,
    address,
    profileImage,
    userId,
  ]);
  return result.rows[0];
};

export const deleteProfile = async (userId) => {
  const result = await pool.query(
    `DELETE FROM profiles WHERE user_id=$1 RETURNING *`,
    [userId]
  );
  return result.rows[0];
};

export const getProfileByEmail = async (email) => {
  const query = `
    SELECT p.* FROM profiles p
    JOIN users u ON u.id = p.user_id
    WHERE u.email=$1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const deleteProfileByEmail = async (email) => {
  const query = `
    DELETE FROM profiles p USING users u
    WHERE p.user_id = u.id AND u.email=$1 RETURNING p.*`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

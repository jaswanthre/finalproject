import pool from "../db/db.js";

export const createUser = async (name, email, password, roleId) => {
  const query = `INSERT INTO users (name, email, password, role_id) VALUES ($1,$2,$3,$4) RETURNING *`;
  const values = [name, email, password, roleId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  return result.rows[0];
};

export const updateUserRoleByEmail = async (email, roleId) => {
  const result = await pool.query(
    `UPDATE users SET role_id=$1, updated_at=NOW() WHERE email=$2 RETURNING *`,
    [roleId, email]
  );
  return result.rows[0];
};

export const deleteUserByEmail = async (email) => {
  const result = await pool.query(
    `DELETE FROM users WHERE email=$1 RETURNING *`,
    [email]
  );
  return result.rows[0];
};
export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role_id, is_verified, created_at FROM users`
  );
  return result.rows;
};

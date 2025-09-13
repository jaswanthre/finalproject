import pool from "../db/db.js";

export const createVerificationByEmail = async (email, docs) => {
  const query = `
    INSERT INTO verifications (user_id, ngo_registration_doc, pan_card, bank_proof, id_proof, status)
    SELECT id, $2, $3, $4, $5, 'PENDING' FROM users WHERE email=$1 RETURNING *`;
  const values = [
    email,
    docs.ngo_registration_doc,
    docs.pan_card,
    docs.bank_proof,
    docs.id_proof,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getVerificationByEmail = async (email) => {
  const query = `
    SELECT v.* FROM verifications v
    JOIN users u ON u.id = v.user_id
    WHERE u.email=$1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const updateVerificationByEmail = async (email, docs, status) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update docs & status
    const updateQuery = `
      UPDATE verifications v
      SET ngo_registration_doc=COALESCE($2, v.ngo_registration_doc),
          pan_card=COALESCE($3, v.pan_card),
          bank_proof=COALESCE($4, v.bank_proof),
          id_proof=COALESCE($5, v.id_proof),
          status=COALESCE($6, v.status),
          updated_at=NOW()
      FROM users u
      WHERE v.user_id=u.id AND u.email=$1
      RETURNING v.*`;
    const values = [
      email,
      docs.ngo_registration_doc,
      docs.pan_card,
      docs.bank_proof,
      docs.id_proof,
      status,
    ];
    const verificationRes = await client.query(updateQuery, values);
    const verification = verificationRes.rows[0];

    if (status === "APPROVED") {
      await client.query(`UPDATE users SET is_verified=true WHERE email=$1`, [
        email,
      ]);
    }

    await client.query("COMMIT");
    return verification;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const deleteVerificationByEmail = async (email) => {
  const query = `
    DELETE FROM verifications v
    USING users u
    WHERE v.user_id=u.id AND u.email=$1
    RETURNING v.*`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const adminUpdateVerificationStatus = async (
  email,
  status,
  feedback
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateQuery = `
      UPDATE verifications v
      SET status=$2, feedback=$3, updated_at=NOW()
      FROM users u
      WHERE v.user_id=u.id AND u.email=$1
      RETURNING v.*`;
    const verificationRes = await client.query(updateQuery, [
      email,
      status,
      feedback,
    ]);
    const verification = verificationRes.rows[0];

    if (status === "APPROVED") {
      await client.query(`UPDATE users SET is_verified=true WHERE email=$1`, [
        email,
      ]);
    }

    await client.query("COMMIT");
    return verification;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getAllVerifications = async (status = null) => {
  let query = `
    SELECT v.id, u.name, u.email, u.is_verified, v.status, v.feedback, 
           v.ngo_registration_doc, v.pan_card, v.bank_proof, v.id_proof,
           v.created_at, v.updated_at
    FROM verifications v
    JOIN users u ON u.id = v.user_id
  `;
  let values = [];

  if (status) {
    query += " WHERE v.status=$1";
    values = [status];
  }

  const result = await pool.query(query, values);
  return result.rows;
};

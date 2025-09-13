import pool from "../db/db.js";

export const createTransaction = async (req, res) => {
  try {
    const {
      donation_id,
      transaction_amount,
      payment_gateway,
      transaction_status,
    } = req.body;

    const r = await pool.query(
      `INSERT INTO transactions (donation_id, transaction_amount, payment_gateway, transaction_status) 
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [donation_id, transaction_amount, payment_gateway, transaction_status]
    );

    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM transactions WHERE transaction_id=$1",
      [req.params.id]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Transaction not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { transaction_status } = req.body;
    const r = await pool.query(
      "UPDATE transactions SET transaction_status=$1 WHERE transaction_id=$2 RETURNING *",
      [transaction_status, req.params.id]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Transaction not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const r = await pool.query(
      "DELETE FROM transactions WHERE transaction_id=$1 RETURNING *",
      [req.params.id]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

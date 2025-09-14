import pool from "../db/db.js";

export const createDonation = async (req, res) => {
  try {
    const { campaign_id, donor_email, amount, payment_method } = req.body;

    const donation = await pool.query(
      `INSERT INTO donations (campaign_id, donor_email, amount, payment_method) 
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [campaign_id, donor_email, amount, payment_method]
    );

    // update campaign raised_amount
    await pool.query(
      `UPDATE campaigns SET raised_amount = raised_amount + $1 WHERE campaign_id=$2`,
      [amount, campaign_id]
    );

    res.status(201).json(donation.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDonation = async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM donations WHERE donation_id=$1", [
      req.params.id,
    ]);
    if (!r.rows.length)
      return res.status(404).json({ error: "Donation not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDonationStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const r = await pool.query(
      "UPDATE donations SET payment_status=$1 WHERE donation_id=$2 RETURNING *",
      [payment_status, req.params.id]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Donation not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDonation = async (req, res) => {
  try {
    const r = await pool.query(
      "DELETE FROM donations WHERE donation_id=$1 RETURNING *",
      [req.params.id]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Donation not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getDonationsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const r = await pool.query(
      `SELECT d.*, c.title AS campaign_title, c.campaign_image, c.city, c.ngo_email
       FROM donations d
       JOIN campaigns c ON d.campaign_id = c.campaign_id
       WHERE d.donor_email = $1
       ORDER BY d.created_at DESC`,
      [email]
    );

    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

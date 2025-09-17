import pool from "../db/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createDonation = async (req, res) => {
  try {
    const { campaign_id, donor_email, amount, payment_method } = req.body;
    const donation = await pool.query(
      `INSERT INTO donations (campaign_id, donor_email, amount, payment_method) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [campaign_id, donor_email, amount, payment_method]
    );
    res.status(201).json(donation.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDonationStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const donationId = req.params.id;

    const currentDonation = await pool.query(
      "SELECT * FROM donations WHERE donation_id=$1",
      [donationId]
    );

    if (!currentDonation.rows.length)
      return res.status(404).json({ error: "Donation not found" });

    const donation = currentDonation.rows[0];

    if (payment_status === "SUCCESS" && donation.payment_status !== "SUCCESS") {
      await pool.query(
        "UPDATE campaigns SET raised_amount = raised_amount + $1 WHERE campaign_id = $2",
        [donation.amount, donation.campaign_id]
      );
    }

    if (donation.payment_status === "SUCCESS" && payment_status !== "SUCCESS") {
      await pool.query(
        "UPDATE campaigns SET raised_amount = raised_amount - $1 WHERE campaign_id = $2",
        [donation.amount, donation.campaign_id]
      );
    }

    const r = await pool.query(
      "UPDATE donations SET payment_status=$1 WHERE donation_id=$2 RETURNING *",
      [payment_status, donationId]
    );

    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDonation = async (req, res) => {
  try {
    const donationId = req.params.id;

    const currentDonation = await pool.query(
      "SELECT * FROM donations WHERE donation_id=$1",
      [donationId]
    );

    if (!currentDonation.rows.length)
      return res.status(404).json({ error: "Donation not found" });

    const donation = currentDonation.rows[0];

    if (donation.payment_status === "SUCCESS") {
      await pool.query(
        "UPDATE campaigns SET raised_amount = raised_amount - $1 WHERE campaign_id = $2",
        [donation.amount, donation.campaign_id]
      );
    }

    const r = await pool.query(
      "DELETE FROM donations WHERE donation_id=$1 RETURNING *",
      [donationId]
    );

    if (!r.rows.length)
      return res.status(404).json({ error: "Donation not found" });

    res.json({ message: "Donation deleted and campaign total updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDonation = async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM donations WHERE donation_id=$1",
      [req.params.id]
    );

    if (!r.rows.length)
      return res.status(404).json({ error: "Donation not found" });

    res.json(r.rows[0]);
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

export const getAllDonations = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT d.*, c.title AS campaign_title, c.campaign_image, c.city, c.ngo_email
       FROM donations d
       LEFT JOIN campaigns c ON d.campaign_id = c.campaign_id
       ORDER BY d.created_at DESC`
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { campaign_id, donor_email, amount, payment_method } = req.body;

    const donation = await pool.query(
      `INSERT INTO donations (campaign_id, donor_email, amount, payment_method, payment_status)
       VALUES ($1, $2, $3, $4, 'PENDING') RETURNING *`,
      [campaign_id, donor_email, amount, payment_method]
    );

    const donationData = donation.rows[0];

    const options = {
      amount: Math.round(amount * 1), // Ensure in smallest currency unit
      currency: "INR",
      receipt: `donation_${String(donationData.donation_id).slice(0, 30)}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const transaction = await pool.query(
      `INSERT INTO transactions (donation_id, transaction_amount, payment_gateway, transaction_status)
       VALUES ($1, $2, $3, 'PENDING') RETURNING *`,
      [donationData.donation_id, amount, "Razorpay"]
    );

    res.json({
      orderId: order.id,
      donationId: donationData.donation_id,
      transactionId: transaction.rows[0].transaction_id,
      amount,
      currency: "INR",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
      transactionId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ error: "Payment verification failed" });

    await pool.query(
      "UPDATE donations SET payment_status = 'SUCCESS' WHERE donation_id = $1",
      [donationId]
    );

    await pool.query(
      "UPDATE transactions SET transaction_status = 'SUCCESS' WHERE transaction_id = $1",
      [transactionId]
    );

    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    res.status(500).json({ error: "Payment verification failed" });
  }
};

import pool from "../db/db.js";
import { uploadToS3 } from "../middleware/uploadMiddleware.js";
import { sendCampaignEmail } from "../services/emailService.js";

export const createCampaign = async (req, res) => {
  try {
    const {
      ngo_email,
      title,
      description,
      target_amount,
      start_date,
      end_date,
      city,
    } = req.body;

    let imageUrl = null;
    if (req.file) imageUrl = await uploadToS3(req.file, "campaigns");

    const result = await pool.query(
      `INSERT INTO campaigns 
       (ngo_email, title, description, target_amount, start_date, end_date, city, campaign_image) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        ngo_email,
        title,
        description,
        target_amount,
        start_date,
        end_date,
        city,
        imageUrl,
      ]
    );

    const campaign = result.rows[0];

    const usersRes = await pool.query(
      "SELECT email FROM users WHERE role_id = 3"
    );
    const donorEmails = usersRes.rows.map((u) => u.email);

    if (donorEmails.length > 0) {
      await sendCampaignEmail(donorEmails, campaign);
    }

    res.json({ success: true, campaign });
  } catch (err) {
    console.error("Error creating campaign:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
export const getCampaigns = async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM campaigns");
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM campaigns WHERE campaign_id=$1", [
      req.params.id,
    ]);
    if (!r.rows.length)
      return res.status(404).json({ error: "Campaign not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      target_amount,
      raised_amount,
      status,
      end_date,
      city,
    } = req.body;
    let imageUrl = null;
    if (req.file) imageUrl = await uploadToS3(req.file, "campaigns");

    const r = await pool.query(
      `UPDATE campaigns SET title=$1, description=$2, target_amount=$3, raised_amount=$4,
       status=$5, end_date=$6, city=$7, campaign_image=COALESCE($8,campaign_image), updated_at=NOW()
       WHERE campaign_id=$9 RETURNING *`,
      [
        title,
        description,
        target_amount,
        raised_amount,
        status,
        end_date,
        city,
        imageUrl,
        req.params.id,
      ]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Campaign not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    await pool.query("DELETE FROM campaigns WHERE campaign_id=$1", [
      req.params.id,
    ]);
    res.json({ message: "Campaign deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getCampaignsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const r = await pool.query(
      "SELECT * FROM campaigns WHERE ngo_email = $1 ORDER BY created_at DESC",
      [email]
    );

    if (!r.rows.length) {
      return res.json({ success: true, campaigns: [] });
    }

    res.json({ success: true, campaigns: r.rows });
  } catch (err) {
    console.error("Error fetching NGO campaigns:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    const r = await pool.query(
      "INSERT INTO campaign_categories (category_name,description) VALUES ($1,$2) RETURNING *",
      [category_name, description]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM campaign_categories");
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const mapCampaignCategory = async (req, res) => {
  try {
    const { campaign_id, category_id } = req.body;
    const r = await pool.query(
      "INSERT INTO campaign_category_map (campaign_id,category_id) VALUES ($1,$2) RETURNING *",
      [campaign_id, category_id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMedia = async (req, res) => {
  try {
    const { campaign_id, media_type } = req.body;
    let mediaUrl = null;
    if (req.file) mediaUrl = await uploadToS3(req.file, "campaign_media");

    const r = await pool.query(
      "INSERT INTO campaign_media (campaign_id,media_url,media_type) VALUES ($1,$2,$3) RETURNING *",
      [campaign_id, mediaUrl, media_type]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMediaByCampaign = async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM campaign_media WHERE campaign_id=$1",
      [req.params.campaign_id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createDonation = async (req, res) => {
  try {
    const { campaign_id, donor_email, amount, payment_method } = req.body;
    const r = await pool.query(
      "INSERT INTO donations (campaign_id,donor_email,amount,payment_method,payment_status) VALUES ($1,$2,$3,$4,'PENDING') RETURNING *",
      [campaign_id, donor_email, amount, payment_method]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDonationsByCampaign = async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM donations WHERE campaign_id=$1", [
      req.params.campaign_id,
    ]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { campaign_id, user_email, comment_text } = req.body;
    const r = await pool.query(
      "INSERT INTO campaign_comments (campaign_id,user_email,comment_text) VALUES ($1,$2,$3) RETURNING *",
      [campaign_id, user_email, comment_text]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCommentsByCampaign = async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM campaign_comments WHERE campaign_id=$1",
      [req.params.campaign_id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

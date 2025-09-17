import request from "supertest";
import express from "express";
import campaignRoutes from "../routes/campaignRoutes.js";
import pool from "../db/db.js";
import { sendCampaignEmail } from "../services/emailService.js";
import { uploadToS3 } from "../middleware/uploadMiddleware.js";

jest.mock("../db/db.js");
jest.mock("../services/emailService.js");
jest.mock("../middleware/uploadMiddleware.js");

const app = express();
app.use(express.json());
app.use("/api", campaignRoutes);

describe("Campaign Service API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/campaigns - should create a campaign", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ campaign_id: 1, title: "Test Campaign" }] })
      .mockResolvedValueOnce({ rows: [{ email: "donor@example.com" }] });
    sendCampaignEmail.mockResolvedValue();

    const res = await request(app)
      .post("/api/campaigns")
      .send({
        ngo_email: "ngo@example.com",
        title: "Test Campaign",
        description: "Test Description",
        target_amount: 1000,
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        city: "Test City",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(sendCampaignEmail).toHaveBeenCalled();
  });

  test("GET /api/campaigns - should get all campaigns", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ campaign_id: 1, title: "Test Campaign" }],
    });

    const res = await request(app).get("/api/campaigns");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/campaigns/:id - should return 404 when not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/campaigns/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Campaign not found");
  });

  test("PUT /api/campaigns/:id - should update campaign", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ campaign_id: 1, title: "Updated Campaign" }],
    });

    const res = await request(app)
      .put("/api/campaigns/1")
      .send({
        title: "Updated Campaign",
        description: "Updated Desc",
        target_amount: 2000,
        raised_amount: 500,
        status: "Active",
        end_date: "2025-12-31",
        city: "New City",
      });

    expect(res.status).toBe(200);
    expect(res.body.campaign_id).toBe(1);
  });

  test("DELETE /api/campaigns/:id - should delete campaign", async () => {
    pool.query.mockResolvedValueOnce({});

    const res = await request(app).delete("/api/campaigns/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Campaign deleted");
  });

  test("POST /api/categories - should create category", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ category_name: "Health", description: "Health related" }],
    });

    const res = await request(app)
      .post("/api/categories")
      .send({ category_name: "Health", description: "Health related" });

    expect(res.status).toBe(200);
    expect(res.body.category_name).toBe("Health");
  });

  test("GET /api/categories - should get all categories", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ category_name: "Health", description: "Health related" }],
    });

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/campaign-categories - should map campaign to category", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ campaign_id: 1, category_id: 1 }],
    });

    const res = await request(app)
      .post("/api/campaign-categories")
      .send({ campaign_id: 1, category_id: 1 });

    expect(res.status).toBe(200);
    expect(res.body.campaign_id).toBe(1);
  });

  test("POST /api/media - should add media", async () => {
    uploadToS3.mockResolvedValueOnce("https://s3.amazonaws.com/media.png");
    pool.query.mockResolvedValueOnce({
      rows: [{ media_url: "https://s3.amazonaws.com/media.png" }],
    });

    const res = await request(app)
      .post("/api/media")
      .field("campaign_id", 1)
      .field("media_type", "image")
      .attach("media_file", Buffer.from("test file content"), "test.png");

    expect(res.status).toBe(200);
    expect(res.body.media_url).toBe("https://s3.amazonaws.com/media.png");
  });

  test("GET /api/media/:campaign_id - should return media", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ media_url: "https://s3.amazonaws.com/media.png" }],
    });

    const res = await request(app).get("/api/media/1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/donations - should create a donation", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ campaign_id: 1, donor_email: "donor@example.com", amount: 100 }],
    });

    const res = await request(app)
      .post("/api/donations")
      .send({
        campaign_id: 1,
        donor_email: "donor@example.com",
        amount: 100,
        payment_method: "card",
      });

    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(100);
  });

  test("GET /api/donations/:campaign_id - should get donations", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ amount: 100, donor_email: "donor@example.com" }],
    });

    const res = await request(app).get("/api/donations/1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/campaigns/email/:email - should get campaigns by NGO email", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ campaign_id: 1, ngo_email: "ngo@example.com" }],
    });

    const res = await request(app).get("/api/campaigns/email/ngo@example.com");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.campaigns)).toBe(true);
  });

  test("POST /api/comments - should add a comment", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ comment_text: "Great Campaign!" }],
    });

    const res = await request(app)
      .post("/api/comments")
      .send({
        campaign_id: 1,
        user_email: "user@example.com",
        comment_text: "Great Campaign!",
      });

    expect(res.status).toBe(200);
    expect(res.body.comment_text).toBe("Great Campaign!");
  });

  test("GET /api/comments/:campaign_id - should get comments by campaign", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ comment_text: "Great Campaign!" }],
    });

    const res = await request(app).get("/api/comments/1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

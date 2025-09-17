// _tests_/donation.test.js
import * as donorController from "../controllers/donorController.js";
import pool from "../db/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

jest.mock("../db/db.js", () => ({ query: jest.fn() }));
jest.mock("razorpay");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Donor Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();
    jest.clearAllMocks();
  });

  // ------------------------
  // createDonation
  // ------------------------
  test("createDonation - success", async () => {
    req.body = {
      campaign_id: 1,
      donor_email: "a@test.com",
      amount: 100,
      payment_method: "card",
    };
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({});
    await donorController.createDonation(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createDonation - error", async () => {
    pool.query.mockRejectedValue(new Error("DB fail"));
    await donorController.createDonation(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // getDonation
  // ------------------------
  test("getDonation - found", async () => {
    req.params.id = 1;
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    await donorController.getDonation(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  test("getDonation - not found", async () => {
    req.params.id = 1;
    pool.query.mockResolvedValue({ rows: [] });
    await donorController.getDonation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getDonation - error", async () => {
    pool.query.mockRejectedValue(new Error("fail"));
    await donorController.getDonation(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // updateDonationStatus
  // ------------------------
  test("updateDonationStatus - success", async () => {
    req.params.id = 1;
    req.body.payment_status = "SUCCESS";
    pool.query.mockResolvedValue({
      rows: [{ id: 1, payment_status: "SUCCESS" }],
    });
    await donorController.updateDonationStatus(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: 1, payment_status: "SUCCESS" });
  });

  test("updateDonationStatus - not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await donorController.updateDonationStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateDonationStatus - error", async () => {
    pool.query.mockRejectedValue(new Error("fail"));
    await donorController.updateDonationStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // deleteDonation
  // ------------------------
  test("deleteDonation - success", async () => {
    req.params.id = 1;
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, amount: 100, campaign_id: 2 }] }) // SELECT
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // DELETE
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // UPDATE
    await donorController.deleteDonation(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: "Donation deleted and campaign total updated",
    });
  });

  test("deleteDonation - not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await donorController.deleteDonation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deleteDonation - error", async () => {
    pool.query.mockRejectedValue(new Error("fail"));
    await donorController.deleteDonation(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // getAllDonations
  // ------------------------
  test("getAllDonations - success", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    await donorController.getAllDonations(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test("getAllDonations - error", async () => {
    pool.query.mockRejectedValue(new Error("fail"));
    await donorController.getAllDonations(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // getDonationsByEmail
  // ------------------------
  test("getDonationsByEmail - success", async () => {
    req.params.email = "a@test.com";
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    await donorController.getDonationsByEmail(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test("getDonationsByEmail - error", async () => {
    pool.query.mockRejectedValue(new Error("fail"));
    await donorController.getDonationsByEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // createOrder
  // ------------------------

  test("createOrder - success", async () => {
    req.body = {
      campaign_id: 1,
      donor_email: "a@test.com",
      amount: 100,
      payment_method: "card",
    };

    // mock DB
    pool.query
      .mockResolvedValueOnce({ rows: [{ donation_id: "123" }] }) // insert donation
      .mockResolvedValueOnce({ rows: [{ transaction_id: "tx1" }] }); // insert transaction

    // patch the already-exported razorpay instance
    donorController.razorpay.orders = {
      create: jest.fn().mockResolvedValue({ id: "order1" }),
    };

    await donorController.createOrder(req, res);

    expect(res.json).toHaveBeenCalledWith({
      orderId: "order1",
      donationId: "123",
      transactionId: "tx1",
      amount: 100,
      currency: "INR",
    });
  });

  test("createOrder - donationData missing", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    donorController.razorpay.orders = { create: jest.fn() };

    await donorController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("createOrder - error", async () => {
    pool.query.mockRejectedValue(new Error("fail"));
    donorController.razorpay.orders = { create: jest.fn() };

    await donorController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // verifyPayment
  // ------------------------
  test("verifyPayment - missing fields", async () => {
    req.body = {};
    await donorController.verifyPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("verifyPayment - invalid signature", async () => {
    req.body = {
      razorpay_order_id: "o1",
      razorpay_payment_id: "p1",
      razorpay_signature: "invalid",
      donationId: 1,
      transactionId: 1,
    };
    jest.spyOn(crypto, "createHmac").mockReturnValue({
      update: () => ({ digest: () => "notmatching" }),
    });
    await donorController.verifyPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("verifyPayment - success", async () => {
    req.body = {
      razorpay_order_id: "o1",
      razorpay_payment_id: "p1",
      razorpay_signature: "valid",
      donationId: 1,
      transactionId: 2,
    };
    jest.spyOn(crypto, "createHmac").mockReturnValue({
      update: () => ({ digest: () => "valid" }),
    });
    pool.query.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    await donorController.verifyPayment(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: "Payment verified successfully",
    });
  });

  test("verifyPayment - error", async () => {
    req.body = {
      razorpay_order_id: "o1",
      razorpay_payment_id: "p1",
      razorpay_signature: "valid",
      donationId: 1,
      transactionId: 2,
    };
    jest.spyOn(crypto, "createHmac").mockReturnValue({
      update: () => ({ digest: () => "valid" }),
    });
    pool.query.mockRejectedValue(new Error("fail"));
    await donorController.verifyPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
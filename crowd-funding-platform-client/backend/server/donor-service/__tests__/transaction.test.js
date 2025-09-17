import * as transactionController from "../controllers/transactionController.js";
import pool from "../db/db.js";

jest.mock("../db/db.js", () => ({
  query: jest.fn(),
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Transaction Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = mockRes();
    jest.clearAllMocks();
  });

  test("createTransaction - success", async () => {
    req.body = {
      donation_id: 1,
      transaction_amount: 200,
      payment_gateway: "Razorpay",
      transaction_status: "PENDING",
    };
    pool.query.mockResolvedValue({
      rows: [{ id: 1, transaction_status: "PENDING" }],
    });

    await transactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      transaction_status: "PENDING",
    });
  });

  test("getTransaction - not found", async () => {
    req.params.id = 5;
    pool.query.mockResolvedValue({ rows: [] });

    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateTransactionStatus - success", async () => {
    req.params.id = 2;
    req.body.transaction_status = "SUCCESS";
    pool.query.mockResolvedValue({
      rows: [{ id: 2, transaction_status: "SUCCESS" }],
    });

    await transactionController.updateTransactionStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({
      id: 2,
      transaction_status: "SUCCESS",
    });
  });

  test("deleteTransaction - not found", async () => {
    req.params.id = 10;
    pool.query.mockResolvedValue({ rows: [] });

    await transactionController.deleteTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("getTransaction - DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB fail"));
    req.params.id = 1;
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB fail" });
  });

  test("updateTransactionStatus - DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("Update fail"));
    req.params.id = 1;
    req.body.transaction_status = "SUCCESS";
    await transactionController.updateTransactionStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Update fail" });
  });

  test("deleteTransaction - success", async () => {
    req.params.id = 10;
    pool.query.mockResolvedValue({ rows: [{ id: 10 }] });
    await transactionController.deleteTransaction(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Deleted" });
  });

  test("deleteTransaction - DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("Delete fail"));
    req.params.id = 10;
    await transactionController.deleteTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Delete fail" });
  });

  test("getTransaction - not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getTransaction - error", async () => {
    pool.query.mockRejectedValue(new Error("DB fail"));
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
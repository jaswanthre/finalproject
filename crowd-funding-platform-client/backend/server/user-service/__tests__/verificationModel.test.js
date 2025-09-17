import * as verificationModel from "../models/verificationModel.js";
import pool from "../db/db.js";

jest.mock("../db/db.js", () => {
  const client = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue(client),
    __client: client, // expose for direct mocking
  };
});

const client = pool.__client;

describe("verificationModel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createVerificationByEmail should insert verification", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, status: "PENDING" }] });

    const res = await verificationModel.createVerificationByEmail(
      "john@test.com",
      {
        ngo_registration_doc: "doc1",
        pan_card: "doc2",
        bank_proof: "doc3",
        id_proof: "doc4",
      }
    );

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO verifications"),
      expect.any(Array)
    );
    expect(res.status).toBe("PENDING");
  });

  test("getVerificationByEmail should fetch verification", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, status: "APPROVED" }] });
    const res = await verificationModel.getVerificationByEmail("john@test.com");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("JOIN users"),
      ["john@test.com"]
    );
    expect(res.status).toBe("APPROVED");
  });

  test("updateVerificationByEmail should commit and return updated", async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 1, status: "PENDING" }] }) // updateQuery
      .mockResolvedValueOnce({}); // COMMIT

    const res = await verificationModel.updateVerificationByEmail(
      "john@test.com",
      {},
      "PENDING"
    );

    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(res.status).toBe("PENDING");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
  });

  test("updateVerificationByEmail should set user verified when status APPROVED", async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 1, status: "APPROVED" }] }) // update verifications
      .mockResolvedValueOnce({}) // UPDATE users SET is_verified
      .mockResolvedValueOnce({}); // COMMIT

    const res = await verificationModel.updateVerificationByEmail(
      "john@test.com",
      {},
      "APPROVED"
    );

    expect(res.status).toBe("APPROVED");
    expect(client.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("UPDATE verifications"),
      expect.any(Array)
    );
    expect(client.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("UPDATE users SET is_verified=true"),
      ["john@test.com"]
    );
  });

  test("updateVerificationByEmail should rollback on error", async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("fail")); // updateQuery fails

    await expect(
      verificationModel.updateVerificationByEmail(
        "john@test.com",
        {},
        "PENDING"
      )
    ).rejects.toThrow("fail");

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
  });

  test("deleteVerificationByEmail should delete and return row", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2 }] });
    const res = await verificationModel.deleteVerificationByEmail(
      "john@test.com"
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM verifications"),
      ["john@test.com"]
    );
    expect(res.id).toBe(2);
  });

  test("adminUpdateVerificationStatus should commit on success", async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 3, status: "APPROVED" }] }) // update verifications
      .mockResolvedValueOnce({}) // UPDATE users
      .mockResolvedValueOnce({}); // COMMIT

    const res = await verificationModel.adminUpdateVerificationStatus(
      "john@test.com",
      "APPROVED",
      "ok"
    );

    expect(res.status).toBe("APPROVED");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
  });

  test("adminUpdateVerificationStatus should rollback on error", async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error("fail")); // update verifications fails

    await expect(
      verificationModel.adminUpdateVerificationStatus(
        "john@test.com",
        "APPROVED",
        "ok"
      )
    ).rejects.toThrow("fail");

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
  });

  test("should update user is_verified when status is APPROVED", async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 5, status: "APPROVED" }] }) // update verifications
      .mockResolvedValueOnce({}) // UPDATE users
      .mockResolvedValueOnce({}); // COMMIT

    const result = await verificationModel.adminUpdateVerificationStatus(
      "ngo@test.com",
      "APPROVED",
      "All good"
    );

    // ensure correct calls
    expect(client.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("UPDATE verifications"),
      ["ngo@test.com", "APPROVED", "All good"]
    );

    expect(client.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("UPDATE users SET is_verified=true"),
      ["ngo@test.com"]
    );

    // the verification row should be returned
    expect(result).toEqual({ id: 5, status: "APPROVED" });
  });

  test("getAllVerifications should fetch all", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
    const res = await verificationModel.getAllVerifications();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("FROM verifications"),
      []
    );
    expect(res.length).toBe(2);
  });

  test("getAllVerifications should filter by status", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, status: "PENDING" }] });
    const res = await verificationModel.getAllVerifications("PENDING");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE v.status=$1"),
      ["PENDING"]
    );
    expect(res[0].status).toBe("PENDING");
  });
});

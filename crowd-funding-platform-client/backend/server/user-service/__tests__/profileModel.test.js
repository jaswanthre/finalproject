import * as profileModel from "../models/profileModel.js";
import pool from "../db/db.js";

jest.mock("../db/db.js", () => ({
  query: jest.fn(),
}));

describe("profileModel", () => {
  afterEach(() => jest.clearAllMocks());

  test("createProfile should insert profile and return row", async () => {
    const fakeRow = { id: 1, email: "john@test.com" };
    pool.query.mockResolvedValue({ rows: [fakeRow] });

    const result = await profileModel.createProfile(
      1,
      "john@test.com",
      "John",
      "Doe",
      "123",
      "bio",
      "addr",
      "img.png"
    );

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO profiles"),
      expect.any(Array)
    );
    expect(result).toEqual(fakeRow);
  });

  test("getProfile should fetch by userId", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const res = await profileModel.getProfile(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM profiles"),
      [1]
    );
    expect(res).toEqual({ id: 1 });
  });

  test("updateProfile should update and return row", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, bio: "new bio" }] });
    const res = await profileModel.updateProfile(
      1,
      "John",
      "Doe",
      "123",
      "new bio",
      "addr",
      "img.png"
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE profiles"),
      expect.any(Array)
    );
    expect(res.bio).toBe("new bio");
  });

  test("deleteProfile should delete and return row", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const res = await profileModel.deleteProfile(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM profiles"),
      [1]
    );
    expect(res).toEqual({ id: 1 });
  });

  test("getProfileByEmail should join users and return row", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2, email: "john@test.com" }] });
    const res = await profileModel.getProfileByEmail("john@test.com");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("JOIN users"),
      ["john@test.com"]
    );
    expect(res.email).toBe("john@test.com");
  });

  test("deleteProfileByEmail should delete using join and return row", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3, email: "john@test.com" }] });
    const res = await profileModel.deleteProfileByEmail("john@test.com");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM profiles"),
      ["john@test.com"]
    );
    expect(res.email).toBe("john@test.com");
  });
});

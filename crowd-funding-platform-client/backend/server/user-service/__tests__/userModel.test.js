import * as userModel from "../models/userModel.js";
import pool from "../db/db.js";

jest.mock("../db/db.js", () => ({
  query: jest.fn(),
}));

describe("userModel", () => {
  afterEach(() => jest.clearAllMocks());

  test("createUser should insert and return user", async () => {
    const fake = { id: 1, email: "john@test.com" };
    pool.query.mockResolvedValue({ rows: [fake] });

    const res = await userModel.createUser("John", "john@test.com", "pwd", 2);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      ["John", "john@test.com", "pwd", 2]
    );
    expect(res).toEqual(fake);
  });

  test("findUserByEmail should fetch by email", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const res = await userModel.findUserByEmail("john@test.com");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM users"),
      ["john@test.com"]
    );
    expect(res.id).toBe(1);
  });

  test("updateUserRoleByEmail should update role", async () => {
    pool.query.mockResolvedValue({ rows: [{ role_id: 1 }] });
    const res = await userModel.updateUserRoleByEmail("john@test.com", 1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE users"),
      [1, "john@test.com"]
    );
    expect(res.role_id).toBe(1);
  });

  test("deleteUserByEmail should delete user", async () => {
    pool.query.mockResolvedValue({ rows: [{ email: "john@test.com" }] });
    const res = await userModel.deleteUserByEmail("john@test.com");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM users"),
      ["john@test.com"]
    );
    expect(res.email).toBe("john@test.com");
  });

  test("getAllUsers should return all users", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
    const res = await userModel.getAllUsers();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT id, name, email")
    );
    expect(res.length).toBe(2);
  });
});

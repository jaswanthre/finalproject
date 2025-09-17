import "../db/aws.js";

describe("aws.js", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test("should log AWS env vars when NODE_ENV is not test", async () => {
    process.env.NODE_ENV = "development";
    process.env.MY_AWS_REGION = "us-east-1";
    process.env.MY_AWS_ACCESS_KEY_ID = "fakeKey";
    process.env.MY_AWS_SECRET_ACCESS_KEY = "fakeSecret";

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await import("../db/aws.js"); // re-import with NODE_ENV overridden

    expect(spy).toHaveBeenCalledWith("us-east-1");
    expect(spy).toHaveBeenCalledWith("fakeKey");
    expect(spy).toHaveBeenCalledWith("fakeSecret");

    spy.mockRestore();
  });
});

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("Health Check API", () => {
  it("should return ok status for /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      message: "Massar API is running!",
    });
  });

  it("should return ok status for /api/healthz", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

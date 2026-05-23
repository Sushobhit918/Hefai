import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("createApp", () => {
  it("creates an express app", () => {
    const app = createApp();
    expect(typeof app.listen).toBe("function");
  });
});

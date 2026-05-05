import { normalizeApiError } from "@/lib/apiError";

describe("normalizeApiError", () => {
  it("returns 'Network error' for null/undefined", () => {
    expect(normalizeApiError(null)).toBe("Network error");
    expect(normalizeApiError(undefined)).toBe("Network error");
  });

  it("returns the value as-is when given a string", () => {
    expect(normalizeApiError("Custom message")).toBe("Custom message");
  });

  it("prefers response.data.error over message and base error", () => {
    const err = {
      response: { data: { error: "from-error", message: "from-message" } },
      message: "from-base",
    };
    expect(normalizeApiError(err)).toBe("from-error");
  });

  it("falls back to response.data.message when error is missing", () => {
    const err = {
      response: { data: { message: "from-message" } },
      message: "from-base",
    };
    expect(normalizeApiError(err)).toBe("from-message");
  });

  it("falls back to error.message when no response data", () => {
    expect(normalizeApiError({ message: "boom" })).toBe("boom");
  });

  it("falls back to 'Network error' when nothing is set", () => {
    expect(normalizeApiError({})).toBe("Network error");
  });
});

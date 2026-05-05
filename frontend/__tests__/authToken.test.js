import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/authToken";

describe("authToken storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no token is stored", () => {
    expect(getAuthToken()).toBeNull();
  });

  it("stores and retrieves a token", () => {
    setAuthToken("abc.def.ghi");
    expect(getAuthToken()).toBe("abc.def.ghi");
  });

  it("does not write when given a falsy value", () => {
    setAuthToken("");
    expect(getAuthToken()).toBeNull();
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
    setAuthToken(undefined);
    expect(getAuthToken()).toBeNull();
  });

  it("clears a stored token", () => {
    setAuthToken("xyz");
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });
});

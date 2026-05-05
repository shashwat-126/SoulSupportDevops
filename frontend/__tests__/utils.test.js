import { cn, formatDate, formatTime } from "@/lib/utils";

describe("cn (class name merger)", () => {
  it("joins multiple class strings", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("supports conditional objects", () => {
    expect(cn("a", { b: true, c: false })).toBe("a b");
  });

  it("dedupes conflicting tailwind classes (twMerge behavior)", () => {
    // twMerge keeps the LAST tailwind utility when two conflict
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatDate", () => {
  it("formats a date string into a long-form locale date", () => {
    const out = formatDate("2025-03-15T12:00:00.000Z");
    // Locale-dependent but always contains the year
    expect(out).toMatch(/2025/);
  });

  it("accepts a Date instance", () => {
    const out = formatDate(new Date("2024-01-01T00:00:00.000Z"));
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});

describe("formatTime", () => {
  it("returns a non-empty time string", () => {
    const out = formatTime("2025-03-15T13:30:00.000Z");
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });

  it("accepts a Date instance", () => {
    const out = formatTime(new Date());
    expect(typeof out).toBe("string");
  });
});

import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>active</Badge>);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("uses the neutral tone by default", () => {
    render(<Badge>n</Badge>);
    expect(screen.getByText("n").className).toMatch(/bg-surface-alt/);
  });

  it.each([
    ["success", /bg-green-50/],
    ["danger", /bg-red-50/],
    ["info", /bg-accent-soft/],
    ["primary", /bg-primary-soft/],
    ["warning", /bg-amber-50/],
  ])("applies the %s tone", (tone, classRegex) => {
    render(<Badge tone={tone}>x</Badge>);
    expect(screen.getByText("x").className).toMatch(classRegex);
  });

  it("merges a custom className", () => {
    render(<Badge className="extra-class">x</Badge>);
    expect(screen.getByText("x").className).toMatch(/extra-class/);
  });
});

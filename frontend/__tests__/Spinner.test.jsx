import { render } from "@testing-library/react";
import { Spinner } from "@/components/ui/Spinner";

describe("Spinner", () => {
  it("renders with the default md size", () => {
    const { container } = render(<Spinner />);
    const el = container.firstChild;
    expect(el).not.toBeNull();
    expect(el.className).toMatch(/h-6/);
    expect(el.className).toMatch(/animate-spin/);
  });

  it.each([
    ["sm", /h-4/],
    ["md", /h-6/],
    ["lg", /h-10/],
  ])("applies the %s size", (size, classRegex) => {
    const { container } = render(<Spinner size={size} />);
    expect(container.firstChild.className).toMatch(classRegex);
  });
});

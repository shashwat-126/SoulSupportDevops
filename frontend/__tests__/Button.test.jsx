import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Tap</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Tap" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("respects the disabled prop", () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const btn = screen.getByRole("button", { name: "Disabled" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("is disabled while loading and renders the spinner svg", () => {
    const { container } = render(<Button isLoading>Saving</Button>);
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies the primary variant class by default", () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole("button", { name: "Default" }).className).toMatch(/bg-primary/);
  });

  it.each([
    ["secondary", /bg-surface-alt/],
    ["outline", /border-primary/],
    ["ghost", /hover:bg-gray-100/],
    ["danger", /bg-coral/],
  ])("applies the %s variant", (variant, classRegex) => {
    render(<Button variant={variant}>Variant</Button>);
    expect(screen.getByRole("button", { name: "Variant" }).className).toMatch(classRegex);
  });

  it.each([
    ["sm", /text-sm/],
    ["md", /text-base/],
    ["lg", /text-lg/],
  ])("applies the %s size", (size, classRegex) => {
    render(<Button size={size}>Size</Button>);
    expect(screen.getByRole("button", { name: "Size" }).className).toMatch(classRegex);
  });

  it("forwards arbitrary props to the underlying button element", () => {
    render(<Button type="submit" data-testid="submit-btn">Send</Button>);
    const btn = screen.getByTestId("submit-btn");
    expect(btn).toHaveAttribute("type", "submit");
  });

  it("forwards refs", () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

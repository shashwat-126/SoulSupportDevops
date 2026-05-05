import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders a bare input when no label/error/helperText props are passed", () => {
    render(<Input placeholder="email" defaultValue="hello" />);
    const input = screen.getByPlaceholderText("email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("hello");
    // bare mode should not render a label
    expect(screen.queryByText("email")).toBe(null);
  });

  it("renders a label and links it via htmlFor/id", () => {
    render(<Input id="email-field" label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email-field");
  });

  it("shows the required asterisk when required is set", () => {
    const { container } = render(<Input id="x" label="Name" required />);
    expect(container.querySelector("span[aria-hidden='true']")).toHaveTextContent("*");
  });

  it("renders error text and sets aria-invalid", () => {
    render(<Input id="pwd" label="Password" error="Too short" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Too short")).toBeInTheDocument();
    expect(screen.getByText("Too short")).toHaveAttribute("id", "pwd-error");
  });

  it("renders helper text when no error is present", () => {
    render(<Input id="user" label="Username" helperText="No spaces allowed" />);
    expect(screen.getByText("No spaces allowed")).toBeInTheDocument();
  });

  it("hides helper text when an error is also provided", () => {
    render(
      <Input id="user" label="Username" error="Required" helperText="Helper" />
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("calls onChange when the user types", () => {
    const onChange = jest.fn();
    render(<Input id="x" label="X" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("X"), { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("forwards refs", () => {
    const ref = { current: null };
    render(<Input ref={ref} placeholder="ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

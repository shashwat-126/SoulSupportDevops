import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "@/components/ui/Textarea";

// Note: the Textarea component renders a <label> as a sibling (not wrapping
// the textarea and without htmlFor), so we cannot use getByLabelText.
// We use getByRole("textbox") which works for any textarea.

describe("Textarea", () => {
  it("renders without label/error", () => {
    render(<Textarea placeholder="notes" />);
    expect(screen.getByPlaceholderText("notes")).toBeInTheDocument();
  });

  it("renders a label", () => {
    render(<Textarea id="bio" label="Bio" />);
    expect(screen.getByText("Bio")).toBeInTheDocument();
  });

  it("renders the required asterisk when required", () => {
    render(<Textarea id="bio" label="Bio" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders error text and sets aria-invalid", () => {
    render(<Textarea id="bio" label="Bio" error="Required field" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Required field")).toBeInTheDocument();
    expect(screen.getByText("Required field")).toHaveAttribute("id", "bio-error");
  });

  it("renders helper text when no error is present", () => {
    render(<Textarea id="bio" label="Bio" helperText="Max 500 chars" />);
    expect(screen.getByText("Max 500 chars")).toBeInTheDocument();
  });

  it("forwards onChange events", () => {
    const onChange = jest.fn();
    render(<Textarea id="x" label="X" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hi" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("forwards refs", () => {
    const ref = { current: null };
    render(<Textarea ref={ref} placeholder="ref" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

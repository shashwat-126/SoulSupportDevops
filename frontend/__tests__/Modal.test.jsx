import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "@/components/ui/Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(<Modal open={false} title="Hi" onClose={() => {}}>body</Modal>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title and children when open", () => {
    render(<Modal open title="My title" onClose={() => {}}>Body content</Modal>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("My title")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders an optional description with proper aria wiring", () => {
    render(
      <Modal open title="t" description="explanation" onClose={() => {}}>
        body
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    expect(dialog).toHaveAttribute("aria-describedby", "modal-description");
    expect(screen.getByText("explanation")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn();
    render(<Modal open title="t" onClose={onClose}>body</Modal>);
    fireEvent.click(screen.getByLabelText("Close dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when ESC is pressed", () => {
    const onClose = jest.fn();
    render(<Modal open title="t" onClose={onClose}>body</Modal>);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay backdrop is clicked", () => {
    const onClose = jest.fn();
    render(<Modal open title="t" onClose={onClose}>body</Modal>);
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when an inner element is clicked", () => {
    const onClose = jest.fn();
    render(<Modal open title="t" onClose={onClose}>Body content</Modal>);
    fireEvent.click(screen.getByText("Body content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders an actions footer when provided", () => {
    render(
      <Modal open title="t" onClose={() => {}} actions={<button>Save</button>}>
        body
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("locks body scroll while open and restores it when closed", () => {
    const { rerender, unmount } = render(<Modal open title="t" onClose={() => {}}>body</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<Modal open={false} title="t" onClose={() => {}}>body</Modal>);
    expect(document.body.style.overflow).toBe("");
    unmount();
  });
});

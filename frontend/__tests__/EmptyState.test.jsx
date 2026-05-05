import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/common/EmptyState";

describe("EmptyState", () => {
  it("renders default title and description when no props are passed", () => {
    render(<EmptyState />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByText("Come back soon for updates")).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(<EmptyState title="No sessions" description="You have no upcoming sessions" />);
    expect(screen.getByText("No sessions")).toBeInTheDocument();
    expect(screen.getByText("You have no upcoming sessions")).toBeInTheDocument();
  });

  it("renders the action node when provided", () => {
    render(<EmptyState action={<button>Book one</button>} />);
    expect(screen.getByRole("button", { name: "Book one" })).toBeInTheDocument();
  });

  it("does not render an action wrapper when action is not provided", () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});

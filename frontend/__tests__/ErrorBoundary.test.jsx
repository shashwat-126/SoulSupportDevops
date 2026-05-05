import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Bomb({ shouldThrow }) {
  if (shouldThrow) throw new Error("kaboom");
  return <div>safe content</div>;
}

describe("ErrorBoundary", () => {
  // ErrorBoundary logs errors via console.error in dev mode; silence them
  // for these tests so they don't pollute output.
  let originalError;
  beforeAll(() => {
    originalError = console.error;
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("safe content")).toBeInTheDocument();
  });

  it("renders the fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go home" })).toBeInTheDocument();
  });

  it("recovers and re-renders children when 'Try again' is clicked after a safe rerender", () => {
    // Step 1: render with throwing children → fallback is shown.
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Step 2: rerender with non-throwing children. The boundary's
    // hasError state is still true so the fallback still shows.
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Step 3: click "Try again". This resets hasError, React re-renders,
    // and the now-safe children render successfully.
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("safe content")).toBeInTheDocument();
  });
});

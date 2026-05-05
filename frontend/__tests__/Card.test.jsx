import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

describe("Card compound component", () => {
  it("renders a complete card with all subcomponents", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Subtitle</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("CardTitle renders as an h3", () => {
    render(<CardTitle>The title</CardTitle>);
    const heading = screen.getByText("The title");
    expect(heading.tagName).toBe("H3");
  });

  it("merges custom className with defaults", () => {
    render(<Card className="custom-test-class">x</Card>);
    expect(screen.getByText("x").className).toMatch(/custom-test-class/);
  });

  it("forwards refs on Card", () => {
    const ref = { current: null };
    render(<Card ref={ref}>x</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorAlert } from "@/components/ui/error-alert";

describe("ErrorAlert", () => {
  it("renders error message", () => {
    render(<ErrorAlert message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders alert icon", () => {
    const { container } = render(<ErrorAlert message="Error" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not render when message is empty", () => {
    const { container } = render(<ErrorAlert message="" />);
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent("");
  });
});

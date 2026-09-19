/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";

describe("App component", () => {
  it("renders without crashing", () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });
});

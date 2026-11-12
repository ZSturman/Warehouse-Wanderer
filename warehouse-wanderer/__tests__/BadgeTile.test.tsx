import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { BadgeTile } from "../src/components/BadgeTile";
import type { BadgeProgress } from "../src/types";

function mkBadge(overrides: Partial<BadgeProgress> = {}): BadgeProgress {
  return {
    definition: {
      id: "milestone-5",
      name: "Getting Your Bearings",
      description: "Visit 5 unique warehouses.",
      icon: "🗺️",
      tier: "bronze",
      category: "milestone",
      criteria: { type: "unique_visits", threshold: 5 },
    },
    unlocked: false,
    current: 2,
    target: 5,
    ...overrides,
  };
}

describe("BadgeTile", () => {
  it("shows progress toward an unlocked badge", async () => {
    await render(<BadgeTile badge={mkBadge()} onPress={() => {}} />);
    expect(screen.getByText("2/5")).toBeTruthy();
    expect(screen.getByText("Getting Your Bearings")).toBeTruthy();
  });

  it("shows an unlocked status once complete", async () => {
    await render(<BadgeTile badge={mkBadge({ unlocked: true, current: 5 })} onPress={() => {}} />);
    expect(screen.getByText("Unlocked")).toBeTruthy();
  });

  it("fires onPress when tapped", async () => {
    const onPress = jest.fn();
    await render(<BadgeTile badge={mkBadge()} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText(/Getting Your Bearings/));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

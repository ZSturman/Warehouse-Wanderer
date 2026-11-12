jest.mock("expo-location", () => ({
  PermissionStatus: { GRANTED: "granted", DENIED: "denied", UNDETERMINED: "undetermined" },
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: "undetermined" }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
  getCurrentPositionAsync: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { Text, View } from "react-native";

import { PassportProvider, usePassport } from "../src/state/PassportContext";

beforeEach(async () => {
  await AsyncStorage.clear();
});

function TestConsumer() {
  const { loading, addVisit, addToWishlist, removeFromWishlist, isWishlisted, stats, badges, wishlist } =
    usePassport();

  if (loading) return <Text testID="status">loading</Text>;

  const firstStamp = badges.find((b) => b.definition.id === "first-stamp");

  return (
    <View>
      <Text testID="status">ready</Text>
      <Text testID="unique">{stats.uniqueWarehousesVisited}</Text>
      <Text testID="total">{stats.totalVisitCount}</Text>
      <Text testID="wishlistCount">{wishlist.length}</Text>
      <Text testID="firstStampUnlocked">{String(firstStamp?.unlocked)}</Text>
      <Text testID="isWishlisted">{String(isWishlisted("us-401"))}</Text>
      <Text
        testID="addVisitButton"
        onPress={() => addVisit({ warehouseId: "us-401", visitedAt: "2025-06-01", verification: "manual" })}
      >
        add-visit
      </Text>
      <Text
        testID="addVisitAgainButton"
        onPress={() => addVisit({ warehouseId: "us-401", visitedAt: "2025-07-01", verification: "manual" })}
      >
        add-visit-again
      </Text>
      <Text testID="wishlistButton" onPress={() => addToWishlist("us-401")}>
        wishlist
      </Text>
      <Text testID="unwishlistButton" onPress={() => removeFromWishlist("us-401")}>
        unwishlist
      </Text>
    </View>
  );
}

describe("PassportProvider integration", () => {
  it("loads, adds a manual visit, and reflects it in stats and badge progress", async () => {
    await render(
      <PassportProvider>
        <TestConsumer />
      </PassportProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status").props.children).toBe("ready"));
    expect(screen.getByTestId("unique").props.children).toBe(0);
    expect(screen.getByTestId("firstStampUnlocked").props.children).toBe("false");

    await act(async () => {
      fireEvent.press(screen.getByTestId("addVisitButton"));
    });

    await waitFor(() => expect(screen.getByTestId("unique").props.children).toBe(1));
    expect(screen.getByTestId("total").props.children).toBe(1);
    expect(screen.getByTestId("firstStampUnlocked").props.children).toBe("true");
  });

  it("does not double-count a repeat visit to the same warehouse toward unique total", async () => {
    await render(
      <PassportProvider>
        <TestConsumer />
      </PassportProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status").props.children).toBe("ready"));

    await act(async () => {
      fireEvent.press(screen.getByTestId("addVisitButton"));
    });
    await waitFor(() => expect(screen.getByTestId("unique").props.children).toBe(1));

    await act(async () => {
      fireEvent.press(screen.getByTestId("addVisitAgainButton"));
    });

    await waitFor(() => expect(screen.getByTestId("total").props.children).toBe(2));
    expect(screen.getByTestId("unique").props.children).toBe(1);
  });

  it("adds and removes wishlist entries", async () => {
    await render(
      <PassportProvider>
        <TestConsumer />
      </PassportProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status").props.children).toBe("ready"));

    await act(async () => {
      fireEvent.press(screen.getByTestId("wishlistButton"));
    });
    await waitFor(() => expect(screen.getByTestId("wishlistCount").props.children).toBe(1));
    expect(screen.getByTestId("isWishlisted").props.children).toBe("true");

    await act(async () => {
      fireEvent.press(screen.getByTestId("unwishlistButton"));
    });
    await waitFor(() => expect(screen.getByTestId("wishlistCount").props.children).toBe(0));
  });

  it("persists visits across a provider remount (simulated app relaunch)", async () => {
    const view = await render(
      <PassportProvider>
        <TestConsumer />
      </PassportProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status").props.children).toBe("ready"));
    await act(async () => {
      fireEvent.press(screen.getByTestId("addVisitButton"));
    });
    await waitFor(() => expect(screen.getByTestId("unique").props.children).toBe(1));
    await view.unmount();

    await render(
      <PassportProvider>
        <TestConsumer />
      </PassportProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status").props.children).toBe("ready"));
    expect(screen.getByTestId("unique").props.children).toBe(1);
  });
});

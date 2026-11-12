import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { AddVisitScreen } from "../src/screens/AddVisitScreen";

const mockAddVisit = jest.fn();
const mockNavigation = { canGoBack: jest.fn(), goBack: jest.fn(), replace: jest.fn() };
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { warehouseId: "fixture-warehouse", verification: "manual" } }),
}));
jest.mock("../src/state/PassportContext", () => ({
  usePassport: () => ({
    getWarehouseById: () => ({ id: "fixture-warehouse", name: "Fixture warehouse", city: "Fixture city", region: "Fixture region", country: "Fixture country" }),
    addVisit: mockAddVisit,
  }),
}));
jest.mock("../src/components/ScreenContainer", () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));
jest.mock("../src/components/VisitDateField", () => ({
  VisitDateField: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const { TextInput } = require("react-native");
    return <TextInput accessibilityLabel="Visit date" value={value} onChangeText={onChange} />;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigation.canGoBack.mockReturnValue(true);
  mockAddVisit.mockResolvedValue(undefined);
});

it("keeps the entry and allows retry after a storage write failure", async () => {
  mockAddVisit.mockRejectedValueOnce(new Error("storage unavailable"));
  await render(<AddVisitScreen />);
  await fireEvent.changeText(screen.getByPlaceholderText("What did you pick up? Anything memorable?"), "Retain this note");
  await fireEvent.press(screen.getByText("Save to Passport"));
  await waitFor(() => expect(screen.getByText(/Could not save this visit/)).toBeTruthy());
  expect(screen.getByDisplayValue("Retain this note")).toBeTruthy();
  expect(mockNavigation.goBack).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText("Save to Passport"));
  await waitFor(() => expect(mockNavigation.goBack).toHaveBeenCalledTimes(1));
  expect(mockAddVisit).toHaveBeenLastCalledWith(expect.objectContaining({ notes: "Retain this note", verification: "manual" }));
});

it("returns a directly opened entry to warehouse detail after saving", async () => {
  mockNavigation.canGoBack.mockReturnValue(false);
  await render(<AddVisitScreen />);
  await fireEvent.press(screen.getByText("Save to Passport"));
  await waitFor(() => expect(mockNavigation.replace).toHaveBeenCalledWith("WarehouseDetail", { warehouseId: "fixture-warehouse" }));
});

it("rejects a future date before writing a visit", async () => {
  await render(<AddVisitScreen />);
  await fireEvent.changeText(screen.getByLabelText("Visit date"), "2099-01-01");
  await fireEvent.press(screen.getByText("Save to Passport"));
  await waitFor(() => expect(screen.getByText("Choose a valid visit date on or before today.")).toBeTruthy());
  expect(mockAddVisit).not.toHaveBeenCalled();
});

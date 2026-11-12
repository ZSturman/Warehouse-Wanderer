import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Pressable, Text } from "react-native";
import { colors } from "../theme/colors";
import { formatVisitDate, toLocalIsoDate } from "../utils/formatters";

export interface VisitDateFieldProps { value: string; onChange: (value: string) => void; }

export function VisitDateField({ value, onChange }: VisitDateFieldProps) {
  const [open, setOpen] = useState(false);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Visit date" onPress={() => setOpen(true)}
      style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.paper, borderRadius: 12, padding: 16 }}>
      <Text style={{ color: colors.ink, fontWeight: "600" }}>{formatVisitDate(value)}</Text>
    </Pressable>
    {open ? <DateTimePicker value={new Date(`${value}T00:00:00`)} mode="date"
      display={Platform.OS === "ios" ? "inline" : "default"} maximumDate={new Date()}
      onChange={(event, date) => {
        setOpen(Platform.OS === "ios");
        if (event.type !== "dismissed" && date) onChange(toLocalIsoDate(date));
      }} /> : null}
  </>;
}

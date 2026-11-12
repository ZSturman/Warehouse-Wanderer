import React from "react";
import { colors } from "../theme/colors";
import { todayIsoDate } from "../utils/formatters";
import type { VisitDateFieldProps } from "./VisitDateField";

export function VisitDateField({ value, onChange }: VisitDateFieldProps) {
  return <input type="date" aria-label="Visit date" value={value} max={todayIsoDate()}
    onInput={(event) => onChange(event.currentTarget.value)}
    style={{ border: `1px solid ${colors.border}`, background: colors.paper, color: colors.ink,
      borderRadius: 12, padding: 16, font: "inherit", boxSizing: "border-box", width: "100%" }} />;
}

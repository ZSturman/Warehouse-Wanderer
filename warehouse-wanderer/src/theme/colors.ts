export const colors = {
  navy: "#16213E",
  navyDark: "#0F1830",
  navyLight: "#243354",
  gold: "#F2A93B",
  goldDark: "#D68F22",
  teal: "#2FA89C",
  tealDark: "#227F76",
  cream: "#FAF3E4",
  paper: "#FFFCF6",
  ink: "#1C2333",
  inkMuted: "#5A6478",
  border: "#E7DFCC",
  danger: "#C4453B",
  success: "#2FA86A",

  visited: "#2FA89C",
  unvisited: "#B8BFCC",
  nearby: "#F2A93B",
  wishlist: "#9C6ADE",

  bronze: "#C08552",
  silver: "#9AA5B1",
  goldTier: "#F2A93B",
  platinum: "#6EC1E4",
} as const;

export const tierColor: Record<"bronze" | "silver" | "gold" | "platinum", string> = {
  bronze: colors.bronze,
  silver: colors.silver,
  gold: colors.goldTier,
  platinum: colors.platinum,
};

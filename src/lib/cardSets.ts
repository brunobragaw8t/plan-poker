export const CARD_PRESETS: Record<string, string[]> = {
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"],
  modified_fibonacci: ["0", "½", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"],
  t_shirt: ["XS", "S", "M", "L", "XL", "XXL", "?"],
  powers_of_2: ["0", "1", "2", "4", "8", "16", "32", "64", "?"],
  sequential: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "?"],
};

export const PRESET_LABELS: Record<string, string> = {
  fibonacci: "Fibonacci",
  modified_fibonacci: "Modified Fibonacci",
  t_shirt: "T-Shirt Sizes",
  powers_of_2: "Powers of 2",
  sequential: "Sequential (0-10)",
};

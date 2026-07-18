export function categoryFallbackInitial(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase() || "F";
}

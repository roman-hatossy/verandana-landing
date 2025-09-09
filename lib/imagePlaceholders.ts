import plist from "../data/placeholders.json" assert { type: "json" };
export function getPlaceholder(src: string): string | undefined {
  return (plist as Record<string,string>)[src];
}

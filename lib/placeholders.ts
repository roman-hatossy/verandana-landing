import data from "@/data/placeholders.json" assert { type: "json" };
type Entry = { src: string; width: number | null; height: number | null; aspectRatio: number | null; placeholder: string; dominantColor: string; };
type Map = Record<string, Entry>;
const map: Map = (data as any) || {};
export function getPlaceholder(path: string) { return map[path]?.placeholder; }
export function getDominantColor(path: string, fallback = "#f3f4f6") { return map[path]?.dominantColor || fallback; }
export function getAspectRatio(path: string, fallback = "16/9") {
  const ar = map[path]?.aspectRatio; if (!ar) return fallback; return `${ar.toFixed(4)}`;
}

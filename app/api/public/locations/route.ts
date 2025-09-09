export const runtime = "edge";
export async function GET() {
  return new Response(JSON.stringify([{ city: "Warszawa" }, { city: "Gdańsk" }]), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
    }
  });
}

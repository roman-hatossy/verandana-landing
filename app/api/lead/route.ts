import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const fd = await req.formData();
  if ((fd.get("company") as string | null)?.trim()) {
    // honeypot: pretend success
    return NextResponse.json({ ok: true });
  }
  const name = (fd.get("name") as string | null)?.trim();
  const phone = (fd.get("phone") as string | null)?.trim();
  if (!name || !phone) return NextResponse.json({ ok: false, message: "Wpisz imię i telefon." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

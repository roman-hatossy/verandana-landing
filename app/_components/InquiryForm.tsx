"use client";
import { useTransition, useState } from "react";
export default function InquiryForm() {
  const [isPending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="mx-auto grid max-w-2xl gap-4 px-0"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setMsg(null);
        start(async () => {
          try {
            const res = await fetch("/api/lead", { method: "POST", body: fd });
            const json = await res.json();
            setMsg(json.ok ? "Dziękujemy! Wkrótce się odezwiemy." : (json.message ?? "Błąd wysyłki."));
            if (json.ok) (e.currentTarget as HTMLFormElement).reset();
          } catch { setMsg("Błąd sieci."); }
        });
      }}
    >
      <input name="name" required placeholder="Imię i nazwisko" className="rounded-2xl border p-3" />
      <input name="phone" required placeholder="Telefon" className="rounded-2xl border p-3" inputMode="tel" />
      <input name="email" type="email" placeholder="E-mail (opcjonalnie)" className="rounded-2xl border p-3" />
      <textarea name="notes" rows={5} placeholder="Komentarz" className="rounded-2xl border p-3" />
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <button disabled={isPending} className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 font-medium text-white active:scale-[.99]">
        {isPending ? "Wysyłanie…" : "Wyślij"}
      </button>
      {msg && <p className="text-sm text-slate-700">{msg}</p>}
    </form>
  );
}

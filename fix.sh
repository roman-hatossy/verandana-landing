set -e

( lsof -ti :3000 :3001 | xargs -r kill -9 ) 2>/dev/null || true
mkdir -p app/_components scripts data public/images

cat > next.config.mjs <<'JS'
const isProd = process.env.NODE_ENV === 'production';
const devCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' ws: http://localhost:* https://localhost:*",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');
const prodCSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ['image/avif','image/webp'] },
  async headers() {
    return [
      { source: '/_next/static/:all*', headers: [{ key:'Cache-Control', value:'public, max-age=31536000, immutable' }]},
      { source: '/images/:all*', headers: [{ key:'Cache-Control', value:'public, max-age=31536000, immutable' }]},
      { source: '/:path*', headers: [
        { key:'Content-Security-Policy', value: isProd ? prodCSP : devCSP },
        { key:'Referrer-Policy', value:'strict-origin-when-cross-origin' },
        { key:'X-Content-Type-Options', value:'nosniff' },
        { key:'X-Frame-Options', value:'DENY' },
        { key:'Permissions-Policy', value:'camera=(), microphone=(), geolocation=()' }
      ] }
    ];
  }
};
export default nextConfig;
JS

cat > app/layout.tsx <<'TSX'
import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: "VERANDANA — bezpłatna wycena",
  description: "Nowoczesne ogrody zimowe i szklane przedłużenia. Zostaw kontakt – oddzwonimy."
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pl"><body>{children}</body></html>;
}
TSX

cat > app/not-found.tsx <<'TSX'
import type { Viewport } from "next";
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };
export default function NotFound() {
  return (
    <main className="mx-auto max-w-screen-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Nie znaleziono strony</h1>
      <p className="mt-2 text-slate-600">Wróć na stronę główną i spróbuj ponownie.</p>
    </main>
  );
}
TSX

cat > app/page.tsx <<'TSX'
import HeroLCP from "./_components/HeroLCP";
import TileGrid from "./_components/TileGrid";
import FormSection from "./_components/FormSection";
export default function Page() {
  return (
    <main className="mx-auto max-w-screen-lg px-4 pb-16 pt-10">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-semibold tracking-tight">VERANDANA — bezpłatna wycena</h1>
        <p className="mt-2 text-slate-600">Zostaw kontakt, a doradzimy najlepsze rozwiązanie.</p>
      </header>
      <HeroLCP />
      <TileGrid />
      <FormSection />
      <footer className="mt-10 text-center text-xs text-slate-500">© {new Date().getFullYear()} VERANDANA</footer>
    </main>
  );
}
TSX

sed -i '' '/export const runtime *=/d' app/page.tsx 2>/dev/null || true
sed -i '' '/export const runtime *=/d' app/layout.tsx 2>/dev/null || true

cat > app/_components/FormSection.tsx <<'TSX'
"use client";
import dynamic from "next/dynamic";
import LazyOnView from "@/components/LazyOnView";
const InquiryForm = dynamic(() => import("./InquiryForm"), { ssr: false });
export default function FormSection() {
  return (
    <section id="form" className="pt-16">
      <LazyOnView><InquiryForm /></LazyOnView>
    </section>
  );
}
TSX

cat > app/_components/InquiryForm.tsx <<'TSX'
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
          } catch {
            setMsg("Błąd sieci.");
          }
        });
      }}
    >
      <input name="name" required placeholder="Imię i nazwisko" className="rounded-2xl border p-3" />
      <input name="phone" required placeholder="Telefon" className="rounded-2xl border p-3" inputMode="tel" />
      <input name="email" type="email" placeholder="E-mail (opcjonalnie)" className="rounded-2xl border p-3" />
      <textarea name="notes" rows={5} placeholder="Komentarz" className="rounded-2xl border p-3" />
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <button disabled={isPending} className="inline-flex items-center justify-center rounded-2xl bg-brand.navy px-5 py-3 font-medium text-white transition hover:bg-black active:scale-[.99]">
        {isPending ? "Wysyłanie…" : "Wyślij"}
      </button>
      {msg && <p className="text-sm text-slate-700">{msg}</p>}
    </form>
  );
}
TSX

cat > scripts/encode-images.mjs <<'JS'
#!/usr/bin/env node
import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
import sharp from "sharp";
const [, , ROOT = "public/images"] = process.argv;
const FORCE = process.argv.includes("--force");
const outDir = path.resolve(process.cwd(), ROOT);
const placeholdersPath = path.resolve(process.cwd(), "data/placeholders.json");
const extsIn = new Set([".jpg",".jpeg",".png",".webp",".avif"]);
const walk = async (d)=>(await Promise.all((await fs.readdir(d,{withFileTypes:true})).map(async e=>e.isDirectory()?walk(path.resolve(d,e.name)):path.resolve(d,e.name)))).flat();
const toDataURL = (m,b)=>`data:${m};base64,${b.toString("base64")}`;
async function ensureDir(p){ await fs.mkdir(p,{recursive:true}); }
async function encodeOne(file){
  const ext=path.extname(file).toLowerCase(); if(!extsIn.has(ext)) return null;
  const base=file.slice(0,-ext.length); const avif=`${base}.avif`; const webp=`${base}.webp`;
  const input=sharp(file).rotate(); const meta=await input.metadata(); const {dominant}=await input.stats();
  const dom=dominant?`rgb(${dominant.r},${dominant.g},${dominant.b})`:"#eee";
  const blurBuf=await input.resize({width:16,height:Math.max(1,Math.round((meta.height||9)*(16/(meta.width||16)))),fit:"inside"}).webp({quality:30}).toBuffer();
  const blur=toDataURL("image/webp",blurBuf);
  if(FORCE||!fss.existsSync(avif)) await sharp(file).rotate().avif({quality:62}).toFile(avif);
  if(FORCE||!fss.existsSync(webp)) await sharp(file).rotate().webp({quality:74}).toFile(webp);
  const rel=`/${path.relative(path.resolve(process.cwd(),"public"),file).replaceAll("\\","/")}`;
  return { src:rel, width:meta.width??null, height:meta.height??null, aspectRatio:meta.width&&meta.height?meta.width/meta.height:null, placeholder:blur, dominantColor:dom };
}
async function main(){ await ensureDir(path.dirname(placeholdersPath)); const files=(await walk(outDir)).filter(f=>extsIn.has(path.extname(f).toLowerCase())); const results={}; for(const f of files){ const e=await encodeOne(f); if(e) results[e.src]=e; } await fs.writeFile(placeholdersPath, JSON.stringify(results,null,2)); console.log(`✅ Placeholders -> ${path.relative(process.cwd(), placeholdersPath)}`); }
main().catch(e=>{ console.error(e); process.exit(1); });
JS
chmod +x scripts/encode-images.mjs

node -e '
const fs=require("fs");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
pkg.scripts ||= {};
pkg.scripts.dev="next dev";
pkg.scripts.build="next build";
pkg.scripts.start="next start";
pkg.scripts.images="node scripts/encode-images.mjs public/images";
pkg.scripts.lint="eslint .";
pkg.scripts.typecheck="tsc --noEmit";
fs.writeFileSync("package.json", JSON.stringify(pkg,null,2));
console.log("✓ package.json updated");
'

cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "es2017"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
JSON

cat > .eslintrc.json <<'JSON'
{
  "extends": ["next/core-web-vitals"],
  "rules": { "@next/next/no-img-element": "off" }
}
JSON

npm run images || true
npm run build
npx next dev -p 3001

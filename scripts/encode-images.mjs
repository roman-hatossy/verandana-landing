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

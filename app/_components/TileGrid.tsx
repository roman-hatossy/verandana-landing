import Image from "next/image";

type Tile = { src: string; alt: string; ratio?: string };

const tiles: Tile[] = [
  { src: "/images/home-extension-day.webp", alt: "Home Extension Premium", ratio: "16/9" },
  { src: "/images/ogrod-klasyczny-day.webp", alt: "Ogród zimowy klasyczny", ratio: "4/3" },
  { src: "/images/ogrod-sezonowy-day.webp", alt: "Ogród zimowy sezonowy", ratio: "4/3" },
  { src: "/images/pergola-bioclimatic-day.webp", alt: "Pergola bioclimatic", ratio: "1/1" },
  { src: "/images/help-me.webp", alt: "Pomóż mi wybrać", ratio: "3/2" }
];

export default function TileGrid() {
  return (
    <section className="mt-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <article key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
            <div className="relative w-full" style={{ aspectRatio: t.ratio || "4/3" }}>
              <Image 
                src={t.src} 
                alt={t.alt} 
                fill 
                sizes="(max-width:768px) 50vw, 320px" 
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="p-3 text-sm text-gray-700">{t.alt}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";

export default function HeroLCP() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <Image
        src="/images/home-extension-day.webp"
        alt="Nowoczesny ogród zimowy VERANDANA"
        fill
        priority
        sizes="(max-width:768px) 100vw, 960px"
        className="object-cover"
      />
    </div>
  );
}

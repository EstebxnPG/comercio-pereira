import Image from "next/image";

const founders = [
  {
    name: "El Chinito \"Fabian Sanchez\"",
    role: "Respaldo ciudadano",
    src: "/brand/chinito-web.png",
    width: 733,
    height: 190,
    imageClassName: "h-14 w-auto object-contain sm:h-16",
  },
  {
    name: "DPG Consultora",
    role: "Tecnologia",
    src: "/brand/LOGO-DPG-CONSULTORIA-PNG-web.png",
    width: 2057,
    height: 725,
    imageClassName: "h-14 w-auto object-contain sm:h-16",
  },
];

type FoundersLogosProps = {
  compact?: boolean;
  variant?: "light" | "dark";
};

export function FoundersLogos({ compact = false, variant = "light" }: FoundersLogosProps) {
  const isDark = variant === "dark";

  return (
    <div aria-label="Fundadores de la iniciativa">
      <p
        className={`text-xs font-black uppercase tracking-wide ${
          isDark ? "text-[#f5c84c]" : "text-[#B3262E]"
        }`}
      >
        Fundadores
      </p>
      <div className={`mt-3 flex flex-wrap items-center ${compact ? "gap-4" : "gap-5"}`}>
        {founders.map((founder) => (
          <div
            key={founder.name}
            className={`flex w-full items-center rounded-lg border bg-white text-[#22211f] sm:w-auto ${
              compact
                ? "min-h-20 gap-4 px-4 py-3"
                : "min-h-28 flex-col items-start justify-center gap-3 px-4 py-3"
            } ${
              isDark
                ? "border-white/20"
                : "border-stone-200 bg-[#fbfaf7] text-[#22211f]"
            }`}
          >
            <Image
              src={founder.src}
              alt={founder.name}
              width={founder.width}
              height={founder.height}
              sizes="(min-width: 640px) 240px, 220px"
              unoptimized
              className={
                compact
                  ? "h-10 w-auto object-contain sm:h-12"
                  : founder.imageClassName
              }
            />
            <div className={compact ? "min-w-0" : undefined}>
              <p className="text-sm font-black leading-5">{founder.name}</p>
              <p className="text-xs font-semibold text-stone-500">
                {founder.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

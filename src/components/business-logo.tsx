import Image from "next/image";

const SIZE_CLASSES = {
  card: {
    frame: "size-16 rounded-xl border shadow-sm ring-1 ring-black/5 sm:size-[72px]",
    image: "p-2.5",
    sizes: "72px",
  },
  rail: {
    frame: "h-14 w-24 rounded-xl border shadow-sm ring-1 ring-black/5 sm:h-16 sm:w-32",
    image: "p-3",
    sizes: "(min-width: 640px) 128px, 96px",
  },
  profile: {
    frame: "size-24 rounded-2xl border shadow-lg ring-1 ring-black/5 sm:size-28",
    image: "p-3.5",
    sizes: "112px",
  },
  cover: {
    frame: "size-24 rounded-2xl shadow-xl ring-1 ring-black/10 sm:size-32",
    image: "p-3",
    sizes: "128px",
  },
} as const;

export function BusinessLogo({
  businessName,
  logo,
  size,
}: {
  businessName: string;
  logo?: string;
  size: keyof typeof SIZE_CLASSES;
}) {
  const classes = SIZE_CLASSES[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden border-white/90 bg-[#fffdf8] ${classes.frame}`}
    >
      {logo ? (
        <Image
          src={logo}
          alt={`Logo de ${businessName}`}
          fill
          className={`object-contain ${classes.image}`}
          sizes={classes.sizes}
        />
      ) : (
        <span className="grid h-full place-items-center px-2 text-center text-sm font-black text-[#B3262E]">
          {businessName.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

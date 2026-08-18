import Image from "next/image";

const SIZE_CLASSES = {
  card: {
    frame: "size-20 rounded-xl border-4 shadow-sm",
    image: "p-3",
    sizes: "80px",
  },
  profile: {
    frame: "size-24 rounded-2xl border-4 shadow-lg sm:size-28",
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
  logo: string;
  size: keyof typeof SIZE_CLASSES;
}) {
  const classes = SIZE_CLASSES[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-white ${classes.frame}`}
    >
      <Image
        src={logo}
        alt={`Logo de ${businessName}`}
        fill
        className={`object-contain ${classes.image}`}
        sizes={classes.sizes}
      />
    </div>
  );
}

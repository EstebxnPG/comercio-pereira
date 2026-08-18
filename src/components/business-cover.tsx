"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BusinessLogo } from "@/components/business-logo";
import { DEFAULT_BUSINESS_COVER_IMAGE } from "@/lib/constants";

type CoverPalette = {
  primary: string;
  secondary: string;
  accent: string;
};

const FALLBACK_PALETTES: CoverPalette[] = [
  { primary: "#163A5F", secondary: "#36A9E1", accent: "#F5C84C" },
  { primary: "#0F5132", secondary: "#55B78B", accent: "#F4C95D" },
  { primary: "#4C1D95", secondary: "#A855F7", accent: "#F97316" },
  { primary: "#7F1D1D", secondary: "#DC2626", accent: "#F5C84C" },
  { primary: "#1F2937", secondary: "#64748B", accent: "#38BDF8" },
];

export function BusinessCover({
  businessName,
  logo,
  coverImage,
  priority = false,
  imageClassName = "",
  sizes,
}: {
  businessName: string;
  logo: string;
  coverImage: string;
  priority?: boolean;
  imageClassName?: string;
  sizes: string;
}) {
  const fallbackPalette = useMemo(
    () => FALLBACK_PALETTES[getHashIndex(businessName, FALLBACK_PALETTES.length)],
    [businessName],
  );
  const [palette, setPalette] = useState<CoverPalette>(fallbackPalette);

  useEffect(() => {
    if (coverImage !== DEFAULT_BUSINESS_COVER_IMAGE) {
      return;
    }

    extractPaletteFromImage(logo)
      .then((logoPalette) => {
        if (logoPalette) {
          setPalette(logoPalette);
        }
      })
      .catch(() => undefined);
  }, [coverImage, logo]);

  if (coverImage !== DEFAULT_BUSINESS_COVER_IMAGE) {
    return (
      <Image
        src={coverImage}
        alt={`Portada de ${businessName}`}
        fill
        priority={priority}
        className={imageClassName}
        sizes={sizes}
      />
    );
  }

  return (
    <div
      aria-label={`Portada generica de ${businessName}`}
      className={`absolute inset-0 overflow-hidden ${imageClassName}`}
      role="img"
      style={
        {
          "--cover-primary": palette.primary,
          "--cover-secondary": palette.secondary,
          "--cover-accent": palette.accent,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--cover-primary),var(--cover-secondary))]" />
      <div className="absolute -right-16 -top-24 size-72 rounded-full bg-[var(--cover-accent)] opacity-90 blur-sm sm:size-96" />
      <div className="absolute -bottom-20 left-[-10%] h-48 w-[72%] rotate-[-8deg] rounded-full bg-white/25 blur-sm" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-black/15" />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <BusinessLogo businessName={businessName} logo={logo} size="cover" />
      </div>
    </div>
  );
}

async function extractPaletteFromImage(src: string): Promise<CoverPalette | null> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const size = 48;
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0, size, size);

  const { data } = context.getImageData(0, 0, size, size);
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];

    if (alpha < 80) {
      continue;
    }

    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const hsl = rgbToHsl(r, g, b);

    if (hsl.s < 0.18 || hsl.l > 0.94 || hsl.l < 0.08) {
      continue;
    }

    const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const colors = [...buckets.values()]
    .map((bucket) => {
      const r = Math.round(bucket.r / bucket.count);
      const g = Math.round(bucket.g / bucket.count);
      const b = Math.round(bucket.b / bucket.count);
      const hsl = rgbToHsl(r, g, b);

      return { r, g, b, ...hsl, score: bucket.count * (hsl.s + 0.2) };
    })
    .sort((a, b) => b.score - a.score);

  if (colors.length === 0) {
    return null;
  }

  const primary = colors[0];
  const secondary =
    colors.find((color) => Math.abs(color.h - primary.h) > 18) ?? colors[1] ?? primary;
  const accent =
    colors.find((color) => color.s >= primary.s && color.l >= primary.l) ??
    secondary;

  return {
    primary: hslToCss(primary.h, Math.max(primary.s, 0.42), Math.min(primary.l, 0.42)),
    secondary: hslToCss(secondary.h, Math.max(secondary.s, 0.36), 0.58),
    accent: hslToCss(accent.h, Math.max(accent.s, 0.52), 0.68),
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: lightness };
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue =
    max === red
      ? (green - blue) / delta + (green < blue ? 6 : 0)
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;

  hue *= 60;

  return { h: hue, s: saturation, l: lightness };
}

function hslToCss(h: number, s: number, l: number) {
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

function getHashIndex(value: string, modulo: number) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash % modulo;
}

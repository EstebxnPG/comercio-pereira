import { isSafeExternalUrl } from "@/lib/utils";
import type { Business } from "@/types/business";

const linkClasses =
  "inline-flex min-h-11 items-center rounded-full border border-stone-300 px-4 text-sm font-bold text-stone-800 transition hover:border-[#176b5b] hover:text-[#176b5b] focus:outline-none focus:ring-2 focus:ring-[#176b5b] focus:ring-offset-2";

export function SocialLinks({ business }: { business: Business }) {
  const links = [
    business.instagramUrl && isSafeExternalUrl(business.instagramUrl)
      ? { href: business.instagramUrl, label: "Instagram" }
      : null,
    business.facebookUrl && isSafeExternalUrl(business.facebookUrl)
      ? { href: business.facebookUrl, label: "Facebook" }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

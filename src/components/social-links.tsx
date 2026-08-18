"use client";

import {
  trackBusinessEvent,
  type BusinessEventType,
} from "@/components/business-event-tracker";
import { isSafeExternalUrl } from "@/lib/utils";
import type { Business } from "@/types/business";

const linkClasses =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-4 text-sm font-bold text-stone-800 transition hover:border-[#B3262E] hover:text-[#B3262E] focus:outline-none focus:ring-2 focus:ring-[#B3262E] focus:ring-offset-2";

export function SocialLinks({ business }: { business: Business }) {
  const links = [
    business.instagramUrl && isSafeExternalUrl(business.instagramUrl)
      ? {
          href: business.instagramUrl,
          label: "Instagram",
          icon: InstagramIcon,
          eventType: "click_instagram",
        }
      : null,
    business.facebookUrl && isSafeExternalUrl(business.facebookUrl)
      ? {
          href: business.facebookUrl,
          label: "Facebook",
          icon: FacebookIcon,
          eventType: "click_facebook",
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: () => React.JSX.Element;
    eventType: BusinessEventType;
  }>;

  if (links.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-black uppercase tracking-wide text-stone-500">
        Redes sociales
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClasses}
              aria-label={`Abrir ${link.label} de ${business.name}`}
              onClick={() => trackBusinessEvent(business.id, link.eventType)}
            >
              <Icon />
              <span>{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M14 8.5h2.25V5.15A13.4 13.4 0 0 0 13.16 5C10.1 5 8 6.87 8 10.28v2.97H5v3.75h3V24h3.8v-7h3.15l.5-3.75H11.8v-2.6c0-1.08.3-2.15 2.2-2.15Z" />
    </svg>
  );
}

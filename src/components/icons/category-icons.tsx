import type { SVGProps } from "react";

/**
 * Shared gradient stops for every category icon. Mounted once in the root
 * layout (hidden, zero size) so every <use of url(#gWine) / url(#gGold)>
 * across the app resolves against the same live theme tokens.
 */
export function CategoryIconDefs() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute" }}
    >
      <defs>
        <linearGradient id="gWine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--md-primary)" }} />
          <stop offset="1" style={{ stopColor: "var(--md-primary-deep)" }} />
        </linearGradient>
        <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--md-tertiary)" }} />
          <stop offset="1" style={{ stopColor: "var(--md-tertiary-deep)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

/** Highlight ellipse reused across icons for a subtle glossy, dimensional feel. */
function Shine({
  cx,
  cy,
  rotate = -20,
  rx = 2.4,
  ry = 1.3,
}: {
  cx: number;
  cy: number;
  rotate?: number;
  rx?: number;
  ry?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="#fff"
      opacity={0.22}
      transform={`rotate(${rotate} ${cx} ${cy})`}
    />
  );
}

function FoodIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="14" cy="12" r="7.5" fill="url(#gWine)" />
      <circle cx="14" cy="12" r="4.6" fill="url(#gGold)" opacity={0.92} />
      <rect x="3" y="4" width="1.8" height="8" rx="0.9" fill="url(#gWine)" />
      <rect x="6" y="4" width="1.8" height="8" rx="0.9" fill="url(#gWine)" />
      <path
        d="M10 5c1 1.3 1 2.8-.2 4M13 5c1.4 1 1.4 2.8 0 4"
        stroke="#fff"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
        opacity={0.45}
      />
      <Shine cx={16.5} cy={9} />
    </Base>
  );
}

function ClothingIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M9 3 4 6l-1 3 3 1.5V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10.5l3-1.5-1-3-5-3-2 2a2 2 0 0 1-2 0z"
        fill="url(#gWine)"
      />
      <path d="M12 9v10" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity={0.3} />
      <path
        d="M9 3 12 6 15 3"
        stroke="url(#gGold)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Shine cx={8} cy={7} />
    </Base>
  );
}

function FootwearIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M3 17v-3q0-3 3-3.5l4-.5 1-2.5 2 .5v2.5q4-.5 6 2.5.75.9.75 2.5v1.5z"
        fill="url(#gWine)"
      />
      <rect x="3" y="15.4" width="18" height="2.1" rx="1" fill="url(#gGold)" />
      <line x1="6" y1="16.4" x2="6" y2="17.1" stroke="var(--md-primary-deep)" strokeWidth="0.7" />
      <line x1="9" y1="16.4" x2="9" y2="17.1" stroke="var(--md-primary-deep)" strokeWidth="0.7" />
      <circle cx="10.3" cy="9.4" r="0.55" fill="url(#gGold)" />
      <circle cx="12.6" cy="9.7" r="0.55" fill="url(#gGold)" />
      <Shine cx={6.5} cy={12} />
    </Base>
  );
}

function BeautyIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" fill="url(#gWine)" />
      <path
        d="M8.4 13.5a4 4 0 004 4"
        stroke="url(#gGold)"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <Shine cx={9.8} cy={9} rotate={-25} />
    </Base>
  );
}

function TechIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="4" width="18" height="13" rx="3" fill="url(#gWine)" />
      <rect x="5.5" y="6.3" width="13" height="8.4" rx="1.5" fill="url(#gGold)" opacity={0.92} />
      <path
        d="M6.5 12.8 9.5 8.5l2 3 2.4-2.8 3.6 4.6"
        stroke="var(--md-primary-deep)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
      <rect x="9" y="19.5" width="6" height="2" rx="1" fill="url(#gWine)" />
      <circle cx="19" cy="6" r="0.5" fill="#fff" opacity={0.7} />
    </Base>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 11 12 3 21 11" stroke="url(#gWine)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 9.5V20a1 1 0 0 0 1 1h4v-7h4v7h4a1 1 0 0 0 1-1V9.5"
        fill="url(#gWine)"
      />
      <rect x="9.5" y="13.5" width="5" height="6.5" fill="url(#gGold)" />
      <circle cx="13.3" cy="16.7" r="0.45" fill="var(--md-primary-deep)" />
      <rect x="6" y="12" width="2.6" height="2.6" fill="#fff" opacity={0.55} />
      <line x1="7.3" y1="12" x2="7.3" y2="14.6" stroke="var(--md-primary-deep)" strokeWidth="0.4" />
      <line x1="6" y1="13.3" x2="8.6" y2="13.3" stroke="var(--md-primary-deep)" strokeWidth="0.4" />
    </Base>
  );
}

function HardwareIcon(props: IconProps) {
  return (
    <Base {...props}>
      <polygon points="12,3 19,7 19,15 12,19 5,15 5,7" fill="url(#gWine)" stroke="var(--md-primary-deep)" strokeWidth="0.6" />
      <circle cx="12" cy="11" r="3.6" fill="url(#gGold)" />
      <line x1="12" y1="4.4" x2="12" y2="6.6" stroke="#fff" strokeWidth="0.6" opacity={0.5} />
      <line x1="18" y1="8" x2="16.2" y2="9" stroke="#fff" strokeWidth="0.6" opacity={0.5} />
      <line x1="18" y1="14" x2="16.2" y2="13" stroke="#fff" strokeWidth="0.6" opacity={0.5} />
    </Base>
  );
}

function VehicleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M2 16v-2.5q0-1.5 1.5-1.9L6 11l2-3.2Q8.6 7 9.6 7h4.8q1 0 1.6.9L18 11l2.5.6Q22 12 22 13.5V16Z"
        fill="url(#gWine)"
      />
      <path d="M9 8.2h6.2l1.6 2.4H7.4z" fill="url(#gGold)" opacity={0.9} />
      <circle cx="7" cy="16.3" r="1.9" fill="var(--md-primary-deep)" />
      <circle cx="7" cy="16.3" r="0.8" fill="url(#gGold)" />
      <circle cx="17" cy="16.3" r="1.9" fill="var(--md-primary-deep)" />
      <circle cx="17" cy="16.3" r="0.8" fill="url(#gGold)" />
      <Shine cx={10} cy={9} rx={1.6} ry={0.8} />
    </Base>
  );
}

function GroceryIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M8 10Q8 4 12 4Q16 4 16 10"
        stroke="var(--md-primary-deep)"
        strokeWidth="1.6"
        fill="none"
      />
      <path d="M4 10h16l-1.8 10a2 2 0 0 1-2 1.7H7.8a2 2 0 0 1-2-1.7z" fill="url(#gWine)" />
      <circle cx="9.5" cy="14.2" r="1.7" fill="url(#gGold)" />
      <circle cx="13.5" cy="13.4" r="2" fill="url(#gGold)" />
      <circle cx="16.5" cy="14.6" r="1.4" fill="url(#gGold)" />
      <Shine cx={13} cy={12} />
    </Base>
  );
}

function HealthIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="6" fill="url(#gWine)" />
      <rect x="10" y="6.5" width="4" height="11" rx="1.3" fill="url(#gGold)" />
      <rect x="6.5" y="10" width="11" height="4" rx="1.3" fill="url(#gGold)" />
      <Shine cx={8} cy={7} />
    </Base>
  );
}

function PetsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <ellipse cx="12" cy="15.5" rx="5.4" ry="4.2" fill="url(#gWine)" />
      <ellipse cx="6" cy="9" rx="2.1" ry="2.5" fill="url(#gGold)" transform="rotate(-18 6 9)" />
      <ellipse cx="10.6" cy="6.3" rx="2.2" ry="2.6" fill="url(#gGold)" />
      <ellipse cx="15.2" cy="6.5" rx="2.1" ry="2.5" fill="url(#gGold)" />
      <ellipse cx="19" cy="9.4" rx="2" ry="2.4" fill="url(#gGold)" transform="rotate(18 19 9.4)" />
      <Shine cx={10} cy={14} />
    </Base>
  );
}

function EducationIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M12 5.3C9.4 3.7 5.6 3.6 3.3 4.5v12.6c2.3-.9 6.1-.8 8.7.8 2.6-1.6 6.4-1.7 8.7-.8V4.5C18.4 3.6 14.6 3.7 12 5.3z"
        fill="url(#gWine)"
      />
      <line x1="12" y1="5.3" x2="12" y2="17.9" stroke="var(--md-primary-deep)" strokeWidth="1" />
      <path d="M5.2 7.4c1.6-.5 3.6-.4 5 .3M14 7.7c1.4-.7 3.4-.8 5-.3" stroke="url(#gGold)" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity={0.85} />
      <Shine cx={8} cy={6.5} rotate={0} />
    </Base>
  );
}

function GiftIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="10" width="16" height="11" rx="1.5" fill="url(#gWine)" />
      <rect x="3" y="7" width="18" height="4" rx="1.2" fill="url(#gGold)" />
      <rect x="10.5" y="7" width="3" height="14" fill="var(--md-primary-deep)" opacity={0.85} />
      <path
        d="M9 7c-1.6 0-2.6-1-2.6-2.2C6.4 3.4 7.4 3 8.3 3.6 9.2 4.2 9.8 5.6 10 7z"
        fill="url(#gGold)"
      />
      <path
        d="M15 7c1.6 0 2.6-1 2.6-2.2 0-1.4-1-1.8-1.9-1.2-.9.6-1.5 2-1.7 3.4z"
        fill="url(#gGold)"
      />
      <Shine cx={6.5} cy={12} />
    </Base>
  );
}

function JewelryIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 8.5 4 4h16l-3 4.5z" fill="url(#gWine)" />
      <polygon points="12,4 15,8.5 12,20 9,8.5" fill="url(#gGold)" />
      <path d="M9 8.5h6M12 4v4.5" stroke="var(--md-primary-deep)" strokeWidth="0.5" opacity={0.6} />
      <Shine cx={10.4} cy={9.5} rx={1.2} ry={0.7} />
    </Base>
  );
}

function HotelIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2" y="6" width="2" height="11" rx="1" fill="url(#gWine)" />
      <path d="M4 11h9.5a2 2 0 0 1 2 2v1.5H4z" fill="url(#gWine)" />
      <rect x="4.5" y="9" width="6.5" height="4.5" rx="1.8" fill="url(#gGold)" />
      <rect x="2" y="16.3" width="20" height="1.9" rx="0.9" fill="var(--md-primary-deep)" />
      <Shine cx={6.5} cy={10.4} rx={1.4} ry={0.8} />
    </Base>
  );
}

function ServicesIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2.5" y="8" width="19" height="12" rx="2.5" fill="url(#gWine)" />
      <path
        d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"
        stroke="var(--md-primary-deep)"
        strokeWidth="2"
        fill="none"
      />
      <rect x="2.5" y="12.5" width="19" height="2.6" fill="url(#gGold)" />
      <rect x="10.8" y="12" width="2.4" height="1.8" rx="0.4" fill="var(--md-primary-deep)" />
      <path d="M4 10h4M4 17h4" stroke="#fff" strokeWidth="0.5" strokeDasharray="1 1.4" opacity={0.5} />
    </Base>
  );
}

function PrintIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 10 9 7l0 10L3 14z" fill="url(#gWine)" />
      <path d="M9 7 16 4Q18 3 18 6v12Q18 21 16 20L9 17z" fill="url(#gGold)" />
      <rect x="1.6" y="11" width="1.6" height="2.4" rx="0.6" fill="var(--md-primary-deep)" />
      <path
        d="M19.5 9.2c1.3.7 1.3 5-0 5.6M21.4 7.6c2 1.4 2 8.4 0 9.8"
        stroke="var(--md-primary-deep)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      <Shine cx={12} cy={8.5} rx={1.6} ry={0.9} />
    </Base>
  );
}

function SportsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="6" y="10.8" width="12" height="2.4" rx="1.2" fill="url(#gWine)" />
      <rect x="1.5" y="7.5" width="4.5" height="9" rx="1.8" fill="url(#gGold)" />
      <rect x="18" y="7.5" width="4.5" height="9" rx="1.8" fill="url(#gGold)" />
      <rect x="3" y="9.3" width="1.5" height="5.4" rx="0.6" fill="var(--md-primary-deep)" opacity={0.5} />
      <rect x="19.5" y="9.3" width="1.5" height="5.4" rx="0.6" fill="var(--md-primary-deep)" opacity={0.5} />
      <Shine cx={3.5} cy={9.5} rx={1} ry={1.4} />
    </Base>
  );
}

function RealEstateIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5" y="3" width="14" height="18" rx="1.6" fill="url(#gWine)" />
      <rect x="7.5" y="5.5" width="3.2" height="3.2" fill="url(#gGold)" opacity={0.92} />
      <rect x="13.3" y="5.5" width="3.2" height="3.2" fill="url(#gGold)" opacity={0.92} />
      <rect x="7.5" y="10.2" width="3.2" height="3.2" fill="url(#gGold)" opacity={0.92} />
      <rect x="13.3" y="10.2" width="3.2" height="3.2" fill="url(#gGold)" opacity={0.92} />
      <rect x="9.8" y="15.4" width="4.4" height="5.6" rx="0.6" fill="var(--md-primary-deep)" />
      <Shine cx={9} cy={6} rx={1} ry={0.9} />
    </Base>
  );
}

function OtherIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 3h8l10 10-8 8L3 11z" fill="url(#gWine)" />
      <circle cx="7.5" cy="7.5" r="1.9" fill="url(#gGold)" />
      <Shine cx={13} cy={9} rx={1.6} ry={1} />
    </Base>
  );
}

export const CATEGORY_ICONS: Record<
  string,
  (props: IconProps) => React.JSX.Element
> = {
  "Comida y Restaurantes": FoodIcon,
  "Moda y Ropa": ClothingIcon,
  "Calzado y Marroquineria": FootwearIcon,
  "Belleza y Cuidado Personal": BeautyIcon,
  "Tecnologia y Electronica": TechIcon,
  "Hogar y Decoracion": HomeIcon,
  "Ferreteria y Construccion": HardwareIcon,
  "Vehiculos y Repuestos": VehicleIcon,
  "Mercados y Alimentos": GroceryIcon,
  "Salud y Bienestar": HealthIcon,
  Mascotas: PetsIcon,
  "Papeleria y Educacion": EducationIcon,
  "Regalos y Variedades": GiftIcon,
  "Joyeria y Accesorios": JewelryIcon,
  "Hoteles y Turismo": HotelIcon,
  "Servicios Profesionales": ServicesIcon,
  "Publicidad e Impresion": PrintIcon,
  "Deporte y Recreacion": SportsIcon,
  "Inmobiliarias y Propiedad Raiz": RealEstateIcon,
  "Otros Comercios y Servicios": OtherIcon,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[name] ?? OtherIcon;

  return <Icon className={className} />;
}

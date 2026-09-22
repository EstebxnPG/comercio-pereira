import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CopyToClipboardButton } from "@/components/copy-to-clipboard-button";
import {
  getAdminSubmissionCategories,
  getBusinessSubmissions,
  type AdminSubmissionCategory,
  type BusinessSubmission,
  type SubmissionStatus,
} from "@/lib/admin-submissions";
import { requireAdmin } from "@/lib/auth";
import {
  approveSubmissionAction,
  signOutAdminAction,
  updateAndApproveBusinessSubmissionAction,
  updateBusinessSubmissionAction,
  updateSubmissionStatusAction,
} from "@/app/admin/postulaciones/actions";

export const metadata: Metadata = {
  title: "Postulaciones admin",
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  needs_info: "Necesita info",
};
const PAGE_SIZE = 8;

type AdminSubmissionsPageProps = {
  searchParams: Promise<{
    estado?: string | string[];
    pagina?: string | string[];
    q?: string | string[];
  }>;
};

export default async function AdminSubmissionsPage(
  props: AdminSubmissionsPageProps,
) {
  const searchParams = await props.searchParams;
  await requireAdmin();

  const status = parseStatus(getSingleParam(searchParams.estado)) ?? "pending";
  const page = parsePage(getSingleParam(searchParams.pagina));
  const search = parseSearch(getSingleParam(searchParams.q));
  const [categories, submissionsPage] = await Promise.all([
    getAdminSubmissionCategories(),
    getBusinessSubmissions(status, { page, pageSize: PAGE_SIZE, search }),
  ]);
  const submissions = submissionsPage.items;
  const totalPages = Math.max(1, Math.ceil(submissionsPage.total / PAGE_SIZE));

  if (page > totalPages && submissionsPage.total > 0) {
    redirect(getPageHref({ page: totalPages, search, status }));
  }

  const currentPage = page;

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-brand">
              Admin local
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold">Postulaciones</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
              Revisa comercios enviados desde el formulario y publica los que ya
              esten listos.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <a
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  value === status
                    ? "bg-brand text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200"
                }`}
                href={getPageHref({
                  page: 1,
                  search,
                  status: value as SubmissionStatus,
                })}
                key={value}
              >
                {label}
              </a>
            ))}
          </nav>
          <form action={signOutAdminAction}>
            <button className="md-outlined-button px-4" type="submit">
              Cerrar sesion
            </button>
          </form>
        </header>

        <section className="mt-8 grid gap-5">
          <SearchForm search={search} status={status} />

          <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {submissions.length} de {submissionsPage.total}{" "}
              postulaciones
              {search ? ` para "${search}"` : ""}
            </span>
            <span>
              Pagina {currentPage} de {totalPages}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <h2 className="font-display text-xl font-bold">No hay postulaciones</h2>
              <p className="mt-2 text-sm font-semibold text-stone-600">
                Cuando alguien envie el formulario, aparecera aqui.
              </p>
            </div>
          ) : (
            submissions.map((submission) => (
              <SubmissionPanel
                categories={categories}
                key={submission.id}
                submission={submission}
              />
            ))
          )}

          <Pagination
            currentPage={currentPage}
            search={search}
            status={status}
            totalPages={totalPages}
          />
        </section>
      </div>
    </main>
  );
}

function SearchForm({
  search,
  status,
}: {
  search: string;
  status: SubmissionStatus;
}) {
  return (
    <form
      action="/admin/postulaciones"
      className="grid gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
    >
      <input name="estado" type="hidden" value={status} />
      <input name="pagina" type="hidden" value="1" />
      <label className="grid gap-2 text-sm font-black text-stone-800">
        Buscar solicitud
        <input
          className="md-field"
          defaultValue={search}
          maxLength={80}
          name="q"
          placeholder="Nombre, propietario, telefono, email, barrio..."
          type="search"
        />
      </label>
      {search ? (
        <a
          className="md-outlined-button px-4 text-center"
          href={getPageHref({ page: 1, search: "", status })}
        >
          Limpiar
        </a>
      ) : null}
      <button className="md-filled-button px-5" type="submit">
        Buscar
      </button>
    </form>
  );
}

function Pagination({
  currentPage,
  search,
  status,
  totalPages,
}: {
  currentPage: number;
  search: string;
  status: SubmissionStatus;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginacion de postulaciones"
      className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white p-3"
    >
      <PaginationLink
        disabled={currentPage === 1}
        href={getPageHref({ page: currentPage - 1, search, status })}
        label="Anterior"
      />
      {pages.map((page) => (
        <PaginationLink
          active={page === currentPage}
          href={getPageHref({ page, search, status })}
          key={page}
          label={String(page)}
        />
      ))}
      <PaginationLink
        disabled={currentPage === totalPages}
        href={getPageHref({ page: currentPage + 1, search, status })}
        label="Siguiente"
      />
    </nav>
  );
}

function PaginationLink({
  active = false,
  disabled = false,
  href,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="rounded-full px-4 py-2 text-sm font-black text-stone-400 ring-1 ring-stone-200">
        {label}
      </span>
    );
  }

  return (
    <a
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-black ${
        active
          ? "bg-brand text-white"
          : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-[var(--md-surface-container)]"
      }`}
      href={href}
    >
      {label}
    </a>
  );
}

function SubmissionPanel({
  categories,
  submission,
}: {
  categories: AdminSubmissionCategory[];
  submission: BusinessSubmission;
}) {
  const category = Array.isArray(submission.categories)
    ? submission.categories[0]?.name
    : submission.categories?.name;

  return (
    <article className="grid gap-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-black text-gold-ink">
            {STATUS_LABELS[submission.status]}
          </span>
          <span className="text-xs font-bold text-stone-500">
            {formatDate(submission.created_at)}
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold text-ink lg:text-3xl">
          {submission.business_name}
        </h2>
        <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
          {category ?? "Sin categoria"}
        </p>
        <p className="mt-4 text-sm font-semibold leading-6 text-stone-700 lg:text-base">
          {submission.description ?? "Sin descripcion"}
        </p>

        <div className="mt-6 grid gap-6 lg:gap-7">
          <InfoSection
            hasContent={Boolean(
              submission.owner_name ||
                submission.owner_phone ||
                submission.contact_name ||
                submission.whatsapp ||
                submission.phone ||
                submission.email,
            )}
            title="Contacto"
          >
            <Info label="Propietario" value={submission.owner_name} />
            <Info label="Numero propietario" value={submission.owner_phone} />
            <Info label="Contacto visible" value={submission.contact_name} />
            <Info
              href={
                submission.whatsapp
                  ? `https://wa.me/${submission.whatsapp}`
                  : undefined
              }
              icon={<WhatsAppIcon className="size-4 text-emerald-600" />}
              label="WhatsApp"
              value={submission.whatsapp}
            />
            <Info
              href={submission.phone ? `tel:${submission.phone.replace(/\D/g, "")}` : undefined}
              icon={<PhoneIcon className="size-4 text-stone-400" />}
              label="Telefono"
              value={submission.phone}
            />
            <Info
              action={
                submission.email ? (
                  <CopyToClipboardButton value={submission.email} />
                ) : undefined
              }
              href={submission.email ? `mailto:${submission.email}` : undefined}
              icon={<EmailIcon className="size-4 text-stone-400" />}
              label="Email"
              value={submission.email}
            />
          </InfoSection>

          <InfoSection
            hasContent={Boolean(
              submission.address ||
                submission.neighborhood ||
                submission.schedule,
            )}
            title="Ubicacion y horario"
          >
            <Info
              href={submission.maps_url ?? undefined}
              icon={<PinIcon className="size-4 text-stone-400" />}
              label="Direccion"
              value={[submission.address, submission.neighborhood]
                .filter(Boolean)
                .join(", ")}
            />
            <Info label="Horario" value={submission.schedule} />
          </InfoSection>

          <InfoSection
            hasContent={Boolean(
              submission.delivery_available ||
                submission.payment_methods ||
                submission.products_or_services,
            )}
            title="Operacion"
          >
            <Info
              label="Domicilios"
              value={deliveryLabel(submission.delivery_available)}
            />
            <PaymentMethodsInfo value={submission.payment_methods} />
            <Info label="Productos" value={submission.products_or_services} />
          </InfoSection>

          <InfoSection
            hasContent={Boolean(
              submission.instagram_url ||
                submission.facebook_url ||
                submission.tiktok_url ||
                submission.website_url,
            )}
            title="Redes y web"
          >
            <Info label="Instagram" value={submission.instagram_url} />
            <Info label="Facebook" value={submission.facebook_url} />
            <Info label="TikTok" value={submission.tiktok_url} />
            <Info label="Web" value={submission.website_url} />
          </InfoSection>

          <InfoSection
            hasContent={Boolean(
              submission.full_description || submission.additional_notes,
            )}
            title="Notas"
          >
            <Info label="Descripcion perfil" value={submission.full_description} />
            <Info label="Notas usuario" value={submission.additional_notes} />
          </InfoSection>
        </div>
        </div>

        <aside className="grid gap-4">
        <ImagePreview label="Logo" src={submission.signedLogoUrl} />
        <ImagePreview label="Portada" src={submission.signedCoverImageUrl} />

        <form action={approveSubmissionAction} className="grid gap-3">
          <input name="submissionId" type="hidden" value={submission.id} />
          <textarea
            className="md-field min-h-24 py-3 text-sm"
            defaultValue={submission.notes ?? ""}
            name="notes"
            placeholder="Notas internas"
          />
          <button className="md-filled-button px-4" type="submit">
            Aprobar y publicar
          </button>
        </form>

        <div className="grid grid-cols-2 gap-2">
          <StatusForm
            label="Necesita info"
            status="needs_info"
            submission={submission}
          />
          <StatusForm
            label="Rechazar"
            status="rejected"
            submission={submission}
          />
        </div>
      </aside>
      </div>

      <details className="group rounded-xl border border-stone-200 bg-paper">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-black text-stone-800 transition hover:bg-[var(--md-surface-container)]">
          <span>Editar informacion de la solicitud</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand ring-1 ring-stone-200 group-open:hidden">
            Editar
          </span>
          <span className="hidden rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand-deep group-open:inline">
            Cerrar
          </span>
        </summary>
        <EditSubmissionForm categories={categories} submission={submission} />
      </details>
    </article>
  );
}

function StatusForm({
  label,
  status,
  submission,
}: {
  label: string;
  status: SubmissionStatus;
  submission: BusinessSubmission;
}) {
  return (
    <form action={updateSubmissionStatusAction}>
      <input name="submissionId" type="hidden" value={submission.id} />
      <input name="status" type="hidden" value={status} />
      <input name="notes" type="hidden" value={submission.notes ?? ""} />
      <button className="md-outlined-button w-full px-3 text-xs" type="submit">
        {label}
      </button>
    </form>
  );
}

function EditSubmissionForm({
  categories,
  submission,
}: {
  categories: AdminSubmissionCategory[];
  submission: BusinessSubmission;
}) {
  return (
    <form
      action={updateBusinessSubmissionAction}
      className="grid gap-6 border-t border-stone-200 p-4 sm:p-5"
    >
      <input name="submissionId" type="hidden" value={submission.id} />

      <EditSection title="Informacion principal">
        <div className="grid gap-4 sm:grid-cols-2">
          <EditField label="Nombre comercio" required>
            <input
              className="md-field"
              defaultValue={submission.business_name}
              maxLength={90}
              name="businessName"
              required
            />
          </EditField>
          <EditField label="Categoria" required>
            <select
              className="md-field"
              defaultValue={submission.category_id ?? ""}
              name="categoryId"
              required
            >
              <option value="">Seleccionar categoria</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </EditField>
        </div>
        <EditField label="Descripcion corta">
          <textarea
            className="md-field min-h-28 py-3 text-sm leading-6"
            defaultValue={submission.description ?? ""}
            maxLength={420}
            name="description"
          />
        </EditField>
        <EditField label="Descripcion completa">
          <textarea
            className="md-field min-h-32 py-3 text-sm leading-6"
            defaultValue={submission.full_description ?? ""}
            maxLength={1200}
            name="fullDescription"
          />
        </EditField>
      </EditSection>

      <EditSection title="Contacto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EditField label="Propietario">
            <input
              className="md-field"
              defaultValue={submission.owner_name ?? ""}
              maxLength={90}
              name="ownerName"
            />
          </EditField>
          <EditField label="Numero propietario">
            <input
              className="md-field"
              defaultValue={submission.owner_phone ?? ""}
              inputMode="tel"
              maxLength={18}
              name="ownerPhone"
            />
          </EditField>
          <EditField label="Contacto visible">
            <input
              className="md-field"
              defaultValue={submission.contact_name ?? ""}
              maxLength={90}
              name="contactName"
            />
          </EditField>
          <EditField label="WhatsApp">
            <input
              className="md-field"
              defaultValue={submission.whatsapp ?? ""}
              inputMode="tel"
              maxLength={18}
              name="whatsapp"
            />
          </EditField>
          <EditField label="Telefono">
            <input
              className="md-field"
              defaultValue={submission.phone ?? ""}
              maxLength={30}
              name="phone"
            />
          </EditField>
          <EditField label="Email">
            <input
              className="md-field"
              defaultValue={submission.email ?? ""}
              maxLength={120}
              name="email"
              type="email"
            />
          </EditField>
        </div>
      </EditSection>

      <EditSection title="Ubicacion y operacion">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EditField label="Direccion">
            <input
              className="md-field"
              defaultValue={submission.address ?? ""}
              maxLength={180}
              name="address"
            />
          </EditField>
          <EditField label="Barrio o zona">
            <input
              className="md-field"
              defaultValue={submission.neighborhood ?? ""}
              maxLength={80}
              name="neighborhood"
            />
          </EditField>
          <EditField label="Horario">
            <input
              className="md-field"
              defaultValue={submission.schedule ?? ""}
              maxLength={160}
              name="schedule"
            />
          </EditField>
          <EditField label="Domicilios">
            <select
              className="md-field"
              defaultValue={submission.delivery_available ?? ""}
              name="deliveryAvailable"
            >
              <option value="">Sin especificar</option>
              <option value="yes">Si ofrece domicilios</option>
              <option value="no">No ofrece domicilios</option>
              <option value="pickup">Solo recoger en tienda</option>
            </select>
          </EditField>
          <EditField label="Metodos de pago">
            <input
              className="md-field"
              defaultValue={submission.payment_methods ?? ""}
              maxLength={180}
              name="paymentMethods"
            />
          </EditField>
          <EditField label="Productos o servicios">
            <input
              className="md-field"
              defaultValue={submission.products_or_services ?? ""}
              name="productsOrServices"
            />
          </EditField>
        </div>
      </EditSection>

      <EditSection title="Canales y fotografias">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EditField label="Maps">
            <input
              className="md-field"
              defaultValue={submission.maps_url ?? ""}
              maxLength={260}
              name="mapsUrl"
              placeholder="https://..."
            />
          </EditField>
          <EditField label="Web">
            <input
              className="md-field"
              defaultValue={submission.website_url ?? ""}
              maxLength={220}
              name="websiteUrl"
              placeholder="https://..."
            />
          </EditField>
          <EditField label="Instagram">
            <input
              className="md-field"
              defaultValue={submission.instagram_url ?? ""}
              maxLength={220}
              name="instagramUrl"
            />
          </EditField>
          <EditField label="Facebook">
            <input
              className="md-field"
              defaultValue={submission.facebook_url ?? ""}
              maxLength={220}
              name="facebookUrl"
            />
          </EditField>
          <EditField label="TikTok">
            <input
              className="md-field"
              defaultValue={submission.tiktok_url ?? ""}
              maxLength={220}
              name="tiktokUrl"
            />
          </EditField>
          <EditField label="URL logo">
            <input
              className="md-field"
              defaultValue={submission.logo_url ?? ""}
              name="logoUrl"
              placeholder="https://..."
            />
          </EditField>
          <EditField label="URL portada">
            <input
              className="md-field"
              defaultValue={submission.cover_image_url ?? ""}
              name="coverImageUrl"
              placeholder="https://..."
            />
          </EditField>
          <EditField label="Reemplazar logo">
            <input
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-black file:text-brand-deep"
              name="logo"
              type="file"
            />
          </EditField>
          <EditField label="Reemplazar portada">
            <input
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-black file:text-brand-deep"
              name="coverImage"
              type="file"
            />
          </EditField>
        </div>
      </EditSection>

      <EditSection title="Revision interna">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <EditField label="Notas del usuario">
            <textarea
              className="md-field min-h-24 py-3 text-sm leading-6"
              defaultValue={submission.additional_notes ?? ""}
              maxLength={500}
              name="additionalNotes"
            />
          </EditField>
          <EditField label="Notas internas">
            <textarea
              className="md-field min-h-24 py-3 text-sm"
              defaultValue={submission.notes ?? ""}
              name="notes"
              placeholder="Notas internas"
            />
          </EditField>
        </div>
        <label className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3 text-sm font-bold leading-6 text-stone-800">
          <input
            className="mt-1 size-5 accent-brand"
            defaultChecked={submission.accepts_publication}
            name="acceptsPublication"
            type="checkbox"
          />
          <span>Acepta publicacion</span>
        </label>
      </EditSection>

      <div className="flex flex-col justify-end gap-3 border-t border-stone-200 pt-4 sm:flex-row">
        <button
          className="md-outlined-button px-5"
          formAction={updateAndApproveBusinessSubmissionAction}
          type="submit"
        >
          Guardar y aprobar
        </button>
        <button className="md-filled-button px-5" type="submit">
          Guardar cambios
        </button>
      </div>
    </form>
  );
}

function EditSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4">
      <h3 className="border-b border-stone-200 pb-2 text-xs font-black uppercase text-stone-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoSection({
  children,
  hasContent,
  title,
}: {
  children: ReactNode;
  hasContent: boolean;
  title: string;
}) {
  if (!hasContent) {
    return null;
  }

  return (
    <div className="border-t border-stone-200 pt-5 first:border-t-0 first:pt-0 lg:pt-6 lg:first:pt-0">
      <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
        {title}
      </p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
        {children}
      </dl>
    </div>
  );
}

function Info({
  action,
  href,
  icon,
  label,
  value,
}: {
  action?: ReactNode;
  href?: string;
  icon?: ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) {
    return null;
  }

  const content = (
    <span className="flex items-center gap-1.5 break-words font-semibold text-stone-800 lg:text-base">
      {icon}
      {value}
    </span>
  );

  return (
    <div>
      <dt className="text-xs font-black uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 flex items-center gap-1.5">
        {href ? (
          <a
            className="flex min-w-0 items-center gap-1.5 hover:underline"
            href={href}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            target={href.startsWith("http") ? "_blank" : undefined}
          >
            {content}
          </a>
        ) : (
          content
        )}
        {action}
      </dd>
    </div>
  );
}

const PAYMENT_METHOD_MATCHERS: Array<{
  icon: (className: string) => ReactNode;
  keywords: string[];
  label: string;
}> = [
  {
    icon: (className) => <CashIcon className={className} />,
    keywords: ["efectivo", "cash"],
    label: "Efectivo",
  },
  {
    icon: (className) => <WalletIcon className={className} />,
    keywords: ["nequi"],
    label: "Nequi",
  },
  {
    icon: (className) => <WalletIcon className={className} />,
    keywords: ["daviplata"],
    label: "Daviplata",
  },
  {
    icon: (className) => <BankIcon className={className} />,
    keywords: ["transferencia", "trasferencia", "consignacion"],
    label: "Transferencia",
  },
  {
    icon: (className) => <CardIcon className={className} />,
    keywords: ["tarjeta", "datafono", "dataphono", "pos"],
    label: "Tarjeta",
  },
];

function PaymentMethodsInfo({ value }: { value?: string | null }) {
  if (!value) {
    return null;
  }

  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const matches = PAYMENT_METHOD_MATCHERS.filter((matcher) =>
    matcher.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return (
    <div>
      <dt className="text-xs font-black uppercase text-stone-500">Pagos</dt>
      <dd className="mt-1.5">
        {matches.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matches.map((matcher) => (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-surface-container)] px-2.5 py-1 text-xs font-bold text-stone-700"
                key={matcher.label}
              >
                {matcher.icon("size-3.5 text-stone-500")}
                {matcher.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="break-words font-semibold text-stone-800 lg:text-base">
            {value}
          </span>
        )}
      </dd>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.73.45 3.42 1.32 4.9L2 22l5.31-1.39a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.83 14.13c-.25.7-1.24 1.28-2.03 1.45-.55.12-1.26.21-3.67-.79-3.08-1.27-5.06-4.39-5.21-4.6-.15-.2-1.25-1.66-1.25-3.17 0-1.5.79-2.24 1.07-2.55.28-.31.61-.38.81-.38.2 0 .41 0 .59.01.19.01.44-.07.69.53.25.6.86 2.08.94 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.31.4-.44.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.66-.08.18-.2.76-.89.97-1.19.2-.3.41-.25.68-.15.28.1 1.75.83 2.05.98.3.15.5.23.58.36.08.13.08.74-.17 1.44Z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CashIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect height="12" rx="2" width="20" x="2" y="6" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 6v0M18 18v0" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h3v-4Z" />
    </svg>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M16 10v11" />
    </svg>
  );
}

function CardIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2" width="20" x="2" y="5" />
      <path d="M2 10h20" />
    </svg>
  );
}

function EditField({
  children,
  label,
  required = false,
}: {
  children: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-800">
      <span>
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function ImagePreview({ label, src }: { label: string; src?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-[var(--md-surface-container)]">
      <div className="border-b border-stone-200 px-3 py-2 text-xs font-black uppercase text-stone-600">
        {label}
      </div>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={label} className="h-40 w-full object-contain p-3" src={src} />
      ) : (
        <div className="grid h-28 place-items-center px-4 text-center text-sm font-bold text-stone-500">
          Sin archivo
        </div>
      )}
    </div>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseSearch(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "";
}

function getPageHref({
  page,
  search,
  status,
}: {
  page: number;
  search: string;
  status: SubmissionStatus;
}) {
  const params = new URLSearchParams({
    estado: status,
    pagina: String(page),
  });

  if (search) {
    params.set("q", search);
  }

  return `/admin/postulaciones?${params.toString()}`;
}

function getPaginationPages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

function parseStatus(value: string | undefined): SubmissionStatus | undefined {
  if (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "needs_info"
  ) {
    return value;
  }

  return undefined;
}

function formatDate(value: string) {
  const date = new Date(value);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
}

function deliveryLabel(value: string | null) {
  if (value === "yes") {
    return "Si ofrece domicilios";
  }

  if (value === "no") {
    return "No ofrece domicilios";
  }

  if (value === "pickup") {
    return "Solo recoger en tienda";
  }

  return null;
}

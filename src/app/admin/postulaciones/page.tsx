import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminSubmissionCategories,
  getBusinessSubmissions,
  type AdminSubmissionCategory,
  isValidAdminToken,
  type BusinessSubmission,
  type SubmissionStatus,
} from "@/lib/admin-submissions";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import {
  approveSubmissionAction,
  authenticateAdminAction,
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
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isValidAdminToken(token)) {
    return <AdminLogin />;
  }

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
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#B3262E]">
              Admin local
            </p>
            <h1 className="mt-2 text-3xl font-black">Postulaciones</h1>
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
                    ? "bg-[#B3262E] text-white"
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
              <h2 className="text-xl font-black">No hay postulaciones</h2>
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
          ? "bg-[#B3262E] text-white"
          : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-[#f7f0e8]"
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
          <span className="rounded-full bg-[#fff3bd] px-3 py-1 text-xs font-black text-[#5b1b00]">
            {STATUS_LABELS[submission.status]}
          </span>
          <span className="text-xs font-bold text-stone-500">
            {formatDate(submission.created_at)}
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-black">{submission.business_name}</h2>
        <p className="mt-1 text-sm font-black uppercase text-[#B3262E]">
          {category ?? "Sin categoria"}
        </p>
        <p className="mt-4 text-sm font-semibold leading-6 text-stone-700">
          {submission.description ?? "Sin descripcion"}
        </p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Propietario" value={submission.owner_name} />
          <Info label="Numero propietario" value={submission.owner_phone} />
          <Info label="Contacto visible" value={submission.contact_name} />
          <Info label="WhatsApp" value={submission.whatsapp} />
          <Info label="Telefono" value={submission.phone} />
          <Info label="Email" value={submission.email} />
          <Info label="Descripcion perfil" value={submission.full_description} />
          <Info
            label="Direccion"
            value={[submission.address, submission.neighborhood]
              .filter(Boolean)
              .join(", ")}
          />
          <Info label="Horario" value={submission.schedule} />
          <Info label="Maps" value={submission.maps_url} />
          <Info
            label="Domicilios"
            value={deliveryLabel(submission.delivery_available)}
          />
          <Info label="Pagos" value={submission.payment_methods} />
          <Info label="Productos" value={submission.products_or_services} />
          <Info label="Instagram" value={submission.instagram_url} />
          <Info label="Facebook" value={submission.facebook_url} />
          <Info label="TikTok" value={submission.tiktok_url} />
          <Info label="Web" value={submission.website_url} />
          <Info label="Notas usuario" value={submission.additional_notes} />
        </dl>
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

      <details className="group rounded-xl border border-stone-200 bg-[#fffdf8]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-black text-stone-800 transition hover:bg-[#f7f0e8]">
          <span>Editar informacion de la solicitud</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#B3262E] ring-1 ring-stone-200 group-open:hidden">
            Editar
          </span>
          <span className="hidden rounded-full bg-[#ffdad8] px-3 py-1 text-xs font-black text-[#410006] group-open:inline">
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
              className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffdad8] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#410006]"
              name="logo"
              type="file"
            />
          </EditField>
          <EditField label="Reemplazar portada">
            <input
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffdad8] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#410006]"
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
            className="mt-1 size-5 accent-[#B3262E]"
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

function AdminLogin() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4 py-12 text-[#22211f]">
      <form
        action={authenticateAdminAction}
        className="grid w-full max-w-sm gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div>
          <p className="text-sm font-black uppercase text-[#B3262E]">
            Admin local
          </p>
          <h1 className="mt-2 text-2xl font-black">Acceso postulaciones</h1>
        </div>
        <label className="grid gap-2 text-sm font-black text-stone-800">
          Token admin
          <input
            autoComplete="current-password"
            className="md-field"
            name="token"
            required
            type="password"
          />
        </label>
        <button className="md-filled-button px-4" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="text-xs font-black uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-stone-800">{value}</dd>
    </div>
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
        {required ? <span className="text-[#B3262E]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function ImagePreview({ label, src }: { label: string; src?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-[#f4ede7]">
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

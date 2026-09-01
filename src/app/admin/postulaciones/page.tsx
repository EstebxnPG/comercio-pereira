import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  getBusinessSubmissions,
  isValidAdminToken,
  type BusinessSubmission,
  type SubmissionStatus,
} from "@/lib/admin-submissions";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import {
  approveSubmissionAction,
  authenticateAdminAction,
  signOutAdminAction,
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

type AdminSubmissionsPageProps = {
  searchParams: Promise<{
    estado?: string | string[];
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
  const submissions = await getBusinessSubmissions(status);

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
                href={`/admin/postulaciones?estado=${value}`}
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
                key={submission.id}
                submission={submission}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function SubmissionPanel({
  submission,
}: {
  submission: BusinessSubmission;
}) {
  const category = Array.isArray(submission.categories)
    ? submission.categories[0]?.name
    : submission.categories?.name;

  return (
    <article className="grid gap-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
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
          <Info label="Domicilios" value={deliveryLabel(submission.delivery_available)} />
          <Info label="Pagos" value={submission.payment_methods} />
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

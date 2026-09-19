import type { Metadata } from "next";
import Link from "next/link";
import { claimBusinessInvitesAction } from "@/app/dashboard/actions";
import { signOutAction } from "@/app/login/actions";
import {
  getDashboardBusinesses,
  getPendingBusinessInvites,
} from "@/lib/dashboard-businesses";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ROLE_LABELS = {
  owner: "Propietario",
  manager: "Manager",
  editor: "Editor",
  viewer: "Lectura",
};

type DashboardPageProps = {
  searchParams: Promise<{
    claimed?: string | string[];
  }>;
};

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const [businesses, pendingInvites] = await Promise.all([
    getDashboardBusinesses(),
    getPendingBusinessInvites(),
  ]);
  const claimed = getSingleParam(searchParams.claimed) === "1";

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#B3262E]">
              CMS empresa
            </p>
            <h1 className="mt-2 text-3xl font-black">Tus negocios</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
              Gestiona los perfiles donde tienes permisos activos.
            </p>
          </div>
          <form action={signOutAction}>
            <button className="md-outlined-button px-4" type="submit">
              Cerrar sesion
            </button>
          </form>
        </header>

        {claimed ? (
          <p className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-800">
            Invitaciones activadas.
          </p>
        ) : null}

        {pendingInvites.length > 0 ? (
          <section className="rounded-2xl border border-[#f5c84c] bg-[#fff8d6] p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Invitaciones pendientes</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
                  Hay negocios aprobados para el correo de esta cuenta.
                </p>
              </div>
              <form action={claimBusinessInvitesAction}>
                <button className="md-filled-button px-5" type="submit">
                  Activar
                </button>
              </form>
            </div>
            <ul className="mt-4 grid gap-2 text-sm font-bold text-stone-800">
              {pendingInvites.map((invite) => (
                <li
                  className="rounded-xl border border-yellow-200 bg-white px-4 py-3"
                  key={invite.id}
                >
                  {invite.businessName} · {ROLE_LABELS[invite.role]}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {businesses.length === 0 ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black">Aun no tienes negocios</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-stone-600">
              Cuando un admin apruebe o asigne tu comercio, aparecera aqui.
            </p>
            <Link className="md-filled-button mt-5 px-5" href="/registrar-comercio">
              Registrar comercio
            </Link>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {businesses.map((business) => (
              <article
                className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                key={business.id}
              >
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="size-16 rounded-xl border border-stone-200 object-contain p-2"
                    src={business.logoUrl}
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black">
                      {business.name}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-[#B3262E]">
                      {business.categoryName}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-stone-600">
                      {business.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-[#fff3bd] px-3 py-1 text-[#5b1b00]">
                    {ROLE_LABELS[business.role]}
                  </span>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                    {business.published ? "Publicado" : "No publicado"}
                  </span>
                  {business.verified ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                      Verificado
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row">
                  <Link
                    className="md-filled-button px-4"
                    href={`/dashboard/negocios/${business.id}`}
                  >
                    Gestionar
                  </Link>
                  {business.published ? (
                    <Link
                      className="md-outlined-button px-4"
                      href={`/comercios/${business.slug}`}
                    >
                      Ver publico
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

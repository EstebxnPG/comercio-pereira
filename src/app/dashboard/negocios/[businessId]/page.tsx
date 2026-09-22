import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  updateBusinessProfileAction,
  uploadBusinessImageAction,
} from "@/app/dashboard/negocios/[businessId]/actions";
import { requireBusinessRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { BUSINESS_STATUSES } from "@/types/business";

export const metadata: Metadata = {
  title: "Editar negocio",
};

type BusinessProfilePageProps = {
  params: Promise<{
    businessId: string;
  }>;
  searchParams: Promise<{
    saved?: string | string[];
  }>;
};

const STATUS_LABELS = {
  open: "Abierto",
  partial_service: "Servicio parcial",
  remote_attention: "Atencion remota",
  relocated: "Reubicado",
  delivery_only: "Solo domicilio",
  temporarily_closed: "Temporalmente cerrado",
};

export default async function BusinessProfilePage(props: BusinessProfilePageProps) {
  const { businessId } = await props.params;
  const searchParams = await props.searchParams;
  await requireBusinessRole(businessId, ["owner", "manager"]);

  const business = await getEditableBusiness(businessId);

  if (!business) {
    notFound();
  }

  const saved = getSingleParam(searchParams.saved) === "1";
  const socialLinks = new Map(
    business.business_social_links.map((link) => [link.platform, link.url]),
  );

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-black text-[#B3262E] hover:underline"
              href="/dashboard"
            >
              Volver al dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-black">{business.name}</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              Edita la informacion publica del comercio.
            </p>
          </div>
          {business.published ? (
            <Link className="md-outlined-button px-4" href={`/comercios/${business.slug}`}>
              Ver publico
            </Link>
          ) : null}
        </header>

        {saved ? (
          <p className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-800">
            Cambios guardados.
          </p>
        ) : null}

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
          <Link className="md-filled-button px-4" href={`/dashboard/negocios/${business.id}`}>
            Perfil
          </Link>
          <Link
            className="md-outlined-button px-4"
            href={`/dashboard/negocios/${business.id}/productos`}
          >
            Productos
          </Link>
          <Link
            className="md-outlined-button px-4"
            href={`/dashboard/negocios/${business.id}/promociones`}
          >
            Promociones
          </Link>
          <Link
            className="md-outlined-button px-4"
            href={`/dashboard/negocios/${business.id}/estadisticas`}
          >
            Estadisticas
          </Link>
          <Link
            className="md-outlined-button px-4"
            href={`/dashboard/negocios/${business.id}/equipo`}
          >
            Equipo
          </Link>
        </nav>

        <form
          action={updateBusinessProfileAction}
          className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <input name="businessId" type="hidden" value={business.id} />

          <section className="grid gap-4">
            <h2 className="border-b border-stone-200 pb-2 text-xs font-black uppercase text-stone-500">
              Informacion principal
            </h2>
            <EditField label="Nombre comercial">
              <input
                className="md-field"
                defaultValue={business.name}
                maxLength={90}
                name="name"
                required
              />
            </EditField>
            <EditField label="Descripcion corta">
              <textarea
                className="md-field min-h-28 py-3 text-sm leading-6"
                defaultValue={business.short_description}
                maxLength={420}
                name="shortDescription"
                required
              />
            </EditField>
            <EditField label="Descripcion completa">
              <textarea
                className="md-field min-h-36 py-3 text-sm leading-6"
                defaultValue={business.full_description ?? ""}
                maxLength={1200}
                name="fullDescription"
              />
            </EditField>
          </section>

          <section className="grid gap-4">
            <h2 className="border-b border-stone-200 pb-2 text-xs font-black uppercase text-stone-500">
              Operacion y contacto
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditField label="Estado operativo">
                <select
                  className="md-field"
                  defaultValue={business.status}
                  name="status"
                  required
                >
                  {BUSINESS_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </EditField>
              <EditField label="WhatsApp">
                <input
                  className="md-field"
                  defaultValue={business.whatsapp ?? ""}
                  inputMode="tel"
                  maxLength={18}
                  name="whatsapp"
                />
              </EditField>
              <EditField label="Telefono">
                <input
                  className="md-field"
                  defaultValue={business.phone ?? ""}
                  maxLength={30}
                  name="phone"
                />
              </EditField>
              <EditField label="Horario">
                <input
                  className="md-field"
                  defaultValue={business.schedule ?? ""}
                  maxLength={160}
                  name="schedule"
                />
              </EditField>
            </div>
            <EditField label="Direccion">
              <input
                className="md-field"
                defaultValue={business.address ?? ""}
                maxLength={180}
                name="address"
              />
            </EditField>
            <EditField label="Google Maps">
              <input
                className="md-field"
                defaultValue={business.maps_url ?? ""}
                maxLength={260}
                name="mapsUrl"
                placeholder="https://..."
              />
            </EditField>
          </section>

          <section className="grid gap-4">
            <h2 className="border-b border-stone-200 pb-2 text-xs font-black uppercase text-stone-500">
              Canales digitales
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditField label="Instagram">
                <input
                  className="md-field"
                  defaultValue={socialLinks.get("instagram") ?? ""}
                  maxLength={220}
                  name="instagram"
                  placeholder="https://..."
                />
              </EditField>
              <EditField label="Facebook">
                <input
                  className="md-field"
                  defaultValue={socialLinks.get("facebook") ?? ""}
                  maxLength={220}
                  name="facebook"
                  placeholder="https://..."
                />
              </EditField>
              <EditField label="TikTok">
                <input
                  className="md-field"
                  defaultValue={socialLinks.get("tiktok") ?? ""}
                  maxLength={220}
                  name="tiktok"
                  placeholder="https://..."
                />
              </EditField>
              <EditField label="Web">
                <input
                  className="md-field"
                  defaultValue={socialLinks.get("website") ?? ""}
                  maxLength={220}
                  name="website"
                  placeholder="https://..."
                />
              </EditField>
            </div>
          </section>

          <div className="flex justify-end border-t border-stone-200 pt-4">
            <button className="md-filled-button px-5" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>

        <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-black">Imagenes del negocio</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              Actualiza el logo y la portada publica del comercio.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploadForm
              businessId={business.id}
              currentImage={business.logo_url}
              imageType="logo"
              title="Logo"
            />
            <ImageUploadForm
              businessId={business.id}
              currentImage={business.cover_image_url}
              imageType="cover"
              title="Portada"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function EditField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-800">
      {label}
      {children}
    </label>
  );
}

function ImageUploadForm({
  businessId,
  currentImage,
  imageType,
  title,
}: {
  businessId: string;
  currentImage: string | null;
  imageType: "logo" | "cover";
  title: string;
}) {
  return (
    <form
      action={uploadBusinessImageAction}
      className="grid gap-3 rounded-xl border border-stone-200 bg-[#fffdf8] p-4"
    >
      <input name="businessId" type="hidden" value={businessId} />
      <input name="imageType" type="hidden" value={imageType} />
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-3 py-2 text-xs font-black uppercase text-stone-500">
          {title}
        </div>
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-44 w-full object-contain p-3"
            src={currentImage}
          />
        ) : (
          <div className="grid h-44 place-items-center px-4 text-center text-sm font-bold text-stone-500">
            Sin imagen
          </div>
        )}
      </div>
      <label className="grid gap-2 text-sm font-black text-stone-800">
        Nueva imagen
        <input
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffdad8] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#410006]"
          name="image"
          required
          type="file"
        />
      </label>
      <button className="md-outlined-button px-4" type="submit">
        Subir {title.toLowerCase()}
      </button>
    </form>
  );
}

async function getEditableBusiness(businessId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        name,
        short_description,
        full_description,
        logo_url,
        cover_image_url,
        status,
        phone,
        whatsapp,
        address,
        maps_url,
        schedule,
        published,
        business_social_links(platform, url)
      `,
    )
    .eq("id", businessId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

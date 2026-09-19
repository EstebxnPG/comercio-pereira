import Link from "next/link";
import {
  deletePromotionAction,
  savePromotionAction,
} from "@/app/dashboard/negocios/[businessId]/promociones/actions";
import { requireBusinessRole } from "@/lib/auth";
import {
  BUSINESS_PROMOTION_TYPE_LABELS,
  formatPromotionValue,
  type BusinessPromotionType,
} from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PromotionsPageProps = {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
};

export default async function PromotionsPage(props: PromotionsPageProps) {
  const { businessId } = await props.params;
  const searchParams = await props.searchParams;
  await requireBusinessRole(businessId, ["owner", "manager"]);
  const promotions = await getBusinessPromotions(businessId);
  const saved = getSingleParam(searchParams.saved) === "1";

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <Link
            className="text-sm font-black text-[#B3262E] hover:underline"
            href={`/dashboard/negocios/${businessId}`}
          >
            Volver al perfil
          </Link>
          <h1 className="mt-3 text-3xl font-black">Promociones</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
            Simula beneficios comerciales como envio gratis, cupones y descuentos
            de tienda.
          </p>
        </header>

        {saved ? (
          <p className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-800">
            Promocion guardada.
          </p>
        ) : null}

        <PromotionForm businessId={businessId} />

        <section className="grid gap-3">
          {promotions.length === 0 ? (
            <div className="md-surface p-6">
              <h2 className="text-xl font-black">Sin promociones</h2>
              <p className="mt-2 text-sm font-semibold text-stone-600">
                Crea un beneficio para mostrarlo en el perfil publico del comercio.
              </p>
            </div>
          ) : (
            promotions.map((promotion) => (
              <article className="md-surface grid gap-4 p-5" key={promotion.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-[#B3262E]">
                      {
                        BUSINESS_PROMOTION_TYPE_LABELS[
                          promotion.type as BusinessPromotionType
                        ]
                      }{" "}
                      / {promotion.status}
                    </p>
                    <h2 className="mt-1 text-xl font-black">{promotion.title}</h2>
                    <p className="mt-1 text-sm font-black text-[#B3262E]">
                      {formatPromotionValue({
                        minimumOrderAmount: promotion.minimum_order_amount,
                        type: promotion.type as BusinessPromotionType,
                        value: promotion.value,
                      })}
                    </p>
                    {promotion.description ? (
                      <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
                        {promotion.description}
                      </p>
                    ) : null}
                  </div>
                  {promotion.status === "active" ? (
                    <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                      Pausala antes de eliminar
                    </p>
                  ) : (
                    <form action={deletePromotionAction}>
                      <input name="businessId" type="hidden" value={businessId} />
                      <input name="promotionId" type="hidden" value={promotion.id} />
                      <button className="md-outlined-button px-4 text-sm" type="submit">
                        Eliminar
                      </button>
                    </form>
                  )}
                </div>
                <PromotionForm businessId={businessId} promotion={promotion} />
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function PromotionForm({
  businessId,
  promotion,
}: {
  businessId: string;
  promotion?: {
    description: string | null;
    ends_at: string | null;
    id: string;
    minimum_order_amount: number | null;
    starts_at: string | null;
    status: string;
    title: string;
    type: string;
    value: number | null;
  };
}) {
  return (
    <form
      action={savePromotionAction}
      className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <input name="businessId" type="hidden" value={businessId} />
      {promotion ? (
        <input name="promotionId" type="hidden" value={promotion.id} />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tipo">
          <select
            className="md-field"
            defaultValue={promotion?.type ?? "free_shipping"}
            name="type"
          >
            <option value="free_shipping">Envio gratis</option>
            <option value="coupon_amount">Cupon en pesos</option>
            <option value="store_percentage">Descuento tienda</option>
            <option value="custom_message">Mensaje promocional</option>
          </select>
        </Field>
        <Field label="Estado">
          <select
            className="md-field"
            defaultValue={promotion?.status ?? "draft"}
            name="status"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
          </select>
        </Field>
        <Field label="Valor">
          <input
            className="md-field"
            defaultValue={formatPromotionValueInput(
              promotion?.type,
              promotion?.value,
            )}
            inputMode="numeric"
            name="value"
            placeholder="6000 o 10"
          />
        </Field>
      </div>
      <Field label="Titulo">
        <input
          className="md-field"
          defaultValue={promotion?.title ?? ""}
          maxLength={90}
          name="title"
          placeholder="Envio gratis desde $30.000"
          required
        />
      </Field>
      <Field label="Descripcion">
        <textarea
          className="md-field min-h-24 py-3"
          defaultValue={promotion?.description ?? ""}
          maxLength={260}
          name="description"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Compra minima">
          <input
            className="md-field"
            defaultValue={formatMoneyInput(promotion?.minimum_order_amount)}
            inputMode="numeric"
            name="minimumOrderAmount"
            placeholder="30000"
          />
        </Field>
        <Field label="Inicio">
          <input
            className="md-field"
            defaultValue={toDateTimeLocal(promotion?.starts_at ?? null)}
            name="startsAt"
            type="datetime-local"
          />
        </Field>
        <Field label="Fin">
          <input
            className="md-field"
            defaultValue={toDateTimeLocal(promotion?.ends_at ?? null)}
            name="endsAt"
            type="datetime-local"
          />
        </Field>
      </div>
      <div className="flex justify-end border-t border-stone-200 pt-4">
        <button className="md-filled-button px-5" type="submit">
          {promotion ? "Actualizar promocion" : "Crear promocion"}
        </button>
      </div>
    </form>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-800">
      {label}
      {children}
    </label>
  );
}

async function getBusinessPromotions(businessId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_promotions")
    .select(
      "id, type, title, description, value, minimum_order_amount, status, starts_at, ends_at",
    )
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

function formatPromotionValueInput(
  type: string | undefined,
  value: number | null | undefined,
) {
  if (value === null || value === undefined) {
    return "";
  }

  if (type === "store_percentage") {
    return String(value);
  }

  return String(value / 100);
}

function formatMoneyInput(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value / 100);
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

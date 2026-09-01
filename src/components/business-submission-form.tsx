"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BusinessCard } from "@/components/business-card";
import {
  DEFAULT_BUSINESS_COVER_IMAGE,
  INCLUSION_WHATSAPP,
} from "@/lib/constants";
import type { Business } from "@/types/business";

type FormState = {
  businessName: string;
  category: string;
  ownerName: string;
  ownerPhone: string;
  phone: string;
  whatsapp: string;
  email: string;
  description: string;
  fullDescription: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
  address: string;
  neighborhood: string;
  mapsUrl: string;
  schedule: string;
  deliveryAvailable: string;
  paymentMethods: string;
  additionalNotes: string;
  acceptsPublication: boolean;
};

type SubmitState =
  | { status: "idle"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const INITIAL_STATE: FormState = {
  businessName: "",
  category: "",
  ownerName: "",
  ownerPhone: "",
  phone: "",
  whatsapp: "",
  email: "",
  description: "",
  fullDescription: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  websiteUrl: "",
  address: "",
  neighborhood: "",
  mapsUrl: "",
  schedule: "",
  deliveryAvailable: "",
  paymentMethods: "",
  additionalNotes: "",
  acceptsPublication: false,
};

const STEPS: Array<{ eyebrow: string; title: string }> = [
  { eyebrow: "Informacion Basica", title: "Informacion principal" },
  { eyebrow: "Contacto", title: "Contacto comercial" },
  { eyebrow: "Ubicacion", title: "Ubicacion y horarios" },
  { eyebrow: "Canales", title: "Redes e imagenes" },
  { eyebrow: "Operacion", title: "Operacion" },
  { eyebrow: "Final", title: "Revision final" },
] as const;

export function BusinessSubmissionForm({
  categories,
}: {
  categories: string[];
}) {
  const [form, setForm] = useState<FormState>({
    ...INITIAL_STATE,
  });
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [stepError, setStepError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const hasChangedStep = useRef(false);

  useEffect(() => {
    if (!hasChangedStep.current) {
      hasChangedStep.current = true;
      return;
    }

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const previewBusiness = useMemo<Business>(
    () => ({
      id: "preview",
      slug: "vista-previa",
      name: form.businessName.trim() || "Nombre de tu comercio",
      category: form.category || "Categoria",
      shortDescription:
        form.description.trim() ||
        "Describe que vendes, que te hace diferente y como pueden comprarte.",
      fullDescription:
        form.fullDescription.trim() || form.description.trim() || undefined,
      logo: logoPreviewUrl,
      coverImage: coverPreviewUrl || DEFAULT_BUSINESS_COVER_IMAGE,
      status: "open",
      phone: form.phone.trim() || undefined,
      whatsapp: normalizeColombianWhatsapp(form.whatsapp) || undefined,
      instagramUrl: normalizeSocialUrl("instagram", form.instagramUrl),
      facebookUrl: normalizeSocialUrl("facebook", form.facebookUrl),
      mapsUrl: form.mapsUrl.trim() || undefined,
      address:
        [form.address.trim(), form.neighborhood.trim()]
          .filter(Boolean)
          .join(", ") || "Direccion o zona de atencion",
      schedule: form.schedule.trim() || undefined,
      lastUpdated: "2026-09-01",
      featured: false,
      published: false,
    }),
    [coverPreviewUrl, form, logoPreviewUrl],
  );

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitState({ status: "idle", message: "" });
    setStepError("");
  }

  function updateBooleanField(field: keyof FormState, value: boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitState({ status: "idle", message: "" });
    setStepError("");
  }

  function updateLogoFile(file: File | null) {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);
    setLogoPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  function updateCoverFile(file: File | null) {
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setCoverFile(file);
    setCoverPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  function goToNextStep() {
    const validation = validateStep(currentStep, form, logoFile);

    if (!validation.ok) {
      setStepError(validation.error);
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
    setStepError("");
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setStepError("");
  }

  function requestStep(targetStep: number) {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      setStepError("");
      return;
    }

    goToNextStep();
  }

  function updateSocialField(
    field: "instagramUrl" | "facebookUrl",
    platform: "instagram" | "facebook",
    value: string,
  ) {
    updateField(field, normalizeSocialUrl(platform, value) ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateStep(currentStep, form, logoFile);

    if (!validation.ok) {
      setStepError(validation.error);
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: "idle", message: "" });

    try {
      const body = new FormData();

      for (const [key, value] of Object.entries(form)) {
        body.append(
          key,
          key === "whatsapp" ? normalizeColombianWhatsapp(String(value)) : String(value),
        );
      }

      if (logoFile) {
        body.append("logo", logoFile);
      }

      if (coverFile) {
        body.append("coverImage", coverFile);
      }

      const response = await fetch("/api/business-submissions", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "No pudimos guardar el comercio.");
      }

      setSubmitState({
        status: "success",
        message:
          "Listo. Recibimos el comercio y queda pendiente de revision antes de publicarse.",
      });
      setForm(INITIAL_STATE);
      updateLogoFile(null);
      updateCoverFile(null);
      setCurrentStep(0);
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos guardar el comercio.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-[#fbfaf7] py-6 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 px-3 sm:gap-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8">
        <form
          ref={formRef}
          className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_8px_30px_rgb(34_21_20/0.08)]"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 bg-[#fffdf8] px-4 pb-5 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[#B3262E]">
                  Registro de comercio
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-normal text-[#22211f] sm:text-3xl">
                  {STEPS[currentStep].title}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-[#f4ede7] px-3 py-1.5 text-xs font-black text-stone-700">
                {currentStep + 1}/{STEPS.length}
              </span>
            </div>
            <StepProgress currentStep={currentStep} onStepChange={requestStep} />
          </div>

          <div className="grid gap-5 p-4 sm:p-6">
            {currentStep === 0 ? (
            <StepSection>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre del comercio" required>
                  <input
                    className="md-field"
                    maxLength={90}
                    name="businessName"
                    required
                    value={form.businessName}
                    onChange={(event) =>
                      updateField("businessName", event.target.value)
                    }
                  />
                </Field>
                <Field label="Categoria" required>
                  <select
                    className="md-field"
                    name="category"
                    required
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                  >
                    <option value="">Seleccionar categoria</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Descripcion corta para la vista previa en la web" required>
                <textarea
                  className="md-field min-h-32 py-3 leading-6"
                  maxLength={420}
                  name="description"
                  required
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                />
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {form.description.length}/420 caracteres
                </p>
              </Field>
              <Field label="Descripcion completa del perfil" required>
                <textarea
                  className="md-field min-h-36 py-3 leading-6"
                  maxLength={1200}
                  name="fullDescription"
                  required
                  value={form.fullDescription}
                  onChange={(event) =>
                    updateField("fullDescription", event.target.value)
                  }
                />
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {form.fullDescription.length}/1200 caracteres
                </p>
              </Field>
            </StepSection>
          ) : null}

          {currentStep === 1 ? (
            <StepSection>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre del propietario" required>
                  <input
                    className="md-field"
                    maxLength={90}
                    name="ownerName"
                    required
                    value={form.ownerName}
                    onChange={(event) =>
                      updateField("ownerName", event.target.value)
                    }
                  />
                </Field>
                <Field label="Numero del propietario" required>
                  <input
                    className="md-field"
                    inputMode="tel"
                    maxLength={18}
                    name="ownerPhone"
                    placeholder="573001234567"
                    required
                    value={form.ownerPhone}
                    onChange={(event) =>
                      updateField("ownerPhone", event.target.value)
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="WhatsApp" required>
                  <div className="flex overflow-hidden rounded-xl border border-[#85736f] bg-white focus-within:ring-2 focus-within:ring-[#B3262E] focus-within:ring-offset-2">
                    <span className="flex min-h-12 items-center border-r border-stone-200 bg-[#fffdf8] px-4 text-sm font-black text-stone-700">
                      +57
                    </span>
                    <input
                      className="min-h-12 w-full bg-transparent px-4 py-2 text-base font-semibold text-[#22211f] outline-none placeholder:text-stone-400"
                      inputMode="numeric"
                      maxLength={10}
                      name="whatsapp"
                      placeholder="3001234567"
                      required
                      value={form.whatsapp}
                      onChange={(event) =>
                        updateField("whatsapp", event.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                </Field>
                <Field label="Telefono">
                  <input
                    className="md-field"
                    inputMode="tel"
                    maxLength={30}
                    name="phone"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email">
                  <input
                    className="md-field"
                    maxLength={120}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                  />
                </Field>
              </div>
            </StepSection>
          ) : null}

          {currentStep === 2 ? (
            <StepSection>
              <Field label="Direccion">
                <input
                  className="md-field"
                  maxLength={180}
                  name="address"
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Barrio o zona">
                  <input
                    className="md-field"
                    maxLength={80}
                    name="neighborhood"
                    value={form.neighborhood}
                    onChange={(event) =>
                      updateField("neighborhood", event.target.value)
                    }
                  />
                </Field>
                <Field label="Horario">
                  <input
                    className="md-field"
                    maxLength={160}
                    name="schedule"
                    placeholder="Lun a sab, 8:00 a.m. - 6:00 p.m."
                    value={form.schedule}
                    onChange={(event) =>
                      updateField("schedule", event.target.value)
                    }
                  />
                </Field>
              </div>
              <Field label="Link de Google Maps">
                <input
                  className="md-field"
                  maxLength={260}
                  name="mapsUrl"
                  placeholder="https://maps.google.com/..."
                  type="url"
                  value={form.mapsUrl}
                  onChange={(event) =>
                    updateField("mapsUrl", event.target.value)
                  }
                />
              </Field>
            </StepSection>
          ) : null}

          {currentStep === 3 ? (
            <StepSection>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Instagram">
                  <input
                    className="md-field"
                    maxLength={220}
                    name="instagramUrl"
                    placeholder="@usuario o https://instagram.com/usuario"
                    value={form.instagramUrl}
                    onChange={(event) =>
                      updateField("instagramUrl", event.target.value)
                    }
                    onBlur={(event) =>
                      updateSocialField(
                        "instagramUrl",
                        "instagram",
                        event.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="Facebook">
                  <input
                    className="md-field"
                    maxLength={220}
                    name="facebookUrl"
                    placeholder="usuario o https://facebook.com/usuario"
                    value={form.facebookUrl}
                    onChange={(event) =>
                      updateField("facebookUrl", event.target.value)
                    }
                    onBlur={(event) =>
                      updateSocialField(
                        "facebookUrl",
                        "facebook",
                        event.target.value,
                      )
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="TikTok">
                  <input
                    className="md-field"
                    maxLength={220}
                    name="tiktokUrl"
                    placeholder="https://tiktok.com/@..."
                    type="url"
                    value={form.tiktokUrl}
                    onChange={(event) =>
                      updateField("tiktokUrl", event.target.value)
                    }
                  />
                </Field>
                <Field label="Sitio web">
                  <input
                    className="md-field"
                    maxLength={220}
                    name="websiteUrl"
                    placeholder="https://..."
                    type="url"
                    value={form.websiteUrl}
                    onChange={(event) =>
                      updateField("websiteUrl", event.target.value)
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FileField
                  accept="image/png,image/jpeg,image/webp"
                  file={logoFile}
                  label="Adjuntar logo"
                  name="logo"
                  onChange={updateLogoFile}
                  required
                />
                <FileField
                  accept="image/png,image/jpeg,image/webp"
                  file={coverFile}
                  label="Adjuntar imagen de portada"
                  name="coverImage"
                  onChange={updateCoverFile}
                />
              </div>
            </StepSection>
          ) : null}

          {currentStep === 4 ? (
            <StepSection>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Domicilios">
                  <select
                    className="md-field"
                    name="deliveryAvailable"
                    value={form.deliveryAvailable}
                    onChange={(event) =>
                      updateField("deliveryAvailable", event.target.value)
                    }
                  >
                    <option value="">Sin especificar</option>
                    <option value="yes">Si ofrece domicilios</option>
                    <option value="no">No ofrece domicilios</option>
                    <option value="pickup">Solo recoger en tienda</option>
                  </select>
                </Field>
                <Field label="Metodos de pago">
                  <input
                    className="md-field"
                    maxLength={180}
                    name="paymentMethods"
                    placeholder="Efectivo, Nequi, Daviplata, datáfono..."
                    value={form.paymentMethods}
                    onChange={(event) =>
                      updateField("paymentMethods", event.target.value)
                    }
                  />
                </Field>
              </div>
              <Field label="Notas adicionales">
                <textarea
                  className="md-field min-h-28 py-3 leading-6"
                  maxLength={500}
                  name="additionalNotes"
                  value={form.additionalNotes}
                  onChange={(event) =>
                    updateField("additionalNotes", event.target.value)
                  }
                />
              </Field>
            </StepSection>
          ) : null}

          {currentStep === 5 ? (
            <StepSection>
              <div className="rounded-2xl bg-[#fff3bd] p-4 text-sm font-bold leading-6 text-[#5b1b00]">
                Revisa la vista previa antes de enviar. La publicacion no es
                automatica: primero validamos la informacion y luego creamos el
                perfil definitivo.
              </div>
              <div className="grid gap-3 rounded-2xl border border-stone-200 bg-[#fffdf8] p-4 text-sm font-semibold leading-6 text-stone-700 shadow-sm">
                <p className="font-black text-stone-900">
                  Terminos de publicacion y autorizacion
                </p>
                <p>
                  Al enviar este formulario declaras que tienes autorizacion
                  para compartir la informacion del comercio, que los datos
                  enviados son correctos y que Compra en Pereira puede revisarlos,
                  editarlos de forma razonable, contactarte para verificacion y
                  publicarlos dentro de la plataforma y piezas de comunicacion
                  asociadas a la iniciativa.
                </p>
                <p>
                  La publicacion no garantiza ventas, posicionamiento destacado
                  ni permanencia indefinida. Podemos rechazar, pausar, corregir o
                  retirar perfiles si la informacion es falsa, incompleta,
                  desactualizada, no autorizada o afecta la confianza del
                  directorio.
                </p>
                {INCLUSION_WHATSAPP ? (
                  <p>
                    Para avisar que ya llenaste el formulario o preguntar por el
                    estado de revision, puedes escribirle a Fabian Sanchez
                    &quot;El Chinito&quot;.{" "}
                    <a
                      className="font-black text-[#B3262E] underline underline-offset-4"
                      href={`https://wa.me/${INCLUSION_WHATSAPP}?text=${encodeURIComponent(
                        "Hola Chinito, ya envie mi solicitud para unirme a compra en Pereira",
                      )}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Click aqui para escribir por WhatsApp
                    </a>
                    . Numero: {INCLUSION_WHATSAPP}.
                  </p>
                ) : null}
              </div>
              <label className="flex gap-3 rounded-2xl border border-stone-200 bg-[#fffdf8] p-4 text-sm font-bold leading-6 text-stone-800 shadow-sm">
                <input
                  checked={form.acceptsPublication}
                  className="mt-1 size-5 accent-[#B3262E]"
                  name="acceptsPublication"
                  required
                  type="checkbox"
                  onChange={(event) =>
                    updateBooleanField(
                      "acceptsPublication",
                      event.target.checked,
                    )
                  }
                />
                <span>
                  Acepto los terminos de publicacion y autorizo que la
                  informacion enviada sea revisada, contactada y publicada en
                  Compra en Pereira.
                </span>
              </label>
            </StepSection>
          ) : null}

          {stepError ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {stepError}
            </p>
          ) : null}

          {submitState.message ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                submitState.status === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {submitState.message}
            </p>
          ) : null}

          <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-3 border-t border-stone-200 bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:-mx-6 sm:-mb-6 sm:mt-2 sm:px-6 sm:py-5">
            <button
              className="md-outlined-button min-h-12 flex-1 px-5 disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none"
              disabled={currentStep === 0}
              onClick={goToPreviousStep}
              type="button"
            >
              Anterior
            </button>
            {currentStep === STEPS.length - 1 ? (
              <button
                className="md-filled-button min-h-12 flex-[1.3] px-5 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Enviando..." : "Enviar comercio a revision"}
              </button>
            ) : (
              <button
                className="md-filled-button min-h-12 flex-[1.3] px-5 sm:flex-none"
                onClick={goToNextStep}
                type="button"
              >
                Siguiente
              </button>
            )}
          </div>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[#22211f]">Vista previa</h2>
            <span className="rounded-full bg-[#fff3bd] px-3 py-1 text-xs font-black text-[#5b1b00]">
              Vista previa de la Tarjeta web
            </span>
          </div>
          <BusinessCard business={previewBusiness} />
          <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold leading-6 text-stone-600 ring-1 ring-stone-200">
            Esta vista ayuda a pulir el texto antes de enviarlo. Despues de
            revisar la informacion, el comercio se publica como perfil real.
          </p>
        </aside>
      </div>
    </section>
  );
}

function StepProgress({
  currentStep,
  onStepChange,
}: {
  currentStep: number;
  onStepChange: (step: number) => void;
}) {
  const nextStep = currentStep + 1 < STEPS.length ? currentStep + 1 : null;

  return (
    <div className="rounded-[24px] bg-[#f4ede7] p-3 shadow-inner">
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-[#B3262E] transition-all duration-300"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="flex items-stretch gap-2 sm:gap-3">
        <StepBubble
          active
          index={currentStep}
          label={STEPS[currentStep].eyebrow}
          onClick={() => onStepChange(currentStep)}
        />
        {nextStep !== null ? (
          <>
            <span className="grid place-items-center text-lg font-black text-stone-400">
              -&gt;
            </span>
            <StepBubble
              index={nextStep}
              label={STEPS[nextStep].eyebrow}
              onClick={() => onStepChange(nextStep)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function StepBubble({
  active = false,
  index,
  label,
  onClick,
}: {
  active?: boolean;
  index: number;
  label: string;
  onClick: () => void;
}) {
  const stepText = index === STEPS.length - 1 ? "Final" : String(index + 1);

  return (
    <button
      className={`grid min-w-0 flex-1 grid-cols-[40px_1fr] items-center gap-2 rounded-2xl p-2 text-left transition sm:grid-cols-[44px_1fr] sm:gap-3 ${
        active ? "bg-white shadow-sm ring-1 ring-stone-200" : "hover:bg-white/70"
      }`}
      onClick={onClick}
      type="button"
    >
      <span
        className={`grid size-10 place-items-center rounded-full text-sm font-black sm:size-11 ${
          active ? "bg-[#B3262E] text-white" : "bg-white text-stone-600"
        }`}
      >
        {stepText}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-black uppercase text-stone-500">
          Paso
        </span>
        <span className="block truncate text-sm font-black text-[#22211f]">
          {label}
        </span>
      </span>
    </button>
  );
}

function Field({
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

function FileField({
  accept,
  file,
  label,
  name,
  onChange,
  required = false,
}: {
  accept: string;
  file: File | null;
  label: string;
  name: string;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-800">
      <span>
        {label}
        {required ? <span className="text-[#B3262E]"> *</span> : null}
      </span>
      <input
        accept={accept}
        className="md-field h-auto min-h-16 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffdad8] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#410006]"
        name={name}
        required={required}
        type="file"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="text-xs font-semibold text-stone-500">
        {file ? file.name : "PNG, JPG o WebP."}
      </span>
    </label>
  );
}

function StepSection({ children }: { children: ReactNode }) {
  return <fieldset className="grid gap-5">{children}</fieldset>;
}

function validateStep(step: number, form: FormState, logoFile: File | null) {
  if (step === 0) {
    if (!form.businessName.trim()) {
      return { ok: false as const, error: "Escribe el nombre del comercio." };
    }

    if (!form.category.trim()) {
      return { ok: false as const, error: "Selecciona una categoria." };
    }

    if (!form.description.trim()) {
      return {
        ok: false as const,
        error: "Escribe la descripcion corta para la tarjeta.",
      };
    }

    if (!form.fullDescription.trim()) {
      return {
        ok: false as const,
        error: "Escribe la descripcion completa del perfil.",
      };
    }
  }

  if (step === 1) {
    if (!form.ownerName.trim()) {
      return {
        ok: false as const,
        error: "Escribe el nombre del propietario.",
      };
    }

    if (!/^\d{10,15}$/.test(form.ownerPhone.replace(/\D/g, ""))) {
      return {
        ok: false as const,
        error: "El numero del propietario debe tener entre 10 y 15 digitos.",
      };
    }

    if (!/^3\d{9}$/.test(form.whatsapp.replace(/\D/g, ""))) {
      return {
        ok: false as const,
        error: "Escribe el WhatsApp del comercio sin indicativo: 10 digitos, por ejemplo 3001234567.",
      };
    }
  }

  if (step === 3 && !logoFile) {
    return {
      ok: false as const,
      error: "Adjunta el logo del comercio.",
    };
  }

  if (step === STEPS.length - 1 && !form.acceptsPublication) {
    return {
      ok: false as const,
      error: "Debes aceptar los terminos antes de enviar.",
    };
  }

  return { ok: true as const };
}

function normalizeColombianWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits ? `57${digits}` : "";
}

function normalizeSocialUrl(platform: "instagram" | "facebook", value: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    return undefined;
  }

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned.replace(/^http:\/\//i, "https://");
  }

  const host =
    platform === "instagram" ? "instagram.com" : "facebook.com";
  const username = cleaned
    .replace(/^@/, "")
    .replace(/^www\./i, "")
    .replace(new RegExp(`^${host}/`, "i"), "")
    .replace(/^\/+|\/+$/g, "");

  return username ? `https://www.${host}/${username}` : undefined;
}

import "server-only";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { logBusinessAudit } from "@/lib/business-audit";

export type SubmissionStatus = "pending" | "approved" | "rejected" | "needs_info";

export type BusinessSubmission = {
  id: string;
  business_name: string;
  category_id: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  contact_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  description: string | null;
  full_description: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  address: string | null;
  neighborhood: string | null;
  maps_url: string | null;
  schedule: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  logo_bucket: string | null;
  logo_storage_path: string | null;
  cover_image_bucket: string | null;
  cover_image_storage_path: string | null;
  products_or_services: string | null;
  delivery_available: string | null;
  payment_methods: string | null;
  additional_notes: string | null;
  accepts_publication: boolean;
  status: SubmissionStatus;
  notes: string | null;
  created_at: string;
  categories: { name: string } | Array<{ name: string }> | null;
  signedLogoUrl?: string;
  signedCoverImageUrl?: string;
};

export type AdminSubmissionCategory = {
  id: string;
  name: string;
};

export type BusinessSubmissionsPage = {
  items: BusinessSubmission[];
  total: number;
};

const DEFAULT_APPROVED_LOGO = "/brand/compra-en-pereira-logo.png";
const DEFAULT_APPROVED_COVER_IMAGE = "/brand/default-business-cover.svg";
const LOGO_BUCKET =
  process.env.SUPABASE_BUSINESS_LOGOS_BUCKET ?? "business-logos";
const COVER_BUCKET =
  process.env.SUPABASE_BUSINESS_COVERS_BUCKET ?? "business-covers";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/heic",
  "image/heif",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function getBusinessSubmissions(
  status?: SubmissionStatus,
  options: { page?: number; pageSize?: number; search?: string } = {},
): Promise<BusinessSubmissionsPage> {
  const supabase = getRequiredSupabaseClient();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, Math.min(options.pageSize ?? 10, 50));
  const search = normalizeSearchTerm(options.search);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("business_submissions")
    .select(
      `
        id,
        business_name,
        category_id,
        owner_name,
        owner_phone,
        contact_name,
        phone,
        whatsapp,
        email,
        description,
        full_description,
        instagram_url,
        facebook_url,
        tiktok_url,
        website_url,
        address,
        neighborhood,
        maps_url,
        schedule,
        logo_url,
        cover_image_url,
        logo_bucket,
        logo_storage_path,
        cover_image_bucket,
        cover_image_storage_path,
        products_or_services,
        delivery_available,
        payment_methods,
        additional_notes,
        accepts_publication,
        status,
        notes,
        created_at,
        categories(name)
      `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    const pattern = `*${search}*`;

    query = query.or(
      [
        `business_name.ilike.${pattern}`,
        `owner_name.ilike.${pattern}`,
        `owner_phone.ilike.${pattern}`,
        `contact_name.ilike.${pattern}`,
        `phone.ilike.${pattern}`,
        `whatsapp.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `description.ilike.${pattern}`,
        `address.ilike.${pattern}`,
        `neighborhood.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { count, data, error } = await query;

  if (error) {
    throw new Error(`No se pudieron cargar postulaciones: ${error.message}`);
  }

  return {
    items: await Promise.all((data ?? []).map(addSignedUrls)),
    total: count ?? 0,
  };
}

function normalizeSearchTerm(value: string | undefined) {
  return value
    ?.trim()
    .replace(/[,%]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function getAdminSubmissionCategories() {
  const supabase = getRequiredSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar categorias: ${error.message}`);
  }

  return (data ?? []).map(({ id, name }) => ({ id, name }));
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
  notes: string,
) {
  const supabase = getRequiredSupabaseClient();
  const { error } = await supabase
    .from("business_submissions")
    .update({ notes: notes.trim() || null, status })
    .eq("id", submissionId);

  if (error) {
    throw new Error(`No se pudo actualizar la postulacion: ${error.message}`);
  }

  revalidatePath("/admin/postulaciones");
}

export async function updateBusinessSubmission(formData: FormData) {
  const supabase = getRequiredSupabaseClient();
  const submissionId = getRequiredFormString(formData, "submissionId");
  const businessName = cleanRequiredString(formData.get("businessName"));
  const categoryId = cleanRequiredString(formData.get("categoryId"));
  const ownerName = cleanOptionalString(formData.get("ownerName"));
  const ownerPhone = cleanPhoneLike(formData.get("ownerPhone"));
  const contactName = cleanOptionalString(formData.get("contactName"));
  const phone = cleanOptionalString(formData.get("phone"));
  const whatsapp = cleanPhoneLike(formData.get("whatsapp"));
  const email = cleanOptionalString(formData.get("email"));
  const description = cleanOptionalString(formData.get("description"));
  const fullDescription = cleanOptionalString(formData.get("fullDescription"));
  const instagramUrl = normalizeOptionalUrl(
    cleanOptionalString(formData.get("instagramUrl")),
    "instagramUrl",
  );
  const facebookUrl = normalizeOptionalUrl(
    cleanOptionalString(formData.get("facebookUrl")),
    "facebookUrl",
  );
  const tiktokUrl = normalizeOptionalUrl(
    cleanOptionalString(formData.get("tiktokUrl")),
    "tiktokUrl",
  );
  const websiteUrl = normalizeOptionalUrl(
    cleanOptionalString(formData.get("websiteUrl")),
    "websiteUrl",
  );
  const mapsUrl = normalizeOptionalUrl(
    cleanOptionalString(formData.get("mapsUrl")),
    "mapsUrl",
  );
  const logoUrl = normalizeOptionalUrl(
    cleanOptionalString(formData.get("logoUrl")),
    "logoUrl",
  );
  const coverImageUrl = normalizeOptionalUrl(
    cleanOptionalString(formData.get("coverImageUrl")),
    "coverImageUrl",
  );
  const deliveryAvailable = cleanOptionalString(
    formData.get("deliveryAvailable"),
  );

  if (!businessName) {
    throw new Error("El nombre del comercio es obligatorio.");
  }

  if (!categoryId) {
    throw new Error("La categoria es obligatoria.");
  }

  if (ownerPhone && !/^\d{10,15}$/.test(ownerPhone)) {
    throw new Error("El numero del propietario debe tener entre 10 y 15 digitos.");
  }

  if (whatsapp && !/^\d{10,15}$/.test(whatsapp)) {
    throw new Error("El WhatsApp debe tener entre 10 y 15 digitos.");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("El email no es valido.");
  }

  if (
    deliveryAvailable &&
    !["yes", "no", "pickup"].includes(deliveryAvailable)
  ) {
    throw new Error("La opcion de domicilios no es valida.");
  }

  const { data: submission, error: submissionError } = await supabase
    .from("business_submissions")
    .select("id")
    .eq("id", submissionId)
    .single();

  if (submissionError || !submission) {
    throw new Error("No se encontro la postulacion para editar.");
  }

  const logo = optionalFile(formData.get("logo"));
  const coverImage = optionalFile(formData.get("coverImage"));
  const imageUpdates: Partial<BusinessSubmission> = {};

  if (logo) {
    const uploadedLogo = await uploadAdminImage({
      bucket: LOGO_BUCKET,
      file: logo,
      name: "logo",
      submissionId,
      supabase,
      businessName,
    });

    imageUpdates.logo_bucket = uploadedLogo.bucket;
    imageUpdates.logo_storage_path = uploadedLogo.path;
    imageUpdates.logo_url = null;
  }

  if (coverImage) {
    const uploadedCover = await uploadAdminImage({
      bucket: COVER_BUCKET,
      file: coverImage,
      name: "cover",
      submissionId,
      supabase,
      businessName,
    });

    imageUpdates.cover_image_bucket = uploadedCover.bucket;
    imageUpdates.cover_image_storage_path = uploadedCover.path;
    imageUpdates.cover_image_url = null;
  }

  const { error } = await supabase
    .from("business_submissions")
    .update({
      business_name: businessName,
      category_id: categoryId,
      owner_name: ownerName,
      owner_phone: ownerPhone || null,
      contact_name: contactName ?? null,
      phone: phone ?? null,
      whatsapp: whatsapp || null,
      email: email ?? null,
      description: description ?? null,
      full_description: fullDescription ?? null,
      instagram_url: instagramUrl,
      facebook_url: facebookUrl,
      tiktok_url: tiktokUrl,
      website_url: websiteUrl,
      address: cleanOptionalString(formData.get("address")) ?? null,
      neighborhood: cleanOptionalString(formData.get("neighborhood")) ?? null,
      maps_url: mapsUrl,
      schedule: cleanOptionalString(formData.get("schedule")) ?? null,
      products_or_services:
        cleanOptionalString(formData.get("productsOrServices")) ?? null,
      delivery_available: deliveryAvailable ?? null,
      payment_methods: cleanOptionalString(formData.get("paymentMethods")) ?? null,
      additional_notes:
        cleanOptionalString(formData.get("additionalNotes")) ?? null,
      accepts_publication: formData.get("acceptsPublication") === "on",
      logo_url: logoUrl,
      cover_image_url: coverImageUrl,
      notes: cleanOptionalString(formData.get("notes")) ?? null,
      ...imageUpdates,
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(`No se pudo guardar la postulacion: ${error.message}`);
  }

  revalidatePath("/admin/postulaciones");
}

export async function approveAndPublishSubmission(submissionId: string, notes: string) {
  const supabase = getRequiredSupabaseClient();
  const { data: submission, error: submissionError } = await supabase
    .from("business_submissions")
    .select(
      `
        id,
        business_name,
        category_id,
        owner_name,
        owner_phone,
        phone,
        whatsapp,
        description,
        full_description,
        instagram_url,
        facebook_url,
        tiktok_url,
        website_url,
        address,
        neighborhood,
        maps_url,
        schedule,
        logo_url,
        cover_image_url,
        logo_bucket,
        logo_storage_path,
        cover_image_bucket,
        cover_image_storage_path,
        email
      `,
    )
    .eq("id", submissionId)
    .single();

  if (submissionError || !submission) {
    throw new Error("No se encontro la postulacion para aprobar.");
  }

  if (!submission.category_id) {
    throw new Error("La postulacion no tiene categoria.");
  }

  const slug = await getAvailableBusinessSlug(submission.business_name);
  const address = [submission.address, submission.neighborhood]
    .filter(Boolean)
    .join(", ");
  const logoUrl =
    submission.logo_url ??
    getPublicStorageUrl(submission.logo_bucket, submission.logo_storage_path) ??
    DEFAULT_APPROVED_LOGO;
  const coverImageUrl =
    submission.cover_image_url ??
    getPublicStorageUrl(
      submission.cover_image_bucket,
      submission.cover_image_storage_path,
    ) ??
    DEFAULT_APPROVED_COVER_IMAGE;
  const ownerUser = await findAuthUserByEmail(submission.email);

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      category_id: submission.category_id,
      slug,
      name: submission.business_name,
      short_description: submission.description ?? "Comercio aliado de Pereira.",
      full_description: submission.full_description ?? submission.description,
      logo_url: logoUrl,
      cover_image_url: coverImageUrl,
      status: "open",
      phone: submission.phone,
      whatsapp: submission.whatsapp,
      address: address || null,
      maps_url: submission.maps_url,
      schedule: submission.schedule,
      published: true,
      publication_status: "published",
      verification_status: "unverified",
      onboarding_status: ownerUser ? "complete" : "profile_pending",
      owner_user_id: ownerUser?.id ?? null,
      published_at: new Date().toISOString(),
      created_by: ownerUser?.id ?? null,
      updated_by: ownerUser?.id ?? null,
      featured: false,
      verified: false,
    })
    .select("id")
    .single();

  if (businessError || !business) {
    throw new Error(`No se pudo publicar el comercio: ${businessError?.message}`);
  }

  const links = [
    ["instagram", submission.instagram_url],
    ["facebook", submission.facebook_url],
    ["tiktok", submission.tiktok_url],
    ["website", submission.website_url],
  ]
    .filter(([, url]) => typeof url === "string" && url.trim().length > 0)
    .map(([platform, url], index) => ({
      business_id: business.id,
      platform,
      url,
      sort_order: index,
    }));

  if (links.length > 0) {
    const { error: linksError } = await supabase
      .from("business_social_links")
      .insert(links);

    if (linksError) {
      throw new Error(`El comercio se creo, pero fallaron sus redes: ${linksError.message}`);
    }
  }

  const { error: memberError } = await supabase.from("business_members").insert({
    business_id: business.id,
    user_id: ownerUser?.id ?? null,
    invited_email: ownerUser ? null : normalizeEmail(submission.email),
    role: "owner",
    status: ownerUser ? "active" : "invited",
  });

  if (memberError) {
    throw new Error(
      `El comercio se creo, pero fallo la asignacion del propietario: ${memberError.message}`,
    );
  }

  await logBusinessAudit({
    action: "business_owner_assigned",
    actorUserId: ownerUser?.id ?? null,
    businessId: business.id,
    metadata: {
      invited: ownerUser ? false : true,
      invited_email: ownerUser ? null : normalizeEmail(submission.email),
      submission_id: submissionId,
    },
    supabase,
  });

  await updateSubmissionStatus(submissionId, "approved", notes);
  revalidatePath("/comercios");
  revalidatePath(`/comercios/${slug}`);
}

async function findAuthUserByEmail(email: string | null) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const supabase = getRequiredSupabaseClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`No se pudo validar el usuario propietario: ${error.message}`);
  }

  return (
    data.users.find((user) => user.email?.toLowerCase() === normalizedEmail) ??
    null
  );
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null;
}

function getPublicStorageUrl(bucket: string | null, path: string | null) {
  if (!bucket || !path) {
    return undefined;
  }

  const supabase = getRequiredSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

async function addSignedUrls(submission: BusinessSubmission) {
  const supabase = getRequiredSupabaseClient();

  return {
    ...submission,
    signedLogoUrl: (await createSignedUrl(
      submission.logo_bucket,
      submission.logo_storage_path,
    )) ?? submission.logo_url ?? undefined,
    signedCoverImageUrl: (await createSignedUrl(
      submission.cover_image_bucket,
      submission.cover_image_storage_path,
    )) ?? submission.cover_image_url ?? undefined,
  };

  async function createSignedUrl(bucket: string | null, path: string | null) {
    if (!bucket || !path) {
      return undefined;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

    if (error) {
      console.error("Supabase signed URL failed", error);
      return undefined;
    }

    return data.signedUrl;
  }
}

async function getAvailableBusinessSlug(name: string) {
  const supabase = getRequiredSupabaseClient();
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo validar el slug: ${error.message}`);
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `comercio-${Date.now()}`;
}

function getRequiredFormString(formData: FormData, key: string) {
  const value = cleanRequiredString(formData.get(key));

  if (!value) {
    throw new Error(`${key} es obligatorio.`);
  }

  return value;
}

function cleanRequiredString(value: unknown) {
  if (value instanceof File) {
    return "";
  }

  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalString(value: unknown) {
  if (value instanceof File) {
    return undefined;
  }

  return typeof value === "string" ? value.trim() || undefined : undefined;
}

function cleanPhoneLike(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function normalizeOptionalUrl(value: string | undefined, field: string) {
  if (!value) {
    return null;
  }

  const normalized = normalizeHttpsUrl(value);

  if (!isHttpsUrl(normalized)) {
    throw new Error(`${field} debe ser una URL https valida.`);
  }

  return normalized;
}

function normalizeHttpsUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value.replace(/^http:\/\//i, "https://");
  }

  return `https://${value.replace(/^\/+/, "")}`;
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

async function uploadAdminImage({
  bucket,
  businessName,
  file,
  name,
  submissionId,
  supabase,
}: {
  bucket: string;
  businessName: string;
  file: File;
  name: "logo" | "cover";
  submissionId: string;
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceRoleClient>>;
}) {
  const validation = validateImageFile(file, name);

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  if (!(await hasValidImageSignature(file))) {
    throw new Error(`El archivo ${name} no coincide con un tipo de imagen valido.`);
  }

  const path = `${getSubmissionImageFolder(
    businessName,
    submissionId,
  )}/${name}-${Date.now()}.${getImageExtension(file)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`No se pudo subir ${name}: ${error.message}`);
  }

  return { bucket, path };
}

function validateImageFile(file: File, name: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false as const,
      error: `${name} debe ser una imagen PNG, JPG, WebP, HEIC o HEIF.`,
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false as const,
      error: `${name} debe pesar 5 MB o menos.`,
    };
  }

  return { ok: true as const };
}

function optionalFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return undefined;
  }

  return value;
}

function getSubmissionImageFolder(businessName: string, submissionId: string) {
  return `${slugify(businessName)}-${submissionId.replace(/-/g, "").slice(0, 8)}`;
}

function getImageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/heic") {
    return "heic";
  }

  if (file.type === "image/heif") {
    return "heif";
  }

  return "jpg";
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  if (file.type === "image/heic" || file.type === "image/heif") {
    const brand = String.fromCharCode(...bytes.slice(4, 12));

    return (
      brand.startsWith("ftyp") &&
      ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].some((value) =>
        brand.includes(value),
      )
    );
  }

  return false;
}

function getRequiredSupabaseClient() {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service role no esta configurado.");
  }

  return supabase;
}

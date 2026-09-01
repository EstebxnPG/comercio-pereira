import "server-only";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

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

const DEFAULT_APPROVED_LOGO = "/brand/compra-en-pereira-logo.png";
const DEFAULT_APPROVED_COVER_IMAGE = "/brand/default-business-cover.svg";

export function getAdminToken() {
  return process.env.ADMIN_ACCESS_TOKEN ?? "";
}

export function isValidAdminToken(token: string | undefined) {
  const adminToken = getAdminToken();

  if (!adminToken || !token) {
    return false;
  }

  const expected = Buffer.from(adminToken);
  const received = Buffer.from(token);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export async function getBusinessSubmissions(status?: SubmissionStatus) {
  const supabase = getRequiredSupabaseClient();
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
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`No se pudieron cargar postulaciones: ${error.message}`);
  }

  return Promise.all((data ?? []).map(addSignedUrls));
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
        cover_image_url
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

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      category_id: submission.category_id,
      slug,
      name: submission.business_name,
      short_description: submission.description ?? "Comercio aliado de Pereira.",
      full_description: submission.full_description ?? submission.description,
      logo_url: submission.logo_url ?? DEFAULT_APPROVED_LOGO,
      cover_image_url: submission.cover_image_url ?? DEFAULT_APPROVED_COVER_IMAGE,
      status: "open",
      phone: submission.phone,
      whatsapp: submission.whatsapp,
      address: address || null,
      maps_url: submission.maps_url,
      schedule: submission.schedule,
      published: true,
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

  await updateSubmissionStatus(submissionId, "approved", notes);
  revalidatePath("/comercios");
}

async function addSignedUrls(submission: BusinessSubmission) {
  const supabase = getRequiredSupabaseClient();

  return {
    ...submission,
    signedLogoUrl: await createSignedUrl(
      submission.logo_bucket,
      submission.logo_storage_path,
    ),
    signedCoverImageUrl: await createSignedUrl(
      submission.cover_image_bucket,
      submission.cover_image_storage_path,
    ),
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

function getRequiredSupabaseClient() {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service role no esta configurado.");
  }

  return supabase;
}

import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

const LOGO_BUCKET =
  process.env.SUPABASE_BUSINESS_LOGOS_BUCKET ?? "business-logos";
const COVER_BUCKET =
  process.env.SUPABASE_BUSINESS_COVERS_BUCKET ?? "business-covers";
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const RATE_LIMIT_MAX_SUBMISSIONS = 100;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];
const ALLOWED_COVER_TYPES = ["image/png", "image/jpeg", "image/webp"];

type BusinessSubmissionPayload = {
  businessName: string;
  category: string;
  ownerName: string;
  ownerPhone: string;
  phone?: string;
  whatsapp: string;
  email?: string;
  description: string;
  fullDescription: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
  address?: string;
  neighborhood?: string;
  mapsUrl?: string;
  schedule?: string;
  deliveryAvailable?: "yes" | "no" | "pickup";
  paymentMethods?: string;
  additionalNotes?: string;
  acceptsPublication: boolean;
};

const MAX_LENGTHS = {
  businessName: 90,
  category: 80,
  ownerName: 90,
  ownerPhone: 15,
  phone: 30,
  whatsapp: 15,
  email: 120,
  description: 420,
  fullDescription: 1200,
  instagramUrl: 220,
  facebookUrl: 220,
  tiktokUrl: 220,
  websiteUrl: 220,
  address: 180,
  neighborhood: 80,
  mapsUrl: 260,
  schedule: 160,
  paymentMethods: 180,
  additionalNotes: 500,
} as const;

export async function POST(request: NextRequest) {
  try {
    return await handleBusinessSubmission(request);
  } catch (error) {
    console.error("Unexpected business submission failure", error);

    return NextResponse.json(
      { ok: false, error: "Business submission could not be processed" },
      { status: 500 },
    );
  }
}

async function handleBusinessSubmission(request: NextRequest) {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const rateLimit = await checkSubmissionRateLimit(request, supabase);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: rateLimit.error },
      { status: rateLimit.status },
    );
  }

  let body: FormData;

  try {
    body = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form body" },
      { status: 400 },
    );
  }

  const parsed = parseSubmission(body);

  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    );
  }

  const logo = optionalFile(body.get("logo"));
  const coverImage = optionalFile(body.get("coverImage"));

  if (!logo) {
    return NextResponse.json(
      { ok: false, error: "Logo image is required" },
      { status: 400 },
    );
  }

  const imageValidation = validateSubmissionImages({ coverImage, logo });

  if (!imageValidation.ok) {
    return NextResponse.json(
      { ok: false, error: imageValidation.error },
      { status: 400 },
    );
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", parsed.value.category)
    .maybeSingle();

  if (categoryError) {
    console.error("Supabase category lookup failed", categoryError);

    return NextResponse.json(
      { ok: false, error: "Category could not be verified" },
      { status: 500 },
    );
  }

  if (!category) {
    return NextResponse.json(
      { ok: false, error: "Selected category does not exist" },
      { status: 400 },
    );
  }

  const { data: submission, error } = await supabase
    .from("business_submissions")
    .insert({
    business_name: parsed.value.businessName,
    category_id: category.id,
    owner_name: parsed.value.ownerName,
    owner_phone: parsed.value.ownerPhone,
    contact_name: null,
    phone: parsed.value.phone ?? null,
    whatsapp: parsed.value.whatsapp,
    email: parsed.value.email ?? null,
    description: parsed.value.description,
    full_description: parsed.value.fullDescription ?? null,
    instagram_url: parsed.value.instagramUrl ?? null,
    facebook_url: parsed.value.facebookUrl ?? null,
    tiktok_url: parsed.value.tiktokUrl ?? null,
    website_url: parsed.value.websiteUrl ?? null,
    address: parsed.value.address ?? null,
    neighborhood: parsed.value.neighborhood ?? null,
    maps_url: parsed.value.mapsUrl ?? null,
    schedule: parsed.value.schedule ?? null,
    logo_url: null,
    cover_image_url: null,
    products_or_services: null,
    delivery_available: parsed.value.deliveryAvailable ?? null,
    payment_methods: parsed.value.paymentMethods ?? null,
    additional_notes: parsed.value.additionalNotes ?? null,
    accepts_publication: parsed.value.acceptsPublication,
    status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase business submission insert failed", error);

    return NextResponse.json(
      { ok: false, error: "Business submission could not be stored" },
      { status: 500 },
    );
  }

  const uploadResult = await uploadSubmissionImages({
    coverImage,
    logo,
    submissionId: submission.id,
    supabase,
  });

  if (!uploadResult.ok) {
    return NextResponse.json(
      { ok: false, error: uploadResult.error },
      { status: 500 },
    );
  }

  if (uploadResult.logo || uploadResult.coverImage) {
    const { error: imageUpdateError } = await supabase
      .from("business_submissions")
      .update({
        logo_bucket: uploadResult.logo?.bucket ?? null,
        logo_storage_path: uploadResult.logo?.path ?? null,
        cover_image_bucket: uploadResult.coverImage?.bucket ?? null,
        cover_image_storage_path: uploadResult.coverImage?.path ?? null,
      })
      .eq("id", submission.id);

    if (imageUpdateError) {
      console.error("Supabase submission image update failed", imageUpdateError);

      return NextResponse.json(
        { ok: false, error: "Business submission images could not be stored" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}

async function checkSubmissionRateLimit(
  request: NextRequest,
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceRoleClient>>,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const identifier = getRateLimitIdentifier(request);

  if (!identifier) {
    return {
      ok: false,
      error: "Request could not be verified. Please try again later.",
      status: 400,
    };
  }

  const { data, error } = await supabase.rpc(
    "increment_business_submission_rate_limit",
    {
      p_identifier: identifier,
      p_max_requests: RATE_LIMIT_MAX_SUBMISSIONS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    },
  );

  if (error) {
    console.error("Supabase submission rate limit failed", error);

    return {
      ok: false,
      error: "Submission could not be verified. Please try again later.",
      status: 503,
    };
  }

  if (data !== true) {
    return {
      ok: false,
      error: "Too many submissions. Please try again later.",
      status: 429,
    };
  }

  return { ok: true };
}

function getRateLimitIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim();

  if (!ip) {
    return "";
  }

  return createHmac("sha256", getRateLimitSecret())
    .update(ip)
    .digest("hex");
}

function getRateLimitSecret() {
  return (
    process.env.RATE_LIMIT_SECRET ||
    process.env.ADMIN_ACCESS_TOKEN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "local-development-rate-limit-secret"
  );
}

function parseSubmission(value: unknown):
  | { ok: true; value: BusinessSubmissionPayload }
  | { ok: false; error: string } {
  if (!(value instanceof FormData)) {
    return { ok: false, error: "Invalid submission payload" };
  }

  const payload = value;
  const businessName = cleanRequiredString(payload.get("businessName"));
  const category = cleanRequiredString(payload.get("category"));
  const ownerName = cleanRequiredString(payload.get("ownerName"));
  const ownerPhone = cleanPhoneLike(payload.get("ownerPhone"));
  const whatsapp = cleanPhoneLike(payload.get("whatsapp"));
  const description = cleanRequiredString(payload.get("description"));
  const fullDescription = cleanRequiredString(payload.get("fullDescription"));
  const acceptsPublication = payload.get("acceptsPublication") === "true";

  if (!businessName) {
    return { ok: false, error: "Business name is required" };
  }

  if (!category) {
    return { ok: false, error: "Category is required" };
  }

  if (!ownerName) {
    return { ok: false, error: "Owner name is required" };
  }

  if (!ownerPhone || !/^\d{10,15}$/.test(ownerPhone)) {
    return {
      ok: false,
      error: "Owner phone must include country code and digits only",
    };
  }

  if (!whatsapp || !/^\d{10,15}$/.test(whatsapp)) {
    return {
      ok: false,
      error: "WhatsApp must include country code and digits only",
    };
  }

  if (!description) {
    return { ok: false, error: "Description is required" };
  }

  if (!fullDescription) {
    return { ok: false, error: "Full description is required" };
  }

  if (!acceptsPublication) {
    return { ok: false, error: "Publication authorization is required" };
  }

  const submission: BusinessSubmissionPayload = {
    businessName,
    category,
    ownerName,
    ownerPhone,
    whatsapp,
    description,
    fullDescription,
    acceptsPublication,
  };

  for (const key of [
    "phone",
    "email",
    "instagramUrl",
    "facebookUrl",
    "tiktokUrl",
    "websiteUrl",
    "address",
    "neighborhood",
    "mapsUrl",
    "schedule",
    "paymentMethods",
    "additionalNotes",
  ] as const) {
    const cleaned = cleanOptionalString(payload.get(key));

    if (cleaned) {
      submission[key] =
        key === "phone"
          ? cleanPhoneLike(cleaned)
          : normalizeSubmissionField(key, cleaned);
    }
  }

  for (const [key, maxLength] of Object.entries(MAX_LENGTHS)) {
    const field = key as keyof BusinessSubmissionPayload;
    const fieldValue = submission[field];

    if (typeof fieldValue === "string" && fieldValue.length > maxLength) {
      return {
        ok: false,
        error: `${field} is longer than the allowed limit`,
      };
    }
  }

  if (submission.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    return { ok: false, error: "Email is invalid" };
  }

  const deliveryAvailable = cleanOptionalString(payload.get("deliveryAvailable"));

  if (deliveryAvailable) {
    if (!["yes", "no", "pickup"].includes(deliveryAvailable)) {
      return { ok: false, error: "Delivery option is invalid" };
    }

    submission.deliveryAvailable =
      deliveryAvailable as BusinessSubmissionPayload["deliveryAvailable"];
  }

  for (const field of [
    "instagramUrl",
    "facebookUrl",
    "tiktokUrl",
    "websiteUrl",
    "mapsUrl",
  ] as const) {
    const url = submission[field];

    if (url && !isHttpsUrl(url)) {
      return { ok: false, error: `${field} must be a valid https URL` };
    }
  }

  return { ok: true, value: submission };
}

function normalizeSubmissionField(
  key: keyof BusinessSubmissionPayload,
  value: string,
) {
  if (key === "instagramUrl") {
    return normalizeSocialUrl("instagram", value);
  }

  if (key === "facebookUrl") {
    return normalizeSocialUrl("facebook", value);
  }

  if (key === "tiktokUrl") {
    return normalizeTikTokUrl(value);
  }

  if (key === "mapsUrl" || key === "websiteUrl") {
    return normalizeHttpsUrl(value);
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

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeSocialUrl(platform: "instagram" | "facebook", value: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    return cleaned;
  }

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned.replace(/^http:\/\//i, "https://");
  }

  const host = platform === "instagram" ? "instagram.com" : "facebook.com";
  const username = cleaned
    .replace(/^@/, "")
    .replace(/^www\./i, "")
    .replace(new RegExp(`^${host}/`, "i"), "")
    .replace(/^\/+|\/+$/g, "");

  return username ? `https://www.${host}/${username}` : cleaned;
}

function normalizeTikTokUrl(value: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    return cleaned;
  }

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned.replace(/^http:\/\//i, "https://");
  }

  const username = cleaned
    .replace(/^@/, "")
    .replace(/^www\./i, "")
    .replace(/^tiktok\.com\/@?/i, "")
    .replace(/^\/+|\/+$/g, "");

  return username ? `https://www.tiktok.com/@${username}` : cleaned;
}

function normalizeHttpsUrl(value: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    return cleaned;
  }

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned.replace(/^http:\/\//i, "https://");
  }

  return `https://${cleaned.replace(/^\/+/, "")}`;
}

async function uploadSubmissionImages({
  coverImage,
  logo,
  submissionId,
  supabase,
}: {
  coverImage?: File;
  logo?: File;
  submissionId: string;
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceRoleClient>>;
}): Promise<
  | {
      ok: true;
      coverImage: UploadedImage | null;
      logo: UploadedImage | null;
    }
  | { ok: false; error: string }
> {
  const logoResult = logo
    ? await uploadImage({
        allowedTypes: ALLOWED_LOGO_TYPES,
        bucket: LOGO_BUCKET,
        file: logo,
        folder: submissionId,
        name: "logo",
        supabase,
      })
    : { ok: true as const, image: null };

  if (!logoResult.ok) {
    return { ok: false, error: logoResult.error };
  }

  const coverResult = coverImage
    ? await uploadImage({
        allowedTypes: ALLOWED_COVER_TYPES,
        bucket: COVER_BUCKET,
        file: coverImage,
        folder: submissionId,
        name: "cover",
        supabase,
      })
    : { ok: true as const, image: null };

  if (!coverResult.ok) {
    return { ok: false, error: coverResult.error };
  }

  return {
    ok: true,
    coverImage: coverResult.image,
    logo: logoResult.image,
  };
}

function validateSubmissionImages({
  coverImage,
  logo,
}: {
  coverImage?: File;
  logo?: File;
}) {
  if (logo) {
    const logoValidation = validateImageFile({
      allowedTypes: ALLOWED_LOGO_TYPES,
      file: logo,
      name: "logo",
    });

    if (!logoValidation.ok) {
      return logoValidation;
    }
  }

  if (coverImage) {
    const coverValidation = validateImageFile({
      allowedTypes: ALLOWED_COVER_TYPES,
      file: coverImage,
      name: "cover",
    });

    if (!coverValidation.ok) {
      return coverValidation;
    }
  }

  return { ok: true as const };
}

type UploadedImage = {
  bucket: string;
  path: string;
};

async function uploadImage({
  allowedTypes,
  bucket,
  file,
  folder,
  name,
  supabase,
}: {
  allowedTypes: string[];
  bucket: string;
  file: File;
  folder: string;
  name: string;
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceRoleClient>>;
}): Promise<
  { ok: true; image: UploadedImage } | { ok: false; error: string }
> {
  const validation = validateImageFile({ allowedTypes, file, name });

  if (!validation.ok) {
    return validation;
  }

  if (!(await hasValidImageSignature(file))) {
    return {
      ok: false,
      error: `${name} image content does not match an allowed image type`,
    };
  }

  const extension = getImageExtension(file);
  const path = `${folder}/${name}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error(`Supabase ${name} upload failed`, error);

    return {
      ok: false,
      error: `${name} image could not be uploaded`,
    };
  }

  return { ok: true, image: { bucket, path } };
}

function validateImageFile({
  allowedTypes,
  file,
  name,
}: {
  allowedTypes: string[];
  file: File;
  name: string;
}): { ok: true } | { ok: false; error: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      ok: false,
      error: `${name} must be a PNG, JPG or WebP image`,
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `${name} image must be 3 MB or less`,
    };
  }

  return { ok: true };
}

function optionalFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return undefined;
  }

  return value;
}

function getImageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
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

  return false;
}

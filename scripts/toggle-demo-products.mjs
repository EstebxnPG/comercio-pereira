#!/usr/bin/env node
// Quick on/off switch for the demo products created by
// scripts/seed-product-catalog.mjs. Every product that script creates
// gets a row in product_category_links, so that table is the source of
// truth for "which products are demo data" -- no separate tracking file
// needed.
//
// Usage:
//   node scripts/toggle-demo-products.mjs publish     # make them all visible on the live site
//   node scripts/toggle-demo-products.mjs unpublish   # send them all back to draft (invisible)
//   node scripts/toggle-demo-products.mjs status      # just report counts, no changes

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
for (const line of envText.split("\n")) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match) process.env[match[1]] ??= match[2];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const mode = process.argv[2];

if (!["publish", "unpublish", "status"].includes(mode)) {
  console.error("Usage: node scripts/toggle-demo-products.mjs <publish|unpublish|status>");
  process.exit(1);
}

async function main() {
  const { data: links, error: linksError } = await supabase
    .from("product_category_links")
    .select("product_id");

  if (linksError) {
    throw new Error(`product_category_links query failed: ${linksError.message}`);
  }

  const productIds = [...new Set(links.map((row) => row.product_id))];
  console.log(`Found ${productIds.length} demo products (via product_category_links).`);

  if (productIds.length === 0) {
    return;
  }

  if (mode === "status") {
    const { data, error } = await supabase
      .from("products")
      .select("status")
      .in("id", productIds);

    if (error) {
      throw new Error(`status query failed: ${error.message}`);
    }

    const counts = data.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {});
    console.log("Status breakdown:", counts);
    return;
  }

  const update =
    mode === "publish"
      ? {
          status: "published",
          moderation_status: "approved",
          published_at: new Date().toISOString(),
          rejection_reason: null,
        }
      : {
          status: "draft",
          moderation_status: "draft",
          published_at: null,
        };

  const { error, count } = await supabase
    .from("products")
    .update(update, { count: "exact" })
    .in("id", productIds);

  if (error) {
    throw new Error(`update failed: ${error.message}`);
  }

  console.log(`${mode === "publish" ? "Published" : "Unpublished"} ${count} demo products.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

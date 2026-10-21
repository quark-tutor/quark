"use server";

import { refresh } from "next/cache";
import { audit } from "@/lib/audit";
import { requireGuardian } from "@/lib/guardian";
import { createAdminClient } from "@/lib/supabase/admin";

// Approve or reject one outside content item (docs/04). Any guardian may do either. content_items
// is written only by the server, so these use the service-role client after checking the guardian.
// A rejected item stays rejected: it is never approved again and never shown to a child.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function decide(id: string, action: "content.approve" | "content.reject") {
  const guardian = await requireGuardian();
  if (!guardian || !UUID.test(id)) return;

  const change =
    action === "content.approve"
      ? { approved: true, approved_how: "guardian", approved_by: guardian.id }
      : { approved: false, approved_how: null, rejected_at: new Date().toISOString(), rejected_by: guardian.id };
  const { data, error } = await createAdminClient()
    .from("content_items")
    .update(change)
    .eq("id", id)
    .is("rejected_at", null)
    .select("title")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return; // already rejected, or gone

  await audit(guardian, action, { content_item_id: id, title: data.title });
  refresh();
}

export async function approveItem(id: string) {
  await decide(id, "content.approve");
}

export async function rejectItem(id: string) {
  await decide(id, "content.reject");
}

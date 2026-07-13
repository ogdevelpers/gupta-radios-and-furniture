"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import {
  clearStaffSession,
  getStaffSession,
  setStaffSession,
} from "@/lib/auth/session";
import type { ComplaintInsert } from "@/types/complaint";

export type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function loginStaff(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("logins")
    .select("id, email, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data || data.password !== password) {
    return { error: "Invalid email or password." };
  }

  await setStaffSession(data.id);
  redirect("/complaints/dashboard");
}

export async function logoutStaff() {
  await clearStaffSession();
  redirect("/login");
}

export async function registerComplaint(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await getStaffSession();
  if (!staff) {
    return { error: "You must be logged in to register a complaint." };
  }

  const warranty = String(formData.get("warranty_status") ?? "");
  if (warranty !== "in_warranty" && warranty !== "out_warranty") {
    return { error: "Please select a warranty status." };
  }

  const payload: ComplaintInsert = {
    customer_name: String(formData.get("customer_name") ?? "").trim(),
    customer_number: String(formData.get("customer_number") ?? "").trim(),
    product_name: String(formData.get("product_name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    product_serial_number: String(
      formData.get("product_serial_number") ?? "",
    ).trim(),
    issue_message: String(formData.get("issue_message") ?? "").trim(),
    warranty_status: warranty,
    created_by: staff.id,
  };

  if (
    !payload.customer_name ||
    !payload.customer_number ||
    !payload.product_name ||
    !payload.address ||
    !payload.product_serial_number ||
    !payload.issue_message
  ) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = createServiceClient();

  // Confirm staff still exists in logins before insert (avoids FK errors)
  const { data: loginRow } = await supabase
    .from("logins")
    .select("id")
    .eq("id", staff.id)
    .maybeSingle();

  if (!loginRow) {
    await clearStaffSession();
    return { error: "Your session is invalid. Please sign in again." };
  }

  const { error } = await supabase.from("complaints").insert(payload);

  if (error) {
    if (error.message.includes("complaints_created_by_fkey")) {
      return {
        error:
          "Database setup issue: run supabase/fix-created-by-fk.sql in the Supabase SQL Editor.",
      };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function markComplaintResolved(
  complaintId: string,
): Promise<ActionResult> {
  const staff = await getStaffSession();
  if (!staff) {
    return { error: "You must be logged in." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("complaints")
    .update({ status: "resolved" })
    .eq("id", complaintId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

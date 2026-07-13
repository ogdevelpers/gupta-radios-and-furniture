import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

export const STAFF_SESSION_COOKIE = "grf_staff_session";

export type StaffSession = {
  id: string;
  email: string;
  full_name: string;
};

export async function setStaffSession(staffId: string) {
  const cookieStore = await cookies();
  cookieStore.set(STAFF_SESSION_COOKIE, staffId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearStaffSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_SESSION_COOKIE);
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies();
  const staffId = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  if (!staffId) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("logins")
    .select("id, email, full_name")
    .eq("id", staffId)
    .maybeSingle();

  if (error || !data) return null;
  return data as StaffSession;
}

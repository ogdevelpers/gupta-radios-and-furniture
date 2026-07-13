import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/session";

export default async function ComplaintsIndexPage() {
  const staff = await getStaffSession();
  redirect(staff ? "/complaints/dashboard" : "/login");
}

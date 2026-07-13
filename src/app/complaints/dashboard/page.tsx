import { redirect } from "next/navigation";
import { ComplaintsDashboard } from "@/components/ComplaintsDashboard";
import { getStaffSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/service";
import type { Complaint, ComplaintStats } from "@/types/complaint";

export const runtime = "edge";

export default async function ComplaintsDashboardPage() {
  const staff = await getStaffSession();
  if (!staff) {
    redirect("/login");
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });

  const complaints = (error ? [] : data ?? []) as Complaint[];

  const stats: ComplaintStats = {
    total: complaints.length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    pending: complaints.filter((c) => c.status === "pending").length,
  };

  return (
    <main className="dashboard-page">
      <ComplaintsDashboard
        stats={stats}
        complaints={complaints}
        staffEmail={staff.full_name || staff.email}
      />
    </main>
  );
}

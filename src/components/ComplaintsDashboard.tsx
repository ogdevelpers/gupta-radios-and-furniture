"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ComplaintForm } from "@/components/ComplaintForm";
import { ComplaintDetail } from "@/components/ComplaintDetail";
import { logoutStaff, markComplaintResolved } from "@/app/complaints/actions";
import type {
  Complaint,
  ComplaintStats,
  ComplaintStatus,
} from "@/types/complaint";

type StatusFilter = "all" | ComplaintStatus;

type ComplaintsDashboardProps = {
  stats: ComplaintStats;
  complaints: Complaint[];
  staffEmail: string;
};

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
];

export function ComplaintsDashboard({
  stats,
  complaints,
  staffEmail,
}: ComplaintsDashboardProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredComplaints = useMemo(() => {
    if (statusFilter === "all") return complaints;
    return complaints.filter((complaint) => complaint.status === statusFilter);
  }, [complaints, statusFilter]);

  function resolveComplaint(id: string) {
    startTransition(async () => {
      await markComplaintResolved(id);
      setSelected((current) =>
        current?.id === id ? { ...current, status: "resolved" } : current,
      );
      router.refresh();
    });
  }

  return (
    <div className="dashboard">
      <header className="dashboard-top">
        <div>
          <p className="brand-mark">Gupta Radios & Furniture</p>
          <h1>Complaints desk</h1>
          <p className="dashboard-sub">
            Track service requests and register new customer complaints.
          </p>
        </div>
        <div className="dashboard-top-actions">
          <p className="staff-chip">{staffEmail}</p>
          <form action={logoutStaff}>
            <button type="submit" className="btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="dashboard-toolbar">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setFormOpen(true)}
        >
          Register a new complaint
        </button>
      </div>

      <section className="stats-grid" aria-label="Complaint summary">
        <button
          type="button"
          className={`stat-tile${statusFilter === "all" ? " stat-tile-active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <p className="stat-label">Total complaints</p>
          <p className="stat-value">{stats.total}</p>
        </button>
        <button
          type="button"
          className={`stat-tile stat-resolved${statusFilter === "resolved" ? " stat-tile-active" : ""}`}
          onClick={() => setStatusFilter("resolved")}
        >
          <p className="stat-label">Resolved complaints</p>
          <p className="stat-value">{stats.resolved}</p>
        </button>
        <button
          type="button"
          className={`stat-tile stat-pending${statusFilter === "pending" ? " stat-tile-active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          <p className="stat-label">Pending complaints</p>
          <p className="stat-value">{stats.pending}</p>
        </button>
      </section>

      <section className="recent-section">
        <div className="recent-header recent-header-row">
          <div>
            <h2>Recent complaints</h2>
            <p>Click a complaint to view full details.</p>
          </div>
          <div
            className="status-filter"
            role="group"
            aria-label="Filter by status"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  statusFilter === filter.value
                    ? "status-filter-btn status-filter-btn-active"
                    : "status-filter-btn"
                }
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
                <span className="status-filter-count">
                  {filter.value === "all"
                    ? stats.total
                    : filter.value === "pending"
                      ? stats.pending
                      : stats.resolved}
                </span>
              </button>
            ))}
          </div>
        </div>

        {complaints.length === 0 ? (
          <p className="empty-state">
            No complaints yet. Register the first one to get started.
          </p>
        ) : filteredComplaints.length === 0 ? (
          <p className="empty-state">No {statusFilter} complaints to show.</p>
        ) : (
          <ul className="complaint-list">
            {filteredComplaints.map((complaint) => (
              <li key={complaint.id}>
                <button
                  type="button"
                  className="complaint-row complaint-row-button"
                  onClick={() => setSelected(complaint)}
                >
                  <div className="complaint-row-main">
                    <p className="complaint-name">{complaint.customer_name}</p>
                    <p className="complaint-meta">
                      {complaint.product_name} · {complaint.customer_number}
                    </p>
                    <p className="complaint-meta">
                      S/N {complaint.product_serial_number} ·{" "}
                      {complaint.warranty_status === "in_warranty"
                        ? "In warranty"
                        : "Out of warranty"}
                    </p>
                    {complaint.issue_message ? (
                      <p className="complaint-meta complaint-issue">
                        {complaint.issue_message}
                      </p>
                    ) : null}
                  </div>
                  <div className="complaint-row-actions">
                    <span
                      className={
                        complaint.status === "resolved"
                          ? "status-pill status-resolved"
                          : "status-pill status-pending"
                      }
                    >
                      {complaint.status}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ComplaintForm open={formOpen} onClose={() => setFormOpen(false)} />
      <ComplaintDetail
        complaint={selected}
        onClose={() => setSelected(null)}
        onResolve={resolveComplaint}
        resolving={isPending}
      />
    </div>
  );
}

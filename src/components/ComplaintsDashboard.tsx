"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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

const PAGE_SIZE = 10;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredComplaints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return complaints.filter((complaint) => {
      if (statusFilter !== "all" && complaint.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return (
        complaint.customer_name.toLowerCase().includes(query) ||
        complaint.product_serial_number.toLowerCase().includes(query)
      );
    });
  }, [complaints, searchQuery, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredComplaints.length / PAGE_SIZE),
  );

  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredComplaints.slice(start, start + PAGE_SIZE);
  }, [filteredComplaints, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

        <label className="dashboard-search">
          <span className="visually-hidden">
            Search by customer name or serial number
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by customer name or serial number…"
            autoComplete="off"
          />
        </label>

        {complaints.length === 0 ? (
          <p className="empty-state">
            No complaints yet. Register the first one to get started.
          </p>
        ) : filteredComplaints.length === 0 ? (
          <p className="empty-state">
            {searchQuery.trim()
              ? "No complaints match your search."
              : `No ${statusFilter} complaints to show.`}
          </p>
        ) : (
          <>
            <ul className="complaint-list">
              {paginatedComplaints.map((complaint) => (
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

            {filteredComplaints.length > PAGE_SIZE ? (
              <nav className="pagination" aria-label="Complaint pages">
                <p className="pagination-summary">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filteredComplaints.length)} of{" "}
                  {filteredComplaints.length}
                </p>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="btn-ghost pagination-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-page">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </nav>
            ) : null}
          </>
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

"use client";

import { useEffect, useRef } from "react";
import type { Complaint } from "@/types/complaint";

type ComplaintDetailProps = {
  complaint: Complaint | null;
  onClose: () => void;
  onResolve?: (id: string) => void;
  resolving?: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ComplaintDetail({
  complaint,
  onClose,
  onResolve,
  resolving = false,
}: ComplaintDetailProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (complaint && !dialog.open) {
      dialog.showModal();
    } else if (!complaint && dialog.open) {
      dialog.close();
    }
  }, [complaint]);

  if (!complaint) return null;

  return (
    <dialog
      ref={dialogRef}
      className="complaint-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="complaint-dialog-panel">
        <header className="complaint-dialog-header">
          <div>
            <p className="section-kicker">Complaint detail</p>
            <h2>{complaint.customer_name}</h2>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close detail"
          >
            Close
          </button>
        </header>

        <dl className="detail-grid">
          <div className="detail-item">
            <dt>Status</dt>
            <dd>
              <span
                className={
                  complaint.status === "resolved"
                    ? "status-pill status-resolved"
                    : "status-pill status-pending"
                }
              >
                {complaint.status}
              </span>
            </dd>
          </div>

          <div className="detail-item">
            <dt>Customer number</dt>
            <dd>{complaint.customer_number}</dd>
          </div>

          <div className="detail-item">
            <dt>Product name</dt>
            <dd>{complaint.product_name}</dd>
          </div>

          <div className="detail-item">
            <dt>Product serial number</dt>
            <dd>{complaint.product_serial_number}</dd>
          </div>

          <div className="detail-item detail-item-full">
            <dt>Address</dt>
            <dd>{complaint.address}</dd>
          </div>

          <div className="detail-item detail-item-full">
            <dt>Issue with the product</dt>
            <dd>{complaint.issue_message || "—"}</dd>
          </div>

          <div className="detail-item detail-item-full">
            <dt>Invoice</dt>
            <dd>
              {complaint.invoice_url ? (
                <a
                  href={complaint.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-link"
                >
                  View uploaded invoice
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>

          <div className="detail-item">
            <dt>Warranty</dt>
            <dd>
              {complaint.warranty_status === "in_warranty"
                ? "In warranty"
                : "Out of warranty"}
            </dd>
          </div>

          <div className="detail-item">
            <dt>Registered on</dt>
            <dd>{formatDate(complaint.created_at)}</dd>
          </div>

          <div className="detail-item">
            <dt>Last updated</dt>
            <dd>{formatDate(complaint.updated_at)}</dd>
          </div>
        </dl>

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
          {complaint.status === "pending" && onResolve ? (
            <button
              type="button"
              className="btn-primary"
              disabled={resolving}
              onClick={() => onResolve(complaint.id)}
            >
              {resolving ? "Updating…" : "Mark resolved"}
            </button>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

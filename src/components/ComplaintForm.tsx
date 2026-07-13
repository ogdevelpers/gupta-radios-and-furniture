"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  registerComplaint,
  type ActionResult,
} from "@/app/complaints/actions";

const initialState: ActionResult = {};

type ComplaintFormProps = {
  open: boolean;
  onClose: () => void;
};

function ComplaintFormInner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    registerComplaint,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onClose();
      router.refresh();
    }
  }, [state.success, onClose, router]);

  return (
    <form action={formAction} className="complaint-form">
      <label className="field">
        <span>Customer name</span>
        <input type="text" name="customer_name" required />
      </label>

      <label className="field">
        <span>Customer number</span>
        <input
          type="tel"
          name="customer_number"
          required
          placeholder="10-digit mobile"
        />
      </label>

      <label className="field">
        <span>Product name</span>
        <input type="text" name="product_name" required />
      </label>

      <label className="field field-full">
        <span>Address</span>
        <textarea name="address" rows={3} required />
      </label>

      <label className="field">
        <span>Product serial number</span>
        <input type="text" name="product_serial_number" required />
      </label>

      <div className="field">
        <span id="warranty-label">Warranty</span>
        <div
          className="warranty-options"
          role="radiogroup"
          aria-labelledby="warranty-label"
        >
          <label className="radio-option">
            <input
              type="radio"
              name="warranty_status"
              value="in_warranty"
              required
              defaultChecked
            />
            <span>In warranty</span>
          </label>
          <label className="radio-option">
            <input type="radio" name="warranty_status" value="out_warranty" />
            <span>Out of warranty</span>
          </label>
        </div>
      </div>

      <label className="field field-full">
        <span>Issue with the product</span>
        <textarea
          name="issue_message"
          rows={4}
          required
          placeholder="Describe the problem the customer is facing…"
        />
      </label>

      {state.error ? (
        <p className="form-error field-full" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="form-actions field-full">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Submit complaint"}
        </button>
      </div>
    </form>
  );
}

export function ComplaintForm({ open, onClose }: ComplaintFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

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
            <p className="section-kicker">New entry</p>
            <h2>Register complaint</h2>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close form"
          >
            Close
          </button>
        </header>

        {/* Remount on each open so action state resets after a successful submit */}
        <ComplaintFormInner key={String(open)} onClose={onClose} />
      </div>
    </dialog>
  );
}

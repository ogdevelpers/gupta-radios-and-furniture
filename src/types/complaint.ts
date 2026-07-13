export type WarrantyStatus = "in_warranty" | "out_warranty";
export type ComplaintStatus = "pending" | "resolved";

export type Complaint = {
  id: string;
  customer_name: string;
  customer_number: string;
  product_name: string;
  address: string;
  product_serial_number: string;
  issue_message: string;
  warranty_status: WarrantyStatus;
  status: ComplaintStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ComplaintInsert = {
  customer_name: string;
  customer_number: string;
  product_name: string;
  address: string;
  product_serial_number: string;
  issue_message: string;
  warranty_status: WarrantyStatus;
  created_by: string;
};

export type ComplaintStats = {
  total: number;
  resolved: number;
  pending: number;
};

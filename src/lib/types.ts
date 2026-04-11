export type SpaceStatus = "open" | "occupied";

export type SessionStatus =
  | "active"
  | "paid"
  | "violation"
  | "completed"
  | "exited";

export type PaymentStatus = "pending" | "paid" | "failed";

export type ViolationType = "unpaid" | "expired";

export interface Space {
  id: number;
  label: string;
  status: SpaceStatus;
}

export interface Session {
  id: string;
  space_id: number;
  plate: string;
  entered_at: string;
  exited_at: string | null;
  payment_id: string | null;
  status: SessionStatus;
  plate_image_url: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  session_id: string;
  stripe_session_id: string;
  amount_cents: number;
  status: PaymentStatus;
  phone: string | null;
  created_at: string;
}

export interface Violation {
  id: string;
  session_id: string;
  type: ViolationType;
  alerted_at: string | null;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PricingRule {
  id: string;
  day_type: "weekday" | "weekend";
  rate_cents: number;
  enforce_start: string; // "08:00"
  enforce_end: string; // "20:00" or "22:00"
}

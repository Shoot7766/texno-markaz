// ==========================================
// DATABASE TYPES (Supabase bilan mos)
// ==========================================

export type LeadStatus =
  | "yangi"
  | "korib_chiqilmoqda"
  | "boglanildi"
  | "tasdiqlandi"
  | "rad_etildi"
  | "oquvchiga_aylantirildi";

export type StudentStatus = "active" | "finished" | "paused";
export type AttendanceStatus = "keldi" | "kelmadi" | "kechikdi";
export type PaymentMethod = "naqd" | "karta" | "online";
export type SourceType = "instagram" | "telegram" | "tanish" | "maktab" | "boshqa";
export type PaymentStatus = "tolangan" | "qarz" | "qisman";

export interface Course {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  level: string | null;
  for_who: string[] | null;
  features: string[] | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number;
  bonus: string;
  is_recommended: boolean;
  is_active: boolean;
  course_ids: string[];
  sort_order: number;
  created_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  age: number | null;
  course_or_package: string;
  preferred_time: string | null;
  source: SourceType;
  comment: string | null;
  status: LeadStatus;
  admin_note: string | null;
  visitor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  lead_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  parent_phone: string | null;
  course_id: string;
  package_id: string | null;
  group_id: string | null;
  start_date: string;
  end_date: string | null;
  status: StudentStatus;
  total_amount: number;
  paid_amount: number;
  discount: number;
  payment_status: PaymentStatus;
  payment_due_date: string | null;
  comment: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  course_id: string | null;
  teacher: string | null;
  schedule: string | null;
  max_students: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  group_id: string | null;
  attendance_date: string;
  status: AttendanceStatus;
  note: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  note: string | null;
  created_at: string;
}

export interface Visitor {
  id: string;
  visitor_id: string;
  page_path: string;
  referrer_path: string | null;
  package_slug: string | null;
  course_slug: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  submitted_lead: boolean;
  created_at: string;
}

export interface Settings {
  id: string;
  center_name: string;
  phone: string;
  telegram: string;
  instagram: string;
  address: string;
  logo_url: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

export interface PublicStats {
  id: string;
  students_count: number;
  graduated_count: number;
  employed_count: number;
  applications_count: number;
  active_students_count: number;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

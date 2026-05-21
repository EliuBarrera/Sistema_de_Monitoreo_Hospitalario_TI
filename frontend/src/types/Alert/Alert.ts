import type { AlertSeverity } from "@/types/Alert/AlertSeverity";

export interface Alert {
  id:          number;
  device_id:   number;
  severity_id: number | null;
  message:     string;
  status:      "activa" | "resuelta" | "ignorada";
  created_at:  string | null;
  resolved_at: string | null;
  severity?:   AlertSeverity | null;
}
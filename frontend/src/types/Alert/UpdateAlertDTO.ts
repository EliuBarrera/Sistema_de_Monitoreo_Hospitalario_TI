export interface UpdateAlertDTO {
  severity_id?: number | null;
  message?:     string;
  status?:      "activa" | "resuelta" | "ignorada";
  resolved_at?: string | null;
}
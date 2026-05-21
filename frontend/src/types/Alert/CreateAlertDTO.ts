export interface CreateAlertDTO {
  device_id:   number;
  severity_id?: number | null;
  message:     string;
  status?:     "activa" | "resuelta" | "ignorada";
}
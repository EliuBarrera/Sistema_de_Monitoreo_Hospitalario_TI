export interface Metric {
  id:          number;
  device_id:   number | null;
  patient_id:  number | null;
  metric_type: string;
  value:       number;
  unit:        string | null;
  timestamp:   string | null;
  created_at:  string | null;
  updated_at:  string | null;
}
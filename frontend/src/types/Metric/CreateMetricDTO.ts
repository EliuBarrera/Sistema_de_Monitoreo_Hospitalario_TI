export interface CreateMetricDTO {
  device_id:   number;
  metric_type: string;
  value:       number;
  unit?:       string | null;
  timestamp?:  string | null;
}
export interface UpdateMetricDTO {
  metric_type?: string;
  value?:       number;
  unit?:        string | null;
  timestamp?:   string | null;
}
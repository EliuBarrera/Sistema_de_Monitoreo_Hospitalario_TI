export interface UpdateDeviceDTO {
  name?:           string;
  serial_number?:  string;
  status?:         "active" | "inactive" | "maintenance";
  location_id?:    number | null;
  ip_address?:     string | null;
  device_type_id?: number | null;
}
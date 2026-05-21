import type { Location } from "@/types/Location/Location";
import type { DeviceType } from "@/types/Device/DeviceType/DeviceType";

export interface Device {
  id: number;
  name: string;
  serial_number: string;
  status: "active" | "inactive" | "maintenance";
  location_id: number | null;
  ip_address: string | null;
  device_type_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  // Campos enriquecidos por el API Gateway
  location?: Location | null;
  device_type?: DeviceType | null;
}
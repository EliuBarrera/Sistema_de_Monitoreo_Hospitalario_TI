export interface CreateLocationDTO {
  name: string;
  building: string;
  floor?: number | null;
  room?: string | null;
  description: string;
  parent_location_id?: number | null;
}
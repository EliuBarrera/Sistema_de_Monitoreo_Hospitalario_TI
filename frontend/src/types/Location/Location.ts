export interface Location {
  id:                 number;
  name:               string;
  building:           string;
  floor?:             number | null;
  room?:              string | null;
  description:        string;
  parent_location_id?: number | null;
  children:           Location[];
}
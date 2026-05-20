import api from "./axios";

import type { Location } from "@/types/Location/Location";
import type { CreateLocationDTO } from "@/types/Location/CreateLocationDTO";
import type { UpdateLocationDTO } from "@/types/Location/UpdateLocationDTO";

const BASE_URL = "/locations";

export const getLocations = async (): Promise<Location[]> => {
  const response = await api.get(BASE_URL);
  return response.data;
};

export async function getLocationById(id: number) {
  const response = await api.get(`${BASE_URL}/${id}`);
    return response.data[0];
}

export const createLocation = async (
  data: CreateLocationDTO
): Promise<Location> => {
  const response = await api.post(BASE_URL, data);
  return response.data;
};

export const updateLocation = async (
  id: number,
  data: UpdateLocationDTO
): Promise<Location> => {
  const response = await api.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteLocation = async (
  id: number
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
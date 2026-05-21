import api from "@/api/axios";

import type { Device } from "@/types/Device/Device";

import type { CreateDeviceDTO } from "@/types/Device/CreateDeviceDTO";

import type { UpdateDeviceDTO } from "@/types/Device/UpdateDeviceDTO";

// ─── Devices ─────────────────────────────────────────────

export async function getDevices(): Promise<Device[]> {

  const response = await api.get("/devices");

  return response.data;
}

export async function getDeviceById(
  id: number
): Promise<Device> {

  const response = await api.get(`/devices/${id}`);

  return response.data;
}

export async function createDevice(
  data: CreateDeviceDTO
) {

  const response = await api.post(
    "/devices",
    data
  );

  return response.data;
}

export async function updateDevice(
  id: number,
  data: UpdateDeviceDTO
) {

  const response = await api.put(
    `/devices/${id}`,
    data
  );

  return response.data;
}

export async function deleteDevice(
  id: number
) {

  const response = await api.delete(
    `/devices/${id}`
  );

  return response.data;
}
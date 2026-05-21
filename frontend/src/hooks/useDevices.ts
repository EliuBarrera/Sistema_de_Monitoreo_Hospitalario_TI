// src/hooks/useDevices.ts

import {
  useEffect,
  useState,
} from "react";

import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from "@/api/device_service";

import {
  getDeviceTypes,
} from "@/api/device_type_service";

import {
  getLocations,
} from "@/api/location_service";

import type { Device } from "@/types/Device/Device";

import type { DeviceType }
from "@/types/Device/DeviceType/DeviceType";

import type { Location }
from "@/types/Location/Location";

import type { CreateDeviceDTO }
from "@/types/Device/CreateDeviceDTO";

import type { UpdateDeviceDTO }
from "@/types/Device/UpdateDeviceDTO";

export function useDevices() {

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [deviceTypes, setDeviceTypes] =
    useState<DeviceType[]>([]);

  const [locations, setLocations] =
    useState<Location[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function load() {

    setLoading(true);

    try {

      const [
        devs,
        types,
        locs,
      ] = await Promise.all([
        getDevices(),
        getDeviceTypes(),
        getLocations(),
      ]);

      setDevices(devs);
      setDeviceTypes(types);
      setLocations(locs);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(
    data: CreateDeviceDTO
  ) {

    await createDevice(data);

    await load();
  }

  async function update(
    id: number,
    data: UpdateDeviceDTO
  ) {

    await updateDevice(id, data);

    await load();
  }

  async function remove(id: number) {

    await deleteDevice(id);

    await load();
  }

  return {
    devices,
    deviceTypes,
    locations,
    loading,

    reload: load,

    create,
    update,
    remove,
  };
}
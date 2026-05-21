import api from "@/api/axios";

import type { DeviceType } from "@/types/Device/DeviceType/DeviceType";
import type { CreateDeviceTypeDTO } from "@/types/Device/DeviceType/CreateDeviceTypeDTO";
import type { UpdateDeviceTypeDTO } from "@/types/Device/DeviceType/UpdateDeviceTypeDTO";

// ─── Device Types ───────────────────────────────────────

export async function getDeviceTypes():
    Promise<DeviceType[]> {

    const response = await api.get(
        "/device-types"
    );

    return response.data;
}

export async function createDeviceType(
    data: CreateDeviceTypeDTO
) {

    const response = await api.post(
        "/device-types",
        data
    );

    return response.data;
}

export async function updateDeviceType(
    id: number,
    data: UpdateDeviceTypeDTO
) {

    const response = await api.put(
        `/device-types/${id}`,
        data
    );

    return response.data;
}

export async function deleteDeviceType(
    id: number
) {

    const response = await api.delete(
        `/device-types/${id}`
    );
    return response.data;
}

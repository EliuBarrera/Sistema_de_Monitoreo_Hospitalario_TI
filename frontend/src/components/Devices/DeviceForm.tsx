import { useEffect, useState } from "react";

import {
  Server,
  Hash,
  Network,
  MapPin,
  Cpu,
  Save,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  getLocations,
} from "@/api/location_service";

import {
  getDeviceTypes,
} from "@/api/device_service";

import type { Location } from "@/types/Location/Location";

import type { DeviceType } from "@/types/Device/DeviceType/DeviceType";

import type { CreateDeviceDTO } from "@/types/Device/CreateDeviceDTO";

interface Props {
  initialData?: Partial<CreateDeviceDTO>;

  onSubmit: (
    data: CreateDeviceDTO
  ) => Promise<void>;

  loading?: boolean;
}

const STATUS_OPTIONS = [
  "active",
  "inactive",
  "maintenance",
  "offline",
];

function DeviceForm({
  initialData,
  onSubmit,
  loading,
}: Props) {

  const [locations, setLocations] =
    useState<Location[]>([]);

  const [deviceTypes, setDeviceTypes] =
    useState<DeviceType[]>([]);

  const [formData, setFormData] =
    useState<CreateDeviceDTO>({
      name: initialData?.name || "",
      serial_number:
        initialData?.serial_number || "",
      status:
        initialData?.status || "active",
      location_id:
        initialData?.location_id || null,
      ip_address:
        initialData?.ip_address || "",
      device_type_id:
        initialData?.device_type_id || null,
    });

  useEffect(() => {

    async function loadData() {

      try {

        const [
          locationsData,
          typesData,
        ] = await Promise.all([
          getLocations(),
          getDeviceTypes(),
        ]);

        setLocations(locationsData);

        setDeviceTypes(typesData);

      } catch (error) {

        console.error(error);

      }
    }

    loadData();

  }, []);

  useEffect(() => {

    if (!initialData) return;

    setFormData({
      name: initialData.name || "",
      serial_number:
        initialData.serial_number || "",
      status:
        initialData.status || "active",
      location_id:
        initialData.location_id || null,
      ip_address:
        initialData.ip_address || "",
      device_type_id:
        initialData.device_type_id || null,
    });

  }, [initialData]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        name === "location_id" ||
          name === "device_type_id"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    await onSubmit(formData);
  }

  const inputClass = `
    pl-9
    bg-white dark:bg-slate-800
    border-slate-200 dark:border-slate-700
    text-slate-900 dark:text-slate-100
    rounded-xl h-10
  `;

  const labelClass = `
    text-sm font-medium
    text-slate-700 dark:text-slate-300
  `;

  const iconClass = `
    absolute left-3 top-1/2
    -translate-y-1/2
    text-slate-400 dark:text-slate-500
    pointer-events-none
  `;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* Nombre */}
      <div className="space-y-1.5">

        <Label className={labelClass}>
          Nombre del dispositivo
        </Label>

        <div className="relative">

          <Server
            size={15}
            className={iconClass}
          />

          <Input
            name="name"
            placeholder="Ventilador UCI-01"
            value={formData.name}
            onChange={handleChange}
            className={inputClass}
          />

        </div>
      </div>

      {/* Serial */}
      <div className="space-y-1.5">

        <Label className={labelClass}>
          Serial
        </Label>

        <div className="relative">

          <Hash
            size={15}
            className={iconClass}
          />

          <Input
            name="serial_number"
            placeholder="SN-AX921-KL"
            value={formData.serial_number}
            onChange={handleChange}
            className={inputClass}
          />

        </div>
      </div>

      {/* IP */}
      <div className="space-y-1.5">

        <Label className={labelClass}>
          Dirección IP
        </Label>

        <div className="relative">

          <Network
            size={15}
            className={iconClass}
          />

          <Input
            name="ip_address"
            placeholder="192.168.1.20"
            value={formData.ip_address ?? ""}
            onChange={handleChange}
            className={inputClass}
          />

        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">

        <Label className={labelClass}>
          Estado
        </Label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="
            w-full h-10 px-3
            rounded-xl text-sm
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-slate-100
          "
        >
          {STATUS_OPTIONS.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="space-y-1.5">

        <Label className={labelClass}>
          Ubicación
        </Label>

        <div className="relative">

          <MapPin
            size={15}
            className={iconClass}
          />

          <select
            name="location_id"
            value={formData.location_id ?? ""}
            onChange={handleChange}
            className="
              w-full h-10 pl-9 pr-3
              rounded-xl text-sm
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-slate-100
            "
          >

            <option value="">
              Sin ubicación
            </option>

            {locations.map((location) => (
              <option
                key={location.id}
                value={location.id}
              >
                {location.name}
              </option>
            ))}

          </select>
        </div>
      </div>

      {/* Device Type */}
      <div className="space-y-1.5">

        <Label className={labelClass}>
          Tipo de dispositivo
        </Label>

        <div className="relative">

          <Cpu
            size={15}
            className={iconClass}
          />

          <select
            name="device_type_id"
            value={
              formData.device_type_id ?? ""
            }
            onChange={handleChange}
            className="
              w-full h-10 pl-9 pr-3
              rounded-xl text-sm
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-slate-100
            "
          >

            <option value="">
              Sin tipo
            </option>

            {deviceTypes.map((type) => (
              <option
                key={type.id}
                value={type.id}
              >
                {type.name}
              </option>
            ))}

          </select>
        </div>
      </div>

      {/* Divider */}
      <div className="
        border-t
        border-slate-100 dark:border-slate-800
        pt-1
      " />

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="
          w-full h-10 rounded-xl
          font-medium text-sm
          flex items-center justify-center gap-2

          bg-[#4a5296]
          hover:bg-[#3d4580]

          text-white
          border-0
          cursor-pointer
        "
      >

        {loading ? (
          <Loader2
            size={15}
            className="animate-spin"
          />
        ) : (
          <Save size={15} />
        )}

        {loading
          ? "Guardando..."
          : "Guardar dispositivo"}

      </Button>
    </form>
  );
}

export default DeviceForm;
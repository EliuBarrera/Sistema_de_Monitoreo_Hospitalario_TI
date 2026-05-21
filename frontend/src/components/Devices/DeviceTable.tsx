// src/components/Devices/DeviceTable.tsx

import {
  Monitor,
  Pencil,
  Trash2,
  Server,
} from "lucide-react";

import type { Device } from "@/types/Device/Device";
import type { DeviceType } from "@/types/Device/DeviceType/DeviceType";

import DeviceStatusBadge from "@/components/Devices/DeviceStatusBadge";

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  loading: boolean;

  devices: Device[];

  deviceTypes: DeviceType[];

  selectedDevice: Device | null;

  onSelect: (device: Device) => void;

  onEdit: (device: Device) => void;

  onDelete: (id: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

function DeviceTable({
  loading,
  devices,
  deviceTypes,
  selectedDevice,
  onSelect,
  onEdit,
  onDelete,
}: Props) {

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="
        divide-y
        divide-slate-50 dark:divide-slate-800
      ">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="px-5 py-3 flex gap-4"
          >
            {[...Array(4)].map((_, j) => (
              <div
                key={j}
                className="
                  h-4 flex-1 rounded
                  bg-slate-100 dark:bg-slate-800
                  animate-pulse
                "
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ─── Empty ───────────────────────────────────────────────────────────────

  if (devices.length === 0) {
    return (
      <div className="py-12 text-center">

        <Monitor
          size={28}
          className="
            mx-auto mb-2
            text-slate-300 dark:text-slate-700
          "
        />

        <p className="
          text-sm
          text-slate-400
        ">
          No hay dispositivos registrados.
          Qué tranquilidad ficticia para el departamento TI.
        </p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="
      overflow-x-auto
      max-h-[420px]
      overflow-y-auto
    ">
      <table className="w-full text-sm">

        {/* Header */}
        <thead className="
          sticky top-0 z-10
          bg-white dark:bg-slate-900
        ">
          <tr className="
            border-b
            border-slate-100 dark:border-slate-800
          ">

            {[
              "Nombre",
              "IP",
              "Tipo",
              "Estado",
              "",
            ].map((header) => (
              <th
                key={header}
                className="
                  text-left
                  px-4 py-2.5

                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide

                  text-slate-400
                  whitespace-nowrap
                "
              >
                {header}
              </th>
            ))}

          </tr>
        </thead>

        {/* Body */}
        <tbody className="
          divide-y
          divide-slate-50 dark:divide-slate-800/60
        ">

          {devices.map((device) => {

            const isSelected =
              selectedDevice?.id === device.id;

            const deviceType =
              deviceTypes.find(
                (type) =>
                  type.id === device.device_type_id
              );

            return (
              <tr
                key={device.id}
                onClick={() => onSelect(device)}
                className={`
                  cursor-pointer
                  transition-colors
                  group

                  ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }
                `}
              >

                {/* Nombre */}
                <td className="px-4 py-2.5">

                  <div className="
                    flex items-center gap-2
                  ">

                    <div
                      className={`
                        w-6 h-6
                        rounded-lg
                        flex items-center justify-center
                        shrink-0

                        ${
                          isSelected
                            ? "bg-[#4a5296] text-white"
                            : "bg-[#4a5296]/10"
                        }
                      `}
                    >
                      <Server
                        size={12}
                        className={
                          isSelected
                            ? "text-white"
                            : "text-[#4a5296]"
                        }
                      />
                    </div>

                    <span
                      className={`
                        text-xs
                        font-medium
                        truncate
                        max-w-[160px]

                        ${
                          isSelected
                            ? "text-[#4a5296] dark:text-indigo-300"
                            : "text-slate-800 dark:text-slate-200"
                        }
                      `}
                    >
                      {device.name}
                    </span>

                  </div>
                </td>

                {/* IP */}
                <td className="px-4 py-2.5">

                  <span className="
                    text-[11px]
                    font-mono
                    text-slate-500
                  ">
                    {device.ip_address || "—"}
                  </span>

                </td>

                {/* Tipo */}
                <td className="px-4 py-2.5">

                  <span className="
                    text-[11px]
                    text-slate-500
                  ">
                    {deviceType?.name || "—"}
                  </span>

                </td>

                {/* Estado */}
                <td className="px-4 py-2.5">
                  <DeviceStatusBadge
                    status={device.status}
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-2.5">

                  <div className="
                    flex items-center gap-1

                    opacity-0
                    group-hover:opacity-100

                    transition-opacity
                  ">

                    {/* Edit */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(device);
                      }}
                      className="
                        p-1.5 rounded-lg

                        hover:bg-slate-100
                        dark:hover:bg-slate-800

                        text-slate-400
                        hover:text-[#4a5296]

                        transition-colors
                      "
                    >
                      <Pencil size={12} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(device.id);
                      }}
                      className="
                        p-1.5 rounded-lg

                        hover:bg-red-50
                        dark:hover:bg-slate-800

                        text-slate-400
                        hover:text-red-500

                        transition-colors
                      "
                    >
                      <Trash2 size={12} />
                    </button>

                  </div>
                </td>

              </tr>
            );
          })}

        </tbody>
      </table>
    </div>
  );
}

export default DeviceTable;
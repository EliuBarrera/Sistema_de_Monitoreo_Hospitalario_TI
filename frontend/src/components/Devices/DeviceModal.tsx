// src/components/Devices/DeviceModal.tsx

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Device } from "@/types/Device/Device";
import type { DeviceType } from "@/types/Device/DeviceType/DeviceType";
import type { CreateDeviceDTO } from "@/types/Device/CreateDeviceDTO";
import type { UpdateDeviceDTO } from "@/types/Device/UpdateDeviceDTO";
import type { Location } from "@/types/Location/Location";

import { flattenLocations } from "@/utils/deviceHelpers";

interface Props {
  open: boolean;
  onClose: () => void;

  onSave: (
    data: CreateDeviceDTO | UpdateDeviceDTO
  ) => Promise<void>;

  deviceTypes: DeviceType[];
  locations: Location[];

  initial?: Device | null;
  preLocId?: number | null;
}

function DeviceModal({
  open,
  onClose,
  onSave,
  deviceTypes,
  locations,
  initial,
  preLocId,
}: Props) {

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState<CreateDeviceDTO>({
      name: "",
      serial_number: "",
      status: "active",
      location_id: null,
      ip_address: "",
      device_type_id: null,
    });

  const flatLocations =
    flattenLocations(locations);

  useEffect(() => {

    if (!open) return;

    if (initial) {
      setForm({
        name: initial.name,
        serial_number: initial.serial_number,
        status: initial.status,
        location_id: initial.location_id,
        ip_address: initial.ip_address ?? "",
        device_type_id:
          initial.device_type_id,
      });

      return;
    }

    setForm({
      name: "",
      serial_number: "",
      status: "active",
      location_id: preLocId ?? null,
      ip_address: "",
      device_type_id: null,
    });

  }, [open, initial, preLocId]);

  async function handleSubmit() {

    if (
      !form.name.trim() ||
      !form.serial_number.trim()
    ) return;

    setSaving(true);

    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >

      <DialogContent
        className="
          sm:max-w-md
          bg-white dark:bg-slate-900
          border-slate-200 dark:border-slate-800
        "
      >

        <DialogHeader>
          <DialogTitle>
            {initial
              ? "Editar dispositivo"
              : "Nuevo dispositivo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          <div className="space-y-1">
            <Label>Nombre *</Label>

            <Input
              value={form.name}
              placeholder="Servidor Principal"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Serial *</Label>

            <Input
              value={form.serial_number}
              placeholder="SRV-001"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  serial_number:
                    e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>IP</Label>

            <Input
              value={form.ip_address ?? ""}
              placeholder="192.168.1.1"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ip_address:
                    e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="space-y-1">

              <Label>Estado</Label>

              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    status:
                      v as CreateDeviceDTO["status"],
                  }))
                }
              >

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="active">
                    Activo
                  </SelectItem>

                  <SelectItem value="inactive">
                    Inactivo
                  </SelectItem>

                  <SelectItem value="maintenance">
                    Mantenimiento
                  </SelectItem>
                </SelectContent>

              </Select>

            </div>

            <div className="space-y-1">

              <Label>Tipo</Label>

              <Select
                value={
                  form.device_type_id?.toString()
                  ?? ""
                }
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    device_type_id:
                      v
                        ? Number(v)
                        : null,
                  }))
                }
              >

                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>

                <SelectContent>

                  {deviceTypes.map((t) => (
                    <SelectItem
                      key={t.id}
                      value={t.id.toString()}
                    >
                      {t.name}
                    </SelectItem>
                  ))}

                </SelectContent>

              </Select>

            </div>

          </div>

          <div className="space-y-1">

            <Label>Ubicación</Label>

            <Select
              value={
                form.location_id?.toString()
                ?? ""
              }
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  location_id:
                    v
                      ? Number(v)
                      : null,
                }))
              }
            >

              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>

              <SelectContent>

                {flatLocations.map((loc) => (
                  <SelectItem
                    key={loc.id}
                    value={loc.id.toString()}
                  >
                    {loc.name}
                  </SelectItem>
                ))}

              </SelectContent>

            </Select>

          </div>

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="text-white bg-[#4a5296]"
          >
            {saving
              ? "Guardando..."
              : initial
                ? "Guardar cambios"
                : "Crear dispositivo"}
          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}

export default DeviceModal;
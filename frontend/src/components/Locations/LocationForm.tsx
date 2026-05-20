import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  MapPin,
  Building2,
  Layers3,
  DoorOpen,
  FileText,
  GitBranch,
  Save,
  Loader2,
} from "lucide-react";

import type { CreateLocationDTO } from "@/types/Location/CreateLocationDTO";

interface Props {
  initialData?: CreateLocationDTO;
  onSubmit: (data: CreateLocationDTO) => void;
  loading?: boolean;
}

function LocationForm({
  initialData,
  onSubmit,
  loading,
}: Props) {

  const [formData, setFormData] =
    useState<CreateLocationDTO>({
      name: initialData?.name || "",
      building: initialData?.building || "",
      floor: initialData?.floor || null,
      room: initialData?.room || "",
      description: initialData?.description || "",
      parent_location_id:
        initialData?.parent_location_id || null,
    });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        building: initialData.building || "",
        floor: initialData.floor || null,
        room: initialData.room || "",
        description: initialData.description || "",
        parent_location_id:
          initialData.parent_location_id || null,
      });
    }
  }, [initialData]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "floor" ||
        name === "parent_location_id"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onSubmit(formData);
  };

  // ─── Shared styles ──────────────────────────────────────────────────────

  const inputClass = `
    pl-9
    bg-white dark:bg-slate-800
    border-slate-200 dark:border-slate-700
    text-slate-900 dark:text-slate-100
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus-visible:ring-[#4a5296]/40
    dark:focus-visible:ring-[#4a5296]/60
    rounded-xl h-10
  `;

  const labelClass = `
    text-sm font-medium
    text-slate-700 dark:text-slate-300
  `;

  const iconClass = `
    absolute left-3 top-1/2 -translate-y-1/2
    text-slate-400 dark:text-slate-500
    pointer-events-none
  `;

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* Nombre */}
      <div className="space-y-1.5">
        <Label className={labelClass}>
          Nombre de la ubicación
        </Label>

        <div className="relative">
          <MapPin
            size={15}
            className={iconClass}
          />

          <Input
            name="name"
            placeholder="UCI Neonatal"
            value={formData.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Edificio */}
      <div className="space-y-1.5">
        <Label className={labelClass}>
          Edificio
        </Label>

        <div className="relative">
          <Building2
            size={15}
            className={iconClass}
          />

          <Input
            name="building"
            placeholder="Torre Principal"
            value={formData.building}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Piso */}
      <div className="space-y-1.5">
        <Label className={labelClass}>
          Piso
        </Label>

        <div className="relative">
          <Layers3
            size={15}
            className={iconClass}
          />

          <Input
            name="floor"
            type="number"
            placeholder="3"
            value={formData.floor ?? ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Habitación */}
      <div className="space-y-1.5">
        <Label className={labelClass}>
          Habitación
        </Label>

        <div className="relative">
          <DoorOpen
            size={15}
            className={iconClass}
          />

          <Input
            name="room"
            placeholder="301A"
            value={formData.room ?? ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label className={labelClass}>
          Descripción
        </Label>

        <div className="relative">
          <FileText
            size={15}
            className={iconClass}
          />

          <Input
            name="description"
            placeholder="Área de cuidados intensivos neonatales"
            value={formData.description}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Parent Location */}
      <div className="space-y-1.5">
        <Label className={labelClass}>
          Ubicación padre
        </Label>

        <div className="relative">
          <GitBranch
            size={15}
            className={iconClass}
          />

          <Input
            name="parent_location_id"
            type="number"
            placeholder="ID de ubicación padre (opcional)"
            value={formData.parent_location_id ?? ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <p className="
          text-xs
          text-slate-400 dark:text-slate-500
        ">
          Define la jerarquía física dentro del hospital.
          Porque aparentemente los humanos aman convertir
          edificios en árboles recursivos.
        </p>
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

          dark:bg-[#4a5296]
          dark:hover:bg-[#3d4580]

          text-white
          border-0
          cursor-pointer

          disabled:opacity-50
          disabled:cursor-not-allowed

          transition-colors duration-200
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
          : "Guardar ubicación"}
      </Button>
    </form>
  );
}

export default LocationForm;
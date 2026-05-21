// src/components/Devices/DeviceToolbar.tsx

import {
  Layers,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";

import type { Location } from "@/types/Location/Location";

import {
  findLocationName,
} from "@/utils/deviceHelpers";

interface Props {
  search: string;
  setSearch: (v: string) => void;

  selectedLoc: number | null;

  locations: Location[];

  onClearLocation: () => void;

  onOpenDeviceTypes: () => void;

  onOpenCreate: () => void;
}

function DeviceToolbar({
  search,
  setSearch,
  selectedLoc,
  locations,
  onClearLocation,
  onOpenDeviceTypes,
  onOpenCreate,
}: Props) {

  return (
    <div
      className="
        sticky top-0 z-30
        bg-white dark:bg-slate-900
        border-b border-slate-200 dark:border-slate-800
        px-6 py-4
        flex items-center justify-between
      "
    >

      <div>
        <h1
          className="
            text-lg font-semibold
            text-slate-900 dark:text-slate-100
          "
        >
          Dispositivos
        </h1>

        <p
          className="
            text-xs
            text-slate-500 dark:text-slate-400
          "
        >
          Gestión de infraestructura TI
        </p>
      </div>

      <div className="flex-1 max-w-sm relative">

        <Search
          size={14}
          className="
            absolute left-3 top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Buscar..."
          className="
            w-full
            pl-8 pr-8 py-2
            text-sm rounded-xl
            bg-slate-50 dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
          "
        />

        {search && (
          <button
            onClick={() =>
              setSearch("")
            }
            className="
              absolute right-3 top-1/2
              -translate-y-1/2
            "
          >
            <X size={13} />
          </button>
        )}

      </div>

      {selectedLoc && (
        <button
          onClick={onClearLocation}
          className="
            flex items-center gap-1.5
            text-xs
            px-3 py-1.5
            rounded-lg
            bg-indigo-50 dark:bg-indigo-950
          "
        >

          <MapPin size={12} />

          {findLocationName(
            selectedLoc,
            locations
          )}

        </button>
      )}

      <div className="flex gap-4">
        <button
            onClick={onOpenDeviceTypes}
            className="
            flex items-center gap-2
            px-3 py-2
            rounded-lg
            border border-slate-200
            "
        >
            <Layers size={14} />
            Tipos
        </button>

        <button
            onClick={onOpenCreate}
            className="
            flex items-center gap-2
            px-4 py-2
            rounded-lg
            text-white
            bg-[#4a5296]
            "
        >
            <Plus size={15} />
            Nuevo
        </button>
      </div>

    </div>
  );
}

export default DeviceToolbar;
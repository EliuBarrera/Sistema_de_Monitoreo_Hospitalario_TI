import { useNavigate, useSearchParams } from "react-router-dom";
import { createLocation } from "@/api/location_service";
import LocationForm from "@/components/Locations/LocationForm";

import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  MapPinPlus,
} from "lucide-react";
import type { CreateLocationDTO } from "@/types/Location/CreateLocationDTO";

function CreateLocationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get("parent");

  const initialData: CreateLocationDTO = {
    name: "",
    building: "",
    description: "",
    floor: null,
    room: "",
    parent_location_id: parentId
      ? Number(parentId)
      : null,
  };

  async function handleCreate(data: any) {
    try {
      await createLocation(data);
      navigate("/locations");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      {/* Header */}
      <header className="
        bg-white dark:bg-slate-900
        border-b border-slate-200 dark:border-slate-800
        px-6 py-4
      ">
        <div className="flex items-center gap-3">

          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/locations")}
            className="
              p-2 h-9 w-9 rounded-xl
              text-slate-500 dark:text-slate-400
              hover:text-slate-900 dark:hover:text-slate-100
              hover:bg-slate-100 dark:hover:bg-slate-800
              cursor-pointer
            "
          >
            <ArrowLeft size={18} />
          </Button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="
              p-2 rounded-xl
              bg-slate-100 dark:bg-slate-800
            ">
              <MapPinPlus
                size={18}
                className="text-slate-600 dark:text-slate-300"
              />
            </div>

            <div>
              <h1 className="
                text-base font-semibold
                text-slate-900 dark:text-slate-100
              ">
                Crear Ubicación
              </h1>

              <p className="
                text-xs
                text-slate-500 dark:text-slate-400
              ">
                Registra una nueva ubicación dentro de la infraestructura hospitalaria
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">

        <div
          className="
            max-w-2xl mx-auto
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-800
            rounded-2xl
            p-6
            shadow-sm
          "
        >

          {/* Section title */}
          <div className="mb-6">
            <h2 className="
              text-sm font-semibold
              text-slate-900 dark:text-slate-100
            ">
              Información de la ubicación
            </h2>

            <p className="
              mt-1 text-xs
              text-slate-500 dark:text-slate-400
            ">
              Define el edificio, piso y detalles jerárquicos. Porque claramente
              los humanos decidieron que un hospital debía tener una topología
              más compleja que una red empresarial mediana.
            </p>
          </div>

          {/* Form */}
          <LocationForm
            initialData={initialData}
            onSubmit={handleCreate}
          />

        </div>
      </main>
    </div>
  );
}

export default CreateLocationPage;
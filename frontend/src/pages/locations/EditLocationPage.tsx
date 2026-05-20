import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Pencil,
} from "lucide-react";

import {
  getLocationById,
  updateLocation,
} from "@/api/location_service";

import type { Location } from "@/types/Location/Location";

import LocationForm from "@/components/Locations/LocationForm";

import { Button } from "@/components/ui/button";

function EditLocationPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [location, setLocation] =
    useState<Location | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadLocation() {
      try {
        if (!id) return;

        const data = await getLocationById(Number(id));

        setLocation(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadLocation();
  }, [id]);

  async function handleUpdate(data: any) {
    try {
      if (!id) return;

      await updateLocation(Number(id), data);

      navigate("/locations");
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="
        min-h-screen
        flex items-center justify-center
        bg-slate-50 dark:bg-slate-950
      ">
        <p className="
          text-sm
          text-slate-500 dark:text-slate-400
        ">
          Cargando ubicación...
        </p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="
        min-h-screen
        flex items-center justify-center
        bg-slate-50 dark:bg-slate-950
      ">
        <p className="
          text-sm
          text-red-500
        ">
          Ubicación no encontrada
        </p>
      </div>
    );
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

          {/* Back */}
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
              <Pencil
                size={18}
                className="text-slate-600 dark:text-slate-300"
              />
            </div>

            <div>
              <h1 className="
                text-base font-semibold
                text-slate-900 dark:text-slate-100
              ">
                Editar Ubicación
              </h1>

              <p className="
                text-xs
                text-slate-500 dark:text-slate-400
              ">
                Actualiza la información de la ubicación seleccionada
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
              Datos de la ubicación
            </h2>

            <p className="
              mt-1 text-xs
              text-slate-500 dark:text-slate-400
            ">
              Modifica la estructura física y jerárquica de la ubicación.
              Porque inevitablemente alguien decidió mover una sala crítica
              al “piso temporal definitivo”.
            </p>
          </div>

          <LocationForm
            initialData={{
              name: location.name,
              building: location.building,
              floor: location.floor,
              room: location.room,
              description: location.description,
              parent_location_id:
                location.parent_location_id,
            }}
            onSubmit={handleUpdate}
          />

        </div>
      </main>
    </div>
  );
}

export default EditLocationPage;
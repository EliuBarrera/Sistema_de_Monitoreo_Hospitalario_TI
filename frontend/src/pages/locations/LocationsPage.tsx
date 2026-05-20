  import { useEffect, useState } from "react";
  import { MapPin, Plus } from "lucide-react";
  import { getLocations, deleteLocation } from "@/api/location_service";
  import type { Location } from "@/types/Location/Location";
  import { LocationTree }      from "@/components/Locations/LocationTree";
  import { LocationSearchBar } from "@/components/Locations/LocationSearchBar";
  import { Button } from "@/components/ui/button";
  import { useNavigate } from "react-router-dom";

  // ─── Skeleton de carga ────────────────────────────────────────────────────────

  function TreeSkeleton() {
    const rows = [
      { w: "55%", ml: 14  },
      { w: "45%", ml: 36  },
      { w: "38%", ml: 58  },
      { w: "42%", ml: 58  },
      { w: "40%", ml: 36  },
      { w: "50%", ml: 14  },
      { w: "35%", ml: 36  },
    ];
    return (
      <div className="py-3 px-2 space-y-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
            style={{ width: r.w, marginLeft: r.ml }}
          />
        ))}
      </div>
    );
  }

  // ─── Página ───────────────────────────────────────────────────────────────────

  export default function LocationsPage() {
    const [locations,    setLocations]    = useState<Location[]>([]);
    const [loading,      setLoading]      = useState(true);
    const [highlightId,  setHighlightId]  = useState<number | null>(null);
    const [forceOpenIds, setForceOpenIds] = useState<Set<number>>(new Set());

    const navigate = useNavigate();

    // ── Carga inicial ──────────────────────────────────────────────────────────
    const loadLocations = async () => {
      try {
        setLoading(true);
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        console.error("Error cargando ubicaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { loadLocations(); }, []);

    // ── Búsqueda ───────────────────────────────────────────────────────────────
    const handleSearchSelect = (node: Location, ancestorIds: number[]) => {
      setForceOpenIds(new Set(ancestorIds));
      setHighlightId(node.id);
    };

    const handleSearchClear = () => {
      setHighlightId(null);
      setForceOpenIds(new Set());
    };

    // ── CRUD (conectar a modales cuando estén listos) ──────────────────────────
    const handleAdd = (node: Location) => {
      navigate(`/locations/create?parent=${node.id}`);
    };

    const handleEdit = (node: Location) => {
      navigate(`/locations/edit/${node.id}`);
    };
    
    const handleDelete = async (node: Location) => {
      try {
        await deleteLocation(node.id);
        await loadLocations();
      } catch (err) {
        console.error("Error eliminando ubicación:", err);
      }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

        {/* Topbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <MapPin size={18} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Ubicaciones
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Árbol jerárquico de la infraestructura física del hospital
                </p>
              </div>
            </div>
            {/* Buscador */}
            <div className="flex-1 max-w-sm">
              <LocationSearchBar
                tree={locations}
                onSelect={handleSearchSelect}
                onClear={handleSearchClear}
              />
            </div>
            <Button
              onClick={() => navigate("/locations/create")}
              className="
                flex items-center gap-2 h-9 px-4 text-sm font-medium
                bg-[#4a5296] hover:bg-[#3d4580] dark:bg-[#4a5296] dark:hover:bg-[#3d4580]
                text-white border-0 cursor-pointer rounded-xl
              "
            >
              <Plus size={15} />
              Nueva ubicación
            </Button>
          </div>
        </header>

        {/* ── Contenido ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-6">
          <div className="
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-800
            rounded-xl overflow-hidden
          ">
            {/* Cabecera de la tarjeta */}
            <div className="
              px-5 py-3
              border-b border-slate-100 dark:border-slate-800
              flex items-center gap-2
            ">
              <MapPin size={14} className="text-[#4a5296] shrink-0" />
              <span className="
                text-xs font-semibold uppercase tracking-wide
                text-slate-500 dark:text-slate-400
              ">
                Hospital Universitario San Rafael de Tunja
              </span>

              {/* Badge cuando hay resultado activo */}
              {highlightId && (
                <span className="
                  ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium
                  bg-indigo-50 dark:bg-indigo-950
                  text-[#4a5296] dark:text-indigo-300
                ">
                  Mostrando resultado
                </span>
              )}
            </div>

            {/* Árbol */}
            <div className="px-3 pb-3">
              {loading ? (
                <TreeSkeleton />
              ) : (
                <LocationTree
                  locations={locations}
                  highlightId={highlightId}
                  forceOpenIds={forceOpenIds}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex items-center gap-5 px-1 flex-wrap">
            <LegendItem
              pill="bg-indigo-50 dark:bg-indigo-950 text-[#4a5296] dark:text-indigo-300"
              label="Sala"
            />
            <LegendItem
              pill="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              label="Piso"
            />
            <LegendItem
              pill="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
              label="Nº hijos"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
              Pasa el cursor sobre un nodo para ver opciones
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Leyenda ──────────────────────────────────────────────────────────────────

  function LegendItem({ pill, label }: { pill: string; label: string }) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${pill}`}>
          {label}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
      </div>
    );
  }
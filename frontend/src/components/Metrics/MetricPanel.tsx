import { useEffect, useState } from "react";
import { Activity, Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { getMetricsByDevice, createMetric, updateMetric, deleteMetric } from "@/api/metric_service";
import type { Metric }          from "@/types/Metric/Metric";
import type { CreateMetricDTO } from "@/types/Metric/CreateMetricDTO";
import type { UpdateMetricDTO } from "@/types/Metric/UpdateMetricDTO";
import type { Device }          from "@/types/Device/Device";
import { MetricModal }          from "@/components/Metrics/MetricModal";

interface MetricPanelProps {
  device: Device | null;
}

const METRIC_COLOR: Record<string, string> = {
  cpu_usage:   "text-blue-500",
  ram_usage:   "text-purple-500",
  disk_usage:  "text-orange-500",
  network_in:  "text-emerald-500",
  network_out: "text-teal-500",
  uptime:      "text-indigo-500",
  latency:     "text-amber-500",
  temperature: "text-red-500",
  battery:     "text-green-500",
};
const METRIC_BG: Record<string, string> = {
  cpu_usage:   "bg-blue-50 dark:bg-blue-900/20",
  ram_usage:   "bg-purple-50 dark:bg-purple-900/20",
  disk_usage:  "bg-orange-50 dark:bg-orange-900/20",
  network_in:  "bg-emerald-50 dark:bg-emerald-900/20",
  network_out: "bg-teal-50 dark:bg-teal-900/20",
  uptime:      "bg-indigo-50 dark:bg-indigo-900/20",
  latency:     "bg-amber-50 dark:bg-amber-900/20",
  temperature: "bg-red-50 dark:bg-red-900/20",
  battery:     "bg-green-50 dark:bg-green-900/20",
};

function getValueColor(type: string, value: number): string {
  if (["cpu_usage","ram_usage","disk_usage"].includes(type)) {
    if (value >= 90) return "text-red-600 dark:text-red-400";
    if (value >= 70) return "text-amber-500 dark:text-amber-400";
    return "text-emerald-600 dark:text-emerald-400";
  }
  return "text-slate-800 dark:text-slate-200";
}

export function MetricPanel({ device }: MetricPanelProps) {
  const [metrics,   setMetrics]   = useState<Metric[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMetric,setEditMetric]= useState<Metric | null>(null);

  const load = async () => {
    if (!device) return;
    setLoading(true);
    try {
      const data = await getMetricsByDevice(device.id);
      setMetrics(Array.isArray(data) ? data : []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [device?.id]);

  const handleSave = async (data: CreateMetricDTO | UpdateMetricDTO) => {
    if (editMetric) await updateMetric(editMetric.id, data as UpdateMetricDTO);
    else            await createMetric({ ...(data as CreateMetricDTO), device_id: device!.id });
    await load();
  };
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta métrica?")) return;
    await deleteMetric(id);
    await load();
  };
  const openCreate = () => { setEditMetric(null); setModalOpen(true); };
  const openEdit   = (m: Metric) => { setEditMetric(m); setModalOpen(true); };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Activity size={14} className="text-[#4a5296]" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Métricas</span>
        {device && <span className="text-[10px] text-slate-400 truncate ml-1">— {device.name}</span>}
        {metrics.length > 0 && (
          <span className="text-[10px] text-slate-400 ml-1">({metrics.length})</span>
        )}
        {device && (
          <button
            onClick={openCreate}
            className="ml-auto flex items-center gap-1 text-[11px] font-medium text-white px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#4a5296" }}
          >
            <Plus size={11} />Nueva métrica
          </button>
        )}
      </div>

      {/* Body */}
      {!device ? (
        <div className="py-10 text-center">
          <Activity size={28} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Selecciona un dispositivo para ver sus métricas</p>
        </div>
      ) : loading ? (
        <div className="p-4 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <div className="py-10 text-center">
          <TrendingUp size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm text-slate-400">Sin métricas registradas</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3 max-h-56 overflow-y-auto">
          {metrics.map(metric => {
            const bg  = METRIC_BG[metric.metric_type]  ?? "bg-slate-50 dark:bg-slate-800";
            const col = METRIC_COLOR[metric.metric_type] ?? "text-slate-500";
            return (
              <div key={metric.id} className={`relative group rounded-xl px-3 py-2.5 ${bg} border border-slate-100 dark:border-slate-700`}>
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-semibold uppercase tracking-wide truncate ${col}`}>
                      {metric.metric_type.replace(/_/g, " ")}
                    </p>
                    <p className={`text-xl font-bold leading-none mt-1 ${getValueColor(metric.metric_type, metric.value)}`}>
                      {metric.value}
                      <span className="text-[11px] font-normal text-slate-400 ml-1">{metric.unit ?? ""}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 truncate">
                      {metric.timestamp ? new Date(metric.timestamp).toLocaleString("es-CO") : "—"}
                    </p>
                  </div>
                </div>
                {/* Acciones hover */}
                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(metric)} className="p-1 rounded hover:bg-white/60 dark:hover:bg-slate-700 text-slate-400 hover:text-[#4a5296] transition-colors">
                    <Pencil size={10} />
                  </button>
                  <button onClick={() => handleDelete(metric.id)} className="p-1 rounded hover:bg-white/60 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MetricModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        deviceId={device?.id ?? 0}
        initial={editMetric}
      />
    </div>
  );
}
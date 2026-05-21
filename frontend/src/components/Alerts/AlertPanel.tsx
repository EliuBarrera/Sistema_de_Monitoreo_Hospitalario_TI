import { useEffect, useState } from "react";
import { Bell, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { getAlertsByDevice, getAlertSeverities, createAlert, updateAlert, deleteAlert } from "@/api/alert_service";
import type { Alert }          from "@/types/Alert/Alert";
import type { AlertSeverity }  from "@/types/Alert/AlertSeverity";
import type { CreateAlertDTO } from "@/types/Alert/CreateAlertDTO";
import type { UpdateAlertDTO } from "@/types/Alert/UpdateAlertDTO";
import type { Device }         from "@/types/Device/Device";
import { AlertModal }          from "@/components/Alerts/AlertModal";

interface AlertPanelProps {
  device: Device | null;
}

const SEVERITY_STYLE: Record<string, string> = {
  CRITICA: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  ALTA:    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  MEDIA:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  BAJA:    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};
const STATUS_STYLE: Record<string, string> = {
  activa:   "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
  resuelta: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
  ignorada: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};
const SEVERITY_ICON_COLOR: Record<string, string> = {
  CRITICA: "text-red-500",
  ALTA:    "text-orange-500",
  MEDIA:   "text-amber-500",
  BAJA:    "text-slate-400",
};

export function AlertPanel({ device }: AlertPanelProps) {
  const [alerts,     setAlerts]     = useState<Alert[]>([]);
  const [severities, setSeverities] = useState<AlertSeverity[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editAlert,  setEditAlert]  = useState<Alert | null>(null);

  const load = async () => {
    if (!device) return;
    setLoading(true);
    try {
      const [alts, sevs] = await Promise.all([
        getAlertsByDevice(device.id),
        getSeveritiesOnce(severities, setSeverities),
      ]);
      setAlerts(Array.isArray(alts) ? alts : []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [device?.id]);

  const handleSave = async (data: CreateAlertDTO | UpdateAlertDTO) => {
    if (editAlert) await updateAlert(editAlert.id, data as UpdateAlertDTO);
    else           await createAlert({ ...(data as CreateAlertDTO), device_id: device!.id });
    await load();
  };
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta alerta?")) return;
    await deleteAlert(id);
    await load();
  };
  const openCreate = () => { setEditAlert(null); setModalOpen(true); };
  const openEdit   = (a: Alert) => { setEditAlert(a); setModalOpen(true); };

  const activeCount = alerts.filter(a => a.status === "activa").length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Bell size={14} className="text-[#4a5296]" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Alertas</span>
        {device && <span className="text-[10px] text-slate-400 truncate ml-1">— {device.name}</span>}
        {activeCount > 0 && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 font-medium">
            {activeCount} activa{activeCount !== 1 ? "s" : ""}
          </span>
        )}
        {device && (
          <button
            onClick={openCreate}
            className="ml-auto flex items-center gap-1 text-[11px] font-medium text-white px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#4a5296" }}
          >
            <Plus size={11} />Nueva alerta
          </button>
        )}
      </div>

      {/* Body */}
      {!device ? (
        <div className="py-10 text-center">
          <Bell size={28} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Selecciona un dispositivo para ver sus alertas</p>
        </div>
      ) : loading ? (
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-5 py-3 flex gap-3">
              <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-10 text-center">
          <Bell size={28} className="mx-auto text-emerald-300 dark:text-emerald-700 mb-2" />
          <p className="text-sm text-slate-400">Sin alertas para este dispositivo</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-800/60 max-h-52 overflow-y-auto">
          {alerts.map(alert => {
            const sevName = alert.severity?.name ?? "BAJA";
            return (
              <div key={alert.id} className="px-5 py-3 flex items-start gap-3 group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${SEVERITY_ICON_COLOR[sevName] ?? "text-slate-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{alert.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {alert.created_at ? new Date(alert.created_at).toLocaleString("es-CO") : "—"}
                  </p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${SEVERITY_STYLE[sevName] ?? ""}`}>
                  {sevName}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[alert.status] ?? ""}`}>
                  {alert.status}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(alert)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#4a5296] transition-colors">
                    <Pencil size={11} />
                  </button>
                  <button onClick={() => handleDelete(alert.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        severities={severities}
        deviceId={device?.id ?? 0}
        initial={editAlert}
      />
    </div>
  );
}

// Helper: evita recargar severities si ya están cargadas
async function getSeveritiesOnce(
  current: AlertSeverity[],
  setter: (s: AlertSeverity[]) => void
): Promise<void> {
  if (current.length > 0) return;
  try {
    const { getAlertSeverities } = await import("@/api/alert_service");
    const sevs = await getAlertSeverities();
    setter(sevs);
  } catch {}
}
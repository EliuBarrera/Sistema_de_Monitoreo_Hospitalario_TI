import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import type { Metric }           from "@/types/Metric/Metric";
import type { CreateMetricDTO }  from "@/types/Metric/CreateMetricDTO";
import type { UpdateMetricDTO }  from "@/types/Metric/UpdateMetricDTO";

const METRIC_TYPES = ["cpu_usage","ram_usage","disk_usage","network_in","network_out","uptime","latency","temperature","battery","custom"];

interface MetricModalProps {
  open:     boolean;
  onClose:  () => void;
  onSave:   (data: CreateMetricDTO | UpdateMetricDTO) => Promise<void>;
  deviceId: number;
  initial?: Metric | null;
}

export function MetricModal({ open, onClose, onSave, deviceId, initial }: MetricModalProps) {
  const isEdit = !!initial;
  const [form, setForm] = useState<CreateMetricDTO>({
    device_id:   deviceId,
    metric_type: "",
    value:       0,
    unit:        "",
    timestamp:   null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initial
      ? { device_id: initial.device_id ?? deviceId, metric_type: initial.metric_type, value: initial.value, unit: initial.unit ?? "", timestamp: initial.timestamp }
      : { device_id: deviceId, metric_type: "", value: 0, unit: "", timestamp: null }
    );
  }, [open, initial, deviceId]);

  const submit = async () => {
    if (!form.metric_type.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {isEdit ? "Editar métrica" : "Nueva métrica"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 dark:text-slate-400">Tipo de métrica *</Label>
            <select
              value={form.metric_type}
              onChange={e => setForm(f => ({ ...f, metric_type: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#4a5296]/30"
            >
              <option value="">Seleccionar tipo…</option>
              {METRIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-400">Valor *</Label>
              <Input
                type="number"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-400">Unidad</Label>
              <Input
                placeholder="%, MB, ms, °C…"
                value={form.unit ?? ""}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 dark:text-slate-400">Timestamp (opcional)</Label>
            <Input
              type="datetime-local"
              value={form.timestamp ? form.timestamp.slice(0,16) : ""}
              onChange={e => setForm(f => ({ ...f, timestamp: e.target.value ? new Date(e.target.value).toISOString() : null }))}
              className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-700 text-slate-600">
            Cancelar
          </Button>
          <Button
            disabled={saving || !form.metric_type.trim()}
            onClick={submit}
            className="text-white"
            style={{ backgroundColor: "#4a5296" }}
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Registrar métrica"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
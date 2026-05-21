import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Alert }          from "@/types/Alert/Alert";
import type { AlertSeverity }  from "@/types/Alert/AlertSeverity";
import type { CreateAlertDTO } from "@/types/Alert/CreateAlertDTO";
import type { UpdateAlertDTO } from "@/types/Alert/UpdateAlertDTO";

interface AlertModalProps {
  open:       boolean;
  onClose:    () => void;
  onSave:     (data: CreateAlertDTO | UpdateAlertDTO) => Promise<void>;
  severities: AlertSeverity[];
  deviceId:   number;
  initial?:   Alert | null;
}

export function AlertModal({ open, onClose, onSave, severities, deviceId, initial }: AlertModalProps) {
  const isEdit = !!initial;
  const [form, setForm] = useState<CreateAlertDTO>({
    device_id:   deviceId,
    severity_id: null,
    message:     "",
    status:      "activa",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initial
      ? { device_id: initial.device_id, severity_id: initial.severity_id, message: initial.message, status: initial.status }
      : { device_id: deviceId, severity_id: null, message: "", status: "activa" }
    );
  }, [open, initial, deviceId]);

  const submit = async () => {
    if (!form.message.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {isEdit ? "Editar alerta" : "Nueva alerta"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 dark:text-slate-400">Mensaje *</Label>
            <Input
              placeholder="Describe el problema detectado…"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-400">Severidad</Label>
              <Select
                value={form.severity_id?.toString() ?? ""}
                onValueChange={v => setForm(f => ({ ...f, severity_id: v ? Number(v) : null }))}
              >
                <SelectTrigger className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {severities.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-400">Estado</Label>
              <Select
                value={form.status ?? "activa"}
                onValueChange={v => setForm(f => ({ ...f, status: v as CreateAlertDTO["status"] }))}
              >
                <SelectTrigger className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="resuelta">Resuelta</SelectItem>
                  <SelectItem value="ignorada">Ignorada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            Cancelar
          </Button>
          <Button
            disabled={saving || !form.message.trim()}
            onClick={submit}
            className="text-white"
            style={{ backgroundColor: "#4a5296" }}
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear alerta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
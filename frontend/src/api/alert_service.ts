import api from "@/api/axios";
import type { Alert }           from "@/types/Alert/Alert";
import type { AlertSeverity }   from "@/types/Alert/AlertSeverity";
import type { CreateAlertDTO }  from "@/types/Alert/CreateAlertDTO";
import type { UpdateAlertDTO }  from "@/types/Alert/UpdateAlertDTO";

// ── Alertas ──────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  const res = await api.get("/alerts");
  return res.data;
}

export async function getAlertsByDevice(deviceId: number): Promise<Alert[]> {
  const res = await api.get(`/alerts/device/${deviceId}`);
  return res.data;
}

export async function getAlertById(id: number): Promise<Alert> {
  const res = await api.get(`/alerts/${id}`);
  return res.data;
}

export async function createAlert(data: CreateAlertDTO): Promise<Alert> {
  const res = await api.post("/alerts", data);
  return res.data;
}

export async function updateAlert(id: number, data: UpdateAlertDTO): Promise<Alert> {
  const res = await api.put(`/alerts/${id}`, data);
  return res.data;
}

export async function deleteAlert(id: number): Promise<void> {
  await api.delete(`/alerts/${id}`);
}

// ── Severidades ───────────────────────────────────────────────────────────────

export async function getAlertSeverities(): Promise<AlertSeverity[]> {
  const res = await api.get("/alerts/severities");
  return res.data;
}
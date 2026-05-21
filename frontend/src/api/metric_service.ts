import api from "@/api/axios";
import type { Metric }           from "@/types/Metric/Metric";
import type { CreateMetricDTO }  from "@/types/Metric/CreateMetricDTO";
import type { UpdateMetricDTO }  from "@/types/Metric/UpdateMetricDTO";

export async function getMetrics(): Promise<Metric[]> {
  const res = await api.get("/metrics");
  return res.data;
}

export async function getMetricsByDevice(deviceId: number): Promise<Metric[]> {
  const res = await api.get(`/metrics/device/${deviceId}`);
  return res.data;
}

export async function getMetricById(id: number): Promise<Metric> {
  const res = await api.get(`/metrics/${id}`);
  return res.data;
}

export async function createMetric(data: CreateMetricDTO): Promise<Metric> {
  const res = await api.post("/metrics", data);
  return res.data;
}

export async function updateMetric(id: number, data: UpdateMetricDTO): Promise<Metric> {
  const res = await api.put(`/metrics/${id}`, data);
  return res.data;
}

export async function deleteMetric(id: number): Promise<void> {
  await api.delete(`/metrics/${id}`);
}
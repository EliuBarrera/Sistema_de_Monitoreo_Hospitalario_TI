import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  Server,
  MapPin,
  Activity,
  BellRing,
  Users,
  LogOut,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  HardDrive,
  Thermometer,
  Menu,
  X,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const cpuData = [
  { time: "08:00", value: 42 },
  { time: "09:00", value: 58 },
  { time: "10:00", value: 71 },
  { time: "11:00", value: 65 },
  { time: "12:00", value: 80 },
  { time: "13:00", value: 55 },
  { time: "14:00", value: 63 },
  { time: "15:00", value: 74 },
  { time: "16:00", value: 69 },
];

const networkData = [
  { time: "08:00", entrada: 120, salida: 80 },
  { time: "09:00", entrada: 210, salida: 130 },
  { time: "10:00", entrada: 180, salida: 160 },
  { time: "11:00", entrada: 250, salida: 200 },
  { time: "12:00", entrada: 300, salida: 240 },
  { time: "13:00", entrada: 190, salida: 170 },
  { time: "14:00", entrada: 220, salida: 180 },
  { time: "15:00", entrada: 270, salida: 210 },
  { time: "16:00", entrada: 240, salida: 195 },
];

const alerts = [
  {
    id: 1,
    device: "SRV-PROD-01",
    message: "CPU supera el 90% de uso",
    severity: "critical",
    time: "Hace 5 min",
    location: "Sala de Servidores A",
  },
  {
    id: 2,
    device: "SW-PISO3-02",
    message: "Latencia de red elevada (>200ms)",
    severity: "high",
    time: "Hace 18 min",
    location: "Piso 3 - UCI",
  },
  {
    id: 3,
    device: "DB-POSTGRES-01",
    message: "Espacio en disco al 85%",
    severity: "medium",
    time: "Hace 42 min",
    location: "Sala de Servidores B",
  },
  {
    id: 4,
    device: "EQ-MED-VENTILADOR-07",
    message: "Sin datos en los últimos 10 min",
    severity: "high",
    time: "Hace 10 min",
    location: "UCI Neonatal",
  },
  {
    id: 5,
    device: "CAM-SEGURIDAD-12",
    message: "Reconexión automática exitosa",
    severity: "low",
    time: "Hace 1 hora",
    location: "Urgencias",
  },
];

const devices = [
  { name: "SRV-PROD-01", type: "Servidor", status: "online", cpu: 91, mem: 74, location: "Sala A" },
  { name: "SRV-PROD-02", type: "Servidor", status: "online", cpu: 45, mem: 61, location: "Sala A" },
  { name: "DB-POSTGRES-01", type: "Base de Datos", status: "online", cpu: 38, mem: 82, location: "Sala B" },
  { name: "SW-PISO3-02", type: "Switch", status: "warning", cpu: 22, mem: 34, location: "Piso 3" },
  { name: "EQ-MED-VENTILADOR-07", type: "Equipo Médico", status: "offline", cpu: 0, mem: 0, location: "UCI Neo" },
  { name: "AP-WIFI-URGENCIAS", type: "Access Point", status: "online", cpu: 15, mem: 28, location: "Urgencias" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Crítica",  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30" },
  high:     { label: "Alta",     color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  medium:   { label: "Media",    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  low:      { label: "Baja",     color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30" },
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  online:  { icon: <Wifi size={13} />,    label: "En línea",  color: "text-emerald-400" },
  offline: { icon: <WifiOff size={13} />, label: "Fuera de línea", color: "text-red-400" },
  warning: { icon: <AlertTriangle size={13} />, label: "Advertencia", color: "text-yellow-400" },
};

function UsageBar({ value, danger = 85 }: { value: number; danger?: number }) {
  const color = value >= danger ? "bg-red-500" : value >= 70 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-700">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-7 text-right">{value}%</span>
    </div>
  );
}

// ─── Sidebar nav items ─────────────────────────────────────────────────────────

const navItems = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard",   active: true  },
  { icon: <Server size={18} />,          label: "Dispositivos", active: false },
  { icon: <MapPin size={18} />,          label: "Ubicaciones",  active: false },
  { icon: <Activity size={18} />,        label: "Métricas",     active: false },
  { icon: <BellRing size={18} />,        label: "Alertas",      active: false },
  { icon: <Users size={18} />,           label: "Usuarios",     active: false },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  accent: string;
}

function KpiCard({ title, value, sub, icon, accent }: KpiCardProps) {
  return (
    <Card className="border-slate-700/60 bg-slate-800/50 backdrop-blur">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-3xl font-bold ${accent}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
          <div className={`p-2.5 rounded-xl ${accent.replace("text-", "bg-").replace("400", "500/15")}`}>
            <span className={accent}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onlineCount  = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" || a.severity === "high").length;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-slate-950 text-white font-sans">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className={`
            flex flex-col border-r border-slate-800 bg-slate-900
            transition-all duration-300 ease-in-out shrink-0
            ${sidebarOpen ? "w-56" : "w-16"}
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 min-h-[64px]">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white leading-tight">HUSRT</p>
                <p className="text-[10px] text-slate-400 leading-tight">Monitor TI</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 space-y-0.5 px-2">
            {navItems.map((item) => (
              <Tooltip key={item.label} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                      transition-colors duration-150 cursor-pointer
                      ${item.active
                        ? "bg-red-600/15 text-red-400 font-medium"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"}
                    `}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {sidebarOpen && item.active && <ChevronRight size={14} className="ml-auto text-red-400/60" />}
                  </button>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-2 border-t border-slate-800">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={18} className="shrink-0" />
                  {sidebarOpen && <span>Cerrar sesión</span>}
                </button>
              </TooltipTrigger>
              {!sidebarOpen && <TooltipContent side="right">Cerrar sesión</TooltipContent>}
            </Tooltip>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur min-h-[64px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-base font-semibold text-white">Dashboard de Monitoreo</h1>
                <p className="text-xs text-slate-500">Hospital Universitario San Rafael de Tunja</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En tiempo real
              </span>
              <Badge variant="outline" className="border-red-500/40 text-red-400 text-xs">
                {criticalAlerts} alertas activas
              </Badge>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Dispositivos activos"
                value={onlineCount}
                sub={`de ${devices.length} registrados`}
                icon={<Server size={20} />}
                accent="text-emerald-400"
              />
              <KpiCard
                title="Fuera de línea"
                value={offlineCount}
                sub="requieren revisión"
                icon={<WifiOff size={20} />}
                accent="text-red-400"
              />
              <KpiCard
                title="Alertas críticas"
                value={criticalAlerts}
                sub="últimas 24 horas"
                icon={<BellRing size={20} />}
                accent="text-orange-400"
              />
              <KpiCard
                title="Disponibilidad"
                value="99.2%"
                sub="uptime del sistema"
                icon={<CheckCircle2 size={20} />}
                accent="text-blue-400"
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* CPU Chart */}
              <Card className="border-slate-700/60 bg-slate-800/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                        <Cpu size={15} className="text-blue-400" />
                        Uso de CPU — SRV-PROD-01
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">Últimas 9 horas</CardDescription>
                    </div>
                    <Badge className="bg-blue-500/15 text-blue-400 border-0 text-xs">69%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={cpuData}>
                      <defs>
                        <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#cpuGrad)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Network Chart */}
              <Card className="border-slate-700/60 bg-slate-800/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                        <Activity size={15} className="text-purple-400" />
                        Tráfico de Red — Mbps
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">Entrada / Salida</CardDescription>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/> Entrada</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"/> Salida</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={networkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Line type="monotone" dataKey="entrada" stroke="#a78bfa" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="salida"  stroke="#22d3ee" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Bottom row: Devices + Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

              {/* Devices Table — 3 cols */}
              <Card className="border-slate-700/60 bg-slate-800/50 xl:col-span-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <HardDrive size={15} className="text-slate-400" />
                    Estado de Dispositivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="text-slate-500 text-xs pl-6">Dispositivo</TableHead>
                        <TableHead className="text-slate-500 text-xs">Estado</TableHead>
                        <TableHead className="text-slate-500 text-xs">CPU</TableHead>
                        <TableHead className="text-slate-500 text-xs pr-6">RAM</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((d) => {
                        const st = statusConfig[d.status];
                        return (
                          <TableRow key={d.name} className="border-slate-700/50 hover:bg-slate-700/20">
                            <TableCell className="pl-6 py-3">
                              <p className="text-sm font-medium text-white">{d.name}</p>
                              <p className="text-xs text-slate-500">{d.type} · {d.location}</p>
                            </TableCell>
                            <TableCell>
                              <span className={`flex items-center gap-1.5 text-xs font-medium ${st.color}`}>
                                {st.icon} {st.label}
                              </span>
                            </TableCell>
                            <TableCell className="w-28">
                              {d.status === "offline" ? (
                                <span className="text-xs text-slate-600">—</span>
                              ) : (
                                <UsageBar value={d.cpu} />
                              )}
                            </TableCell>
                            <TableCell className="pr-6 w-28">
                              {d.status === "offline" ? (
                                <span className="text-xs text-slate-600">—</span>
                              ) : (
                                <UsageBar value={d.mem} />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Alerts — 2 cols */}
              <Card className="border-slate-700/60 bg-slate-800/50 xl:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <BellRing size={15} className="text-orange-400" />
                    Alertas Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {alerts.map((a) => {
                    const sev = severityConfig[a.severity];
                    return (
                      <div
                        key={a.id}
                        className={`rounded-lg border px-3 py-2.5 ${sev.bg}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{a.device}</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{a.message}</p>
                          </div>
                          <Badge className={`shrink-0 border-0 text-[10px] px-1.5 py-0.5 ${sev.bg} ${sev.color}`}>
                            {sev.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-slate-500">
                          <Clock size={10} />
                          <span className="text-[10px]">{a.time} · {a.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-700 pb-2">
              Hospital Universitario San Rafael de Tunja · Sistema de Monitoreo TI · {new Date().getFullYear()}
            </p>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default DashboardPage;
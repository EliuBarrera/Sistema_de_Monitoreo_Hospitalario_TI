import { useRef, useState } from "react";
import { MapPin, Plus, Monitor, Building2, Layers, DoorOpen } from "lucide-react";
import type { Location } from "@/types/Location/Location";

// ─── Constantes layout ────────────────────────────────────────────────────────
const NODE_W = 148;
const NODE_H = 52;
const H_GAP  = 28;
const V_GAP  = 80;

// ─── Medición ─────────────────────────────────────────────────────────────────
interface Measured { node: Location; x: number; y: number; width: number; children: Measured[]; }

function measure(node: Location, depth: number, offsetX: number): Measured {
  const kids = Array.isArray(node.children) && node.children.length > 0 ? node.children : [];
  if (!kids.length) return { node, x: offsetX + NODE_W/2, y: depth*(NODE_H+V_GAP), width: NODE_W, children: [] };
  const mc: Measured[] = [];
  let cursor = offsetX;
  for (const c of kids) { const m = measure(c, depth+1, cursor); mc.push(m); cursor += m.width + H_GAP; }
  const total = cursor - offsetX - H_GAP;
  const cx = (mc[0].x + mc[mc.length-1].x) / 2;
  return { node, x: cx, y: depth*(NODE_H+V_GAP), width: total, children: mc };
}
function flatten(m: Measured, acc: Measured[] = []): Measured[] { acc.push(m); for (const c of m.children) flatten(c, acc); return acc; }
function collectEdges(m: Measured): {x1:number;y1:number;x2:number;y2:number}[] {
  const e: {x1:number;y1:number;x2:number;y2:number}[] = [];
  for (const c of m.children) { e.push({x1:m.x,y1:m.y+NODE_H,x2:c.x,y2:c.y}); e.push(...collectEdges(c)); }
  return e;
}

// ─── Tooltip nodo ─────────────────────────────────────────────────────────────
interface NodeTooltipProps { node: Location; devCount: number; onAdd: ()=>void; onSelect: ()=>void; }
function NodeTooltip({ node, devCount, onAdd, onSelect }: NodeTooltipProps) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-60 rounded-xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden"
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{node.name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">ID #{node.id} · {devCount} dispositivo{devCount !== 1 ? "s" : ""}</p>
      </div>
      <div className="px-4 py-2 space-y-1">
        {node.building && <MiniRow icon={<Building2 size={10}/>} label="Edificio" value={node.building}/>}
        {node.floor != null && <MiniRow icon={<Layers size={10}/>} label="Piso" value={`Piso ${node.floor}`}/>}
        {node.room && <MiniRow icon={<DoorOpen size={10}/>} label="Sala" value={node.room}/>}
      </div>
      <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onSelect} className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-[#4a5296] hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors border-r border-slate-100 dark:border-slate-800">
          <Monitor size={11}/>Ver dispositivos
        </button>
        <button onClick={onAdd} className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors">
          <Plus size={11}/>Agregar aquí
        </button>
      </div>
    </div>
  );
}
function MiniRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[10px] text-slate-500">{label}:</span>
      <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">{value}</span>
    </div>
  );
}

// ─── Nodo ─────────────────────────────────────────────────────────────────────
interface TreeNodeProps { m: Measured; selectedId: number|null; devCount: number; onSelect:(id:number)=>void; onAdd:(id:number)=>void; }
function TreeNode({ m, selectedId, devCount, onSelect, onAdd }: TreeNodeProps) {
  const { node, x, y } = m;
  const isSelected = node.id === selectedId;
  const isRoot     = node.parent_location_id == null;
  const isLeaf     = m.children.length === 0;
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const show = () => { timer.current = setTimeout(()=>setTip(true), 260); };
  const hide = () => { if(timer.current) clearTimeout(timer.current); setTip(false); };

  const base = isRoot
    ? "bg-[#4a5296] text-white border-[#3a4286]"
    : isLeaf
      ? "bg-emerald-500 text-white border-emerald-600"
      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600";

  // Borde amarillo cuando está seleccionado
  const selectedStyle = isSelected
    ? "ring-4 ring-offset-1 scale-110 shadow-xl"
    : "hover:scale-105 shadow-md";

  return (
    <div
      className="absolute"
      style={{
        left: x - NODE_W/2, top: y, width: NODE_W, height: NODE_H,
        zIndex: tip ? 50 : isSelected ? 10 : 1,
      }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={() => { hide(); onSelect(node.id); }}
    >
      <div
        className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center px-2 cursor-pointer select-none transition-all duration-200 ${base} ${selectedStyle}`}
        style={isSelected ? { borderColor: "#FFDE21", boxShadow: "0 0 0 4px #FFDE2166" } : {}}
      >
        <div className="flex items-center gap-1">
          <MapPin size={11} className="shrink-0 opacity-80"/>
          <span className="text-[11px] font-semibold leading-tight line-clamp-1 text-center" title={node.name}>
            {node.name}
          </span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 font-semibold ${isRoot || isLeaf ? "bg-white/20 text-white" : "bg-[#4a5296]/10 text-[#4a5296] dark:text-indigo-300"}`}>
          {devCount} disp.
        </span>
      </div>
      {isSelected && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{backgroundColor:"#FFDE21"}}/>
          <span className="relative inline-flex rounded-full h-3 w-3" style={{backgroundColor:"#FFDE21"}}/>
        </span>
      )}
      {tip && (
        <NodeTooltip
          node={node} devCount={devCount}
          onAdd={() => { hide(); onAdd(node.id); }}
          onSelect={() => { hide(); onSelect(node.id); }}
        />
      )}
    </div>
  );
}

// ─── Árbol público ────────────────────────────────────────────────────────────
interface DeviceTreeProps {
  locations:     Location[];
  selectedId:    number | null;
  devCountByLoc: Record<number, number>;
  onSelect:      (id: number) => void;
  onAdd:         (id: number) => void;
}

export function DeviceTree({ locations, selectedId, devCountByLoc, onSelect, onAdd }: DeviceTreeProps) {
  if (!locations.length) return (
    <div className="py-12 text-center text-xs text-slate-400">Sin ubicaciones registradas</div>
  );
  const roots: Measured[] = [];
  let cursor = 0;
  for (const loc of locations) { const m = measure(loc, 0, cursor); roots.push(m); cursor += m.width + H_GAP*2; }
  const allNodes = roots.flatMap(r => flatten(r));
  const allEdges = roots.flatMap(r => collectEdges(r));
  const canvasW  = Math.max(cursor - H_GAP*2, 400);
  const canvasH  = Math.max(...allNodes.map(n => n.y)) + NODE_H + 16;

  return (
    <div className="w-full overflow-auto">
      <div className="relative mx-auto" style={{ width: canvasW, height: canvasH }}>
        <svg className="absolute inset-0 pointer-events-none overflow-visible" width={canvasW} height={canvasH}>
          {allEdges.map((e,i) => {
            const my = (e.y1+e.y2)/2;
            return <path key={i} d={`M${e.x1},${e.y1} C${e.x1},${my} ${e.x2},${my} ${e.x2},${e.y2}`} fill="none" stroke="#cbd5e1" strokeWidth={1.5} className="dark:stroke-slate-700"/>;
          })}
        </svg>
        {allNodes.map(mn => (
          <TreeNode key={mn.node.id} m={mn} selectedId={selectedId} devCount={devCountByLoc[mn.node.id]??0} onSelect={onSelect} onAdd={onAdd}/>
        ))}
      </div>
    </div>
  );
}
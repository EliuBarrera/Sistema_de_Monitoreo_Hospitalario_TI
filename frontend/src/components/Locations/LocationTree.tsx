import { useRef, useState } from "react";
import {
  MapPin, Plus, Pencil, Trash2,
  Building2, Layers, DoorOpen,
} from "lucide-react";
import type { Location } from "@/types/Location/Location";

// ─── Props públicas ───────────────────────────────────────────────────────────

interface LocationTreeProps {
  locations:    Location[];
  highlightId:  number | null;
  forceOpenIds: Set<number>;
  onAdd:        (node: Location) => void;
  onEdit:       (node: Location) => void;
  onDelete:     (node: Location) => void;
}

// ─── Constantes de layout ─────────────────────────────────────────────────────

const NODE_W    = 148;  // ancho del nodo en px
const NODE_H    = 48;   // alto del nodo en px
const H_GAP     = 24;   // espacio horizontal entre nodos hermanos
const V_GAP     = 72;   // espacio vertical entre niveles

// ─── Medición del árbol ───────────────────────────────────────────────────────

interface Measured {
  node:     Location;
  x:        number;   // centro X del nodo
  y:        number;   // top Y del nodo
  width:    number;   // ancho total del subárbol
  children: Measured[];
}

function measure(node: Location, depth: number, offsetX: number): Measured {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  if (!hasChildren) {
    return {
      node,
      x: offsetX + NODE_W / 2,
      y: depth * (NODE_H + V_GAP),
      width: NODE_W,
      children: [],
    };
  }

  // Medir hijos
  const measuredChildren: Measured[] = [];
  let cursor = offsetX;
  for (const child of node.children!) {
    const m = measure(child, depth + 1, cursor);
    measuredChildren.push(m);
    cursor += m.width + H_GAP;
  }
  const totalWidth = cursor - offsetX - H_GAP;

  // Centro del padre = centro del span de sus hijos
  const firstChild = measuredChildren[0];
  const lastChild  = measuredChildren[measuredChildren.length - 1];
  const cx         = (firstChild.x + lastChild.x) / 2;

  return {
    node,
    x: cx,
    y: depth * (NODE_H + V_GAP),
    width: totalWidth,
    children: measuredChildren,
  };
}

/** Aplana el árbol medido en una lista de nodos con posición absoluta */
function flatten(m: Measured, acc: Measured[] = []): Measured[] {
  acc.push(m);
  for (const c of m.children) flatten(c, acc);
  return acc;
}

/** Genera las líneas SVG padre→hijo */
function collectEdges(m: Measured): { x1: number; y1: number; x2: number; y2: number }[] {
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const child of m.children) {
    edges.push({
      x1: m.x,
      y1: m.y + NODE_H,
      x2: child.x,
      y2: child.y,
    });
    edges.push(...collectEdges(child));
  }
  return edges;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function LocationTree({
  locations, highlightId, forceOpenIds, onAdd, onEdit, onDelete,
}: LocationTreeProps) {
  if (!locations || locations.length === 0) {
    return (
      <div className="py-16 text-center">
        <MapPin size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No hay ubicaciones registradas
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Crea la ubicación raíz para comenzar
        </p>
      </div>
    );
  }

  // Medimos cada raíz y las distribuimos horizontalmente
  const roots: Measured[] = [];
  let cursor = 0;
  for (const loc of locations) {
    const m = measure(loc, 0, cursor);
    roots.push(m);
    cursor += m.width + H_GAP * 2;
  }

  const allNodes = roots.flatMap(r => flatten(r));
  const allEdges = roots.flatMap(r => collectEdges(r));

  const canvasW = Math.max(cursor - H_GAP * 2, 300);
  const maxY    = Math.max(...allNodes.map(n => n.y)) + NODE_H;
  const canvasH = maxY + 16;

  return (
    <div className="w-full overflow-x-auto overflow-y-visible pb-4">
      <div
        className="relative mx-auto"
        style={{ width: canvasW, height: canvasH }}
      >
        {/* SVG de líneas conectoras */}
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          width={canvasW}
          height={canvasH}
        >
          {allEdges.map((e, i) => {
            const midY = (e.y1 + e.y2) / 2;
            return (
              <path
                key={i}
                d={`M${e.x1},${e.y1} C${e.x1},${midY} ${e.x2},${midY} ${e.x2},${e.y2}`}
                fill="none"
                stroke="var(--edge-color, #cbd5e1)"
                strokeWidth={1.5}
                className="dark:[--edge-color:#334155]"
              />
            );
          })}
        </svg>

        {/* Nodos */}
        {allNodes.map(m => (
          <TreeNode
            key={m.node.id}
            measured={m}
            highlightId={highlightId}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Nodo individual ──────────────────────────────────────────────────────────

interface TreeNodeProps {
  measured:    Measured;
  highlightId: number | null;
  onAdd:       (node: Location) => void;
  onEdit:      (node: Location) => void;
  onDelete:    (node: Location) => void;
}

function TreeNode({ measured, highlightId, onAdd, onEdit, onDelete }: TreeNodeProps) {
  const { node, x, y } = measured;
  const isHighlighted   = node.id === highlightId;
  const hasChildren     = measured.children.length > 0;
  const isRoot          = node.parent_location_id == null;
  const isLeaf          = !hasChildren;

  const [tooltip, setTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => { timerRef.current = setTimeout(() => setTooltip(true), 260); };
  const hideTooltip = () => { if (timerRef.current) clearTimeout(timerRef.current); setTooltip(false); };

  // Color del nodo según tipo
  const nodeStyle = isRoot
    ? "bg-[#4a5296] text-white border-[#3a4286] shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
    : isLeaf
      ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-100 dark:shadow-emerald-900/30"
      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-md";

  const highlightRing = isHighlighted
    ? "ring-2 ring-offset-2 ring-amber-400"
    : "";

  return (
    <div
      className="absolute"
      style={{
        left:      x - NODE_W / 2,
        top:       y,
        width:     NODE_W,
        height:    NODE_H,
        zIndex:    tooltip ? 50 : 1,
      }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {/* Cuerpo del nodo */}
      <div
        className={`
          w-full h-full rounded-xl border-2 flex items-center gap-1.5
          px-3 cursor-default select-none transition-transform duration-150
          hover:scale-105 ${nodeStyle} ${highlightRing}
        `}
      >
        <MapPin size={12} className="shrink-0 opacity-80" />
        <span
          className="text-[11px] font-semibold leading-tight line-clamp-2 text-center w-full"
          title={node.name}
        >
          {node.name}
        </span>
      </div>

      {/* Pulso si es resultado de búsqueda */}
      {isHighlighted && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
        </span>
      )}

      {/* Tooltip */}
      {tooltip && (
        <NodeTooltip
          node={node}
          onAdd={() => { hideTooltip(); onAdd(node); }}
          onEdit={() => { hideTooltip(); onEdit(node); }}
          onDelete={() => { hideTooltip(); onDelete(node); }}
        />
      )}
    </div>
  );
}

// ─── Tooltip flotante ─────────────────────────────────────────────────────────

interface TooltipProps {
  node: Location; onAdd: () => void; onEdit: () => void; onDelete: () => void;
}

function NodeTooltip({ node, onAdd, onEdit, onDelete }: TooltipProps) {
  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50
        w-64 rounded-xl shadow-2xl
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-700
        overflow-hidden
      "
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Cabecera */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
          {node.name}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">ID #{node.id}</p>
      </div>

      {/* Detalles */}
      <div className="px-4 py-2.5 space-y-1.5">
        <DetailRow icon={<Building2 size={11} />} label="Edificio" value={node.building} />
        <DetailRow icon={<Layers size={11} />}    label="Piso"     value={node.floor != null ? `Piso ${node.floor}` : null} />
        <DetailRow icon={<DoorOpen size={11} />}  label="Sala"     value={node.room} />
        {node.description && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug pt-0.5">
            {node.description}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800">
        <ActionBtn icon={<Plus size={13} />}   label="Agregar"  className="text-[#4a5296] hover:bg-indigo-50 dark:hover:bg-slate-800" onClick={onAdd} />
        <ActionBtn icon={<Pencil size={13} />} label="Editar"   className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-x border-slate-100 dark:border-slate-800" onClick={onEdit} />
        <ActionBtn icon={<Trash2 size={13} />} label="Eliminar" className="text-red-500 hover:bg-red-50 dark:hover:bg-slate-800" onClick={onDelete} />
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="text-[10px] text-slate-500 shrink-0">{label}:</span>
      <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">{value}</span>
    </div>
  );
}

function ActionBtn({ icon, label, className, onClick }: {
  icon: React.ReactNode; label: string; className?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${className}`}
    >
      {icon}{label}
    </button>
  );
}
import { useEffect, useRef, useState } from "react";
import { Search, X, MapPin, ChevronRight } from "lucide-react";
import type { Location } from "@/types/Location/Location";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SearchResult {
  node:        Location;   // el nodo que coincide
  path:        Location[]; // [raíz, ..., padre, nodo]
  ancestorIds: number[];   // ids de todos los antecesores (sin el nodo mismo)
}

interface LocationSearchBarProps {
  /** Árbol completo devuelto por getLocations() */
  tree: Location[];
  /** Se llama al seleccionar un resultado */
  onSelect: (node: Location, ancestorIds: number[]) => void;
  /** Se llama al limpiar la búsqueda */
  onClear: () => void;
}

// ─── Utilidades de búsqueda ───────────────────────────────────────────────────

/**
 * Recorre el árbol recursivamente y devuelve todos los nodos
 * cuyo nombre contiene `query` (case-insensitive), junto con
 * su camino desde la raíz y los ids de sus antecesores.
 */
function searchTree(
  nodes: Location[],
  query: string,
  ancestors: Location[] = []
): SearchResult[] {
  const results: SearchResult[] = [];
  const q = query.toLowerCase().trim();

  for (const node of nodes) {
    const path = [...ancestors, node];

    if (node.name.toLowerCase().includes(q)) {
      results.push({
        node,
        path,
        ancestorIds: ancestors.map(a => a.id),
      });
    }

    // Seguir buscando en los hijos aunque el padre ya coincida
    if (node.children?.length) {
      results.push(...searchTree(node.children, query, path));
    }
  }

  return results;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function LocationSearchBar({ tree, onSelect, onClear }: LocationSearchBarProps) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open,    setOpen]    = useState(false);
  const [active,  setActive]  = useState(-1); // índice activo para teclado
  const inputRef              = useRef<HTMLInputElement>(null);
  const listRef               = useRef<HTMLDivElement>(null);

  // Búsqueda reactiva al cambiar el query
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const found = searchTree(tree, query);
    setResults(found);
    setOpen(found.length > 0);
    setActive(-1);
  }, [query, tree]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.node.name);
    setOpen(false);
    onSelect(result.node, result.ancestorIds);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setActive(-1);
    onClear();
    inputRef.current?.focus();
  };

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      handleSelect(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className="
        flex items-center gap-2 px-3 py-2
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl transition-shadow
        focus-within:ring-2 focus-within:ring-[#4a5296]/30 focus-within:border-[#4a5296]/60
      ">
        <Search size={15} className="text-slate-400 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar ubicación por nombre…"
          className="
            flex-1 bg-transparent text-sm
            text-slate-800 dark:text-slate-200
            placeholder:text-slate-400 dark:placeholder:text-slate-600
            outline-none
          "
        />

        {query && (
          <button
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {open && (
        <div
          ref={listRef}
          className="
            absolute top-full left-0 right-0 mt-2 z-50
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-800
            rounded-xl shadow-xl overflow-hidden
            max-h-72 overflow-y-auto
          "
        >
          {/* Cabecera del dropdown */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              ↑↓ navegar · Enter seleccionar
            </span>
          </div>

          {/* Lista de resultados */}
          {results.map((result, i) => (
            <button
              key={result.node.id}
              onMouseDown={() => handleSelect(result)}
              onMouseEnter={() => setActive(i)}
              className={`
                w-full text-left px-3 py-2.5 transition-colors
                border-b border-slate-50 dark:border-slate-800/50 last:border-0
                ${active === i
                  ? "bg-indigo-50 dark:bg-slate-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }
              `}
            >
              {/* Nombre del nodo */}
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={12} className="text-[#4a5296] shrink-0" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  <Highlight text={result.node.name} query={query} />
                </span>
              </div>

              {/* Breadcrumb del path */}
              <div className="flex items-center gap-1 flex-wrap ml-4">
                {result.path.slice(0, -1).map((ancestor, j) => (
                  <span key={ancestor.id} className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">
                      {ancestor.name}
                    </span>
                    {j < result.path.length - 2 && (
                      <ChevronRight size={9} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                  </span>
                ))}
                {result.path.length > 1 && (
                  <ChevronRight size={9} className="text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                <span className="text-[10px] font-medium text-[#4a5296] dark:text-indigo-400">
                  {result.node.name}
                </span>
              </div>

              {/* Badges adicionales */}
              <div className="flex items-center gap-1.5 mt-1 ml-4">
                {result.node.building && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {result.node.building}
                  </span>
                )}
                {result.node.floor != null && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Piso {result.node.floor}
                  </span>
                )}
                {result.node.room && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#4a5296] dark:text-indigo-300">
                    {result.node.room}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helper: resalta el texto que coincide con la búsqueda ───────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#4a5296]/15 text-[#4a5296] dark:text-indigo-300 rounded px-0.5 not-italic">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
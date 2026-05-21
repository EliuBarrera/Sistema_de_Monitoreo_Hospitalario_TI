import { useEffect, useState } from "react";
import { X, Tag, FileText, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeviceType } from "@/types/Device/DeviceType/DeviceType";

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface DeviceTypeForm {
    name: string;
    description: string;
}

interface DeviceTypeModalProps {
    open: boolean;
    onClose: () => void;
    deviceTypes: DeviceType[];
    onCreate: (data: DeviceTypeForm) => Promise<void>;
    onUpdate: (id: number, data: DeviceTypeForm) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const EMPTY_FORM: DeviceTypeForm = { name: "", description: "" };

// ─── Componente ───────────────────────────────────────────────────────────────

export function DeviceTypeModal({
    open, onClose, deviceTypes, onCreate, onUpdate, onDelete,
}: DeviceTypeModalProps) {

    const [form, setForm] = useState<DeviceTypeForm>(EMPTY_FORM);
    const [editId, setEditId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState("");

    // Limpiar al abrir
    useEffect(() => {
        if (open) { setForm(EMPTY_FORM); setEditId(null); setError(""); }
    }, [open]);

    // ── Seleccionar para editar ───────────────────────────────────────────────
    const startEdit = (dt: DeviceType) => {
        setEditId(dt.id);
        setForm({ name: dt.name, description: dt.description ?? "" });
        setError("");
    };

    const cancelEdit = () => {
        setEditId(null);
        setForm(EMPTY_FORM);
        setError("");
    };

    // ── Submit crear / actualizar ─────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.name.trim()) { setError("El nombre es obligatorio."); return; }
        setSaving(true);
        setError("");
        try {
            if (editId !== null) {
                await onUpdate(editId, form);
                cancelEdit();
            } else {
                await onCreate(form);
                setForm(EMPTY_FORM);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    // ── Eliminar ──────────────────────────────────────────────────────────────
    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este tipo de dispositivo? Si tiene dispositivos asociados la operación fallará.")) return;
        setDeleting(id);
        try {
            await onDelete(id);
            if (editId === id) cancelEdit();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "No se pudo eliminar.");
        } finally {
            setDeleting(null);
        }
    };

    const isEditing = editId !== null;

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden">

                {/* ── Header ── */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#4a5296" }}>
                            <Tag size={15} className="text-white" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Tipos de dispositivo
                        </DialogTitle>
                        <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {deviceTypes.length} registrado{deviceTypes.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-0 max-h-[75vh] overflow-hidden">

                    {/* ── Formulario crear / editar ── */}
                    <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors ${isEditing ? "bg-indigo-50/60 dark:bg-indigo-950/20" : ""}`}>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                            {isEditing ? "✏️  Editando tipo" : "➕  Nuevo tipo"}
                        </p>
                        <div className="flex gap-2 items-start">
                            {/* Nombre */}
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-slate-600 dark:text-slate-400">Nombre *</Label>
                                <Input
                                    placeholder="Ej: Servidor físico, Switch, Firewall…"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                    className="text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            {/* Descripción */}
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-slate-600 dark:text-slate-400">Descripción</Label>
                                <Input
                                    placeholder="Descripción breve…"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                    className="text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            {/* Botones acción */}
                            <div className="flex items-end gap-1.5 pb-0.5 pt-5">
                                <Button
                                    disabled={saving || !form.name.trim()}
                                    onClick={handleSubmit}
                                    size="sm"
                                    className="text-white text-xs h-9 px-3 shrink-0"
                                    style={{ backgroundColor: "#4a5296" }}
                                >
                                    {saving
                                        ? <Loader2 size={13} className="animate-spin" />
                                        : isEditing
                                            ? <><Pencil size={12} className="mr-1" />Guardar</>
                                            : <><Plus size={12} className="mr-1" />Crear</>
                                    }
                                </Button>
                                {isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEdit}
                                        className="text-xs h-9 px-3 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shrink-0"
                                    >
                                        <X size={12} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                <X size={11} />{error}
                            </p>
                        )}
                    </div>

                    {/* ── Lista de tipos existentes ── */}
                    <div className="overflow-y-auto flex-1">
                        {deviceTypes.length === 0 ? (
                            <div className="py-12 text-center">
                                <Tag size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                <p className="text-sm text-slate-400 dark:text-slate-500">Sin tipos registrados</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Crea el primero usando el formulario de arriba</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                {deviceTypes.map(dt => {
                                    const isSelected = editId === dt.id;
                                    return (
                                        <li
                                            key={dt.id}
                                            className={`flex items-center gap-3 px-6 py-3 group transition-colors ${isSelected
                                                    ? "bg-indigo-50 dark:bg-indigo-950/30"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                                }`}
                                        >
                                            {/* Ícono */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-[#4a5296] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                                }`}>
                                                <Tag size={13} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isSelected ? "text-[#4a5296] dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"}`}>
                                                    {dt.name}
                                                </p>
                                                {dt.description && (
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                                        <FileText size={9} />{dt.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* ID badge */}
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono shrink-0">
                                                #{dt.id}
                                            </span>

                                            {/* Acciones */}
                                            <div className={`flex items-center gap-1 transition-opacity shrink-0 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                                <button
                                                    onClick={() => isSelected ? cancelEdit() : startEdit(dt)}
                                                    className={`p-1.5 rounded-lg transition-colors ${isSelected
                                                            ? "bg-indigo-100 dark:bg-indigo-900/40 text-[#4a5296] dark:text-indigo-300"
                                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#4a5296]"
                                                        }`}
                                                    title={isSelected ? "Cancelar edición" : "Editar"}
                                                >
                                                    {isSelected ? <X size={12} /> : <Pencil size={12} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dt.id)}
                                                    disabled={deleting === dt.id}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                    title="Eliminar"
                                                >
                                                    {deleting === dt.id
                                                        ? <Loader2 size={12} className="animate-spin" />
                                                        : <Trash2 size={12} />
                                                    }
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}   
// src/pages/devices/DevicePage.tsx

import { useMemo, useState } from "react";

import {
  MapPin,
  Monitor,
} from "lucide-react";

import type { Device } from "@/types/Device/Device";
import type { CreateDeviceDTO } from "@/types/Device/CreateDeviceDTO";
import type { UpdateDeviceDTO } from "@/types/Device/UpdateDeviceDTO";

import { useDevices } from "@/hooks/useDevices";

import DeviceToolbar from "@/components/Devices/DeviceToolbar";
import { DeviceTree } from "@/components/Devices/DeviceTree";
import DeviceTable from "@/components/Devices/DeviceTable";
import DeviceModal from "@/components/Devices/DeviceModal";
import { DeviceTypeModal } from "@/components/Devices/DeviceTypeModal";

import { AlertPanel } from "@/components/Alerts/AlertPanel";
import { MetricPanel } from "@/components/Metrics/MetricPanel";

function DevicePage() {

  // ─── Hook ───────────────────────────────────────────────────────────────

  const {
    devices,
    deviceTypes,
    locations,
    loading,

    create,
    update,
    remove,

    reload,
  } = useDevices();

  // ─── State ──────────────────────────────────────────────────────────────

  const [search, setSearch] =
    useState("");

  const [selectedLoc, setSelectedLoc] =
    useState<number | null>(null);

  const [selectedDev, setSelectedDev] =
    useState<Device | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [deviceTypeModalOpen,
    setDeviceTypeModalOpen] =
    useState(false);

  const [editingDevice,
    setEditingDevice] =
    useState<Device | null>(null);

  const [preLocId,
    setPreLocId] =
    useState<number | null>(null);

  // ─── Device Count ──────────────────────────────────────────────────────

  const devCountByLoc =
    useMemo(() => {

      return devices.reduce<
        Record<number, number>
      >((acc, dev) => {

        if (
          dev.location_id != null
        ) {

          acc[dev.location_id] =
            (acc[dev.location_id] ?? 0) + 1;
        }

        return acc;

      }, {});

    }, [devices]);

  // ─── Filters ───────────────────────────────────────────────────────────

  const filteredDevices =
    useMemo(() => {

      return devices.filter((dev) => {

        const matchesSearch =
          !search.trim() ||

          dev.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          dev.serial_number
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          (dev.ip_address ?? "")
            .includes(search);

        const matchesLocation =
          selectedLoc == null ||
          dev.location_id === selectedLoc;

        return (
          matchesSearch &&
          matchesLocation
        );

      });

    }, [
      devices,
      search,
      selectedLoc,
    ]);

  // ─── Actions ───────────────────────────────────────────────────────────

  function handleSelectLocation(
    id: number
  ) {

    setSelectedLoc((prev) =>
      prev === id ? null : id
    );

    setSelectedDev(null);
  }

  function handleOpenCreate(
    locId?: number
  ) {

    setEditingDevice(null);

    setPreLocId(
      locId ?? null
    );

    setModalOpen(true);
  }

  function handleOpenEdit(
    device: Device
  ) {

    setEditingDevice(device);

    setPreLocId(null);

    setModalOpen(true);
  }

  async function handleSave(
    data:
      | CreateDeviceDTO
      | UpdateDeviceDTO
  ) {

    if (editingDevice) {

      await update(
        editingDevice.id,
        data as UpdateDeviceDTO
      );

      return;
    }

    await create(
      data as CreateDeviceDTO
    );
  }

  async function handleDelete(
    id: number
  ) {

    const confirmed =
      confirm(
        "¿Eliminar este dispositivo?"
      );

    if (!confirmed) return;

    await remove(id);

    if (
      selectedDev?.id === id
    ) {
      setSelectedDev(null);
    }
  }

  // ─── Device Types CRUD ────────────────────────────────────────────────

  async function handleDeviceTypeCreate() {
    await reload();
  }

  async function handleDeviceTypeUpdate() {
    await reload();
  }

  async function handleDeviceTypeDelete() {
    await reload();
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div
      className="
        min-h-screen
        bg-slate-50 dark:bg-slate-950
        pb-28
      "
    >

      {/* Toolbar */}
      <DeviceToolbar
        search={search}
        setSearch={setSearch}

        selectedLoc={selectedLoc}
        locations={locations}

        onClearLocation={() => {
          setSelectedLoc(null);
          setSelectedDev(null);
        }}

        onOpenDeviceTypes={() =>
          setDeviceTypeModalOpen(true)
        }

        onOpenCreate={() =>
          handleOpenCreate(
            selectedLoc ?? undefined
          )
        }
      />

      {/* Layout */}
      <div
        className="
          p-6
          grid grid-cols-2
          gap-5
          items-start
        "
      >

        {/* Left */}
        <div
          className="
            bg-white dark:bg-slate-900
            border border-slate-200
            dark:border-slate-800
            rounded-2xl
            overflow-hidden
          "
        >

          <div
            className="
              px-5 py-3
              border-b border-slate-100
              dark:border-slate-800
              flex items-center gap-2
            "
          >

            <MapPin
              size={14}
              className="text-[#4a5296]"
            />

            <span
              className="
                text-sm font-semibold
                text-slate-700
                dark:text-slate-200
              "
            >
              Ubicaciones
            </span>

          </div>

          <div
            className="
              p-4
              min-h-[340px]
              overflow-auto
            "
          >

            <DeviceTree
              locations={locations}
              selectedId={selectedLoc}
              devCountByLoc={
                devCountByLoc
              }
              onSelect={
                handleSelectLocation
              }
              onAdd={(id) =>
                handleOpenCreate(id)
              }
            />

          </div>

        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">

          {/* Devices */}
          <div
            className="
              bg-white dark:bg-slate-900
              border border-slate-200
              dark:border-slate-800
              rounded-2xl
              overflow-hidden
            "
          >

            <div
              className="
                px-5 py-3
                border-b border-slate-100
                dark:border-slate-800
                flex items-center gap-2
              "
            >

              <Monitor
                size={14}
                className="text-[#4a5296]"
              />

              <span
                className="
                  text-sm font-semibold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                Dispositivos
              </span>

              <span
                className="
                  text-[10px]
                  text-slate-400
                "
              >
                {selectedLoc
                  ? `${filteredDevices.length} en esta ubicación`
                  : `${devices.length} total`}
              </span>

            </div>

            <DeviceTable
              devices={filteredDevices}
              selectedDevice={selectedDev}
              deviceTypes={deviceTypes}
              loading={loading}

              onSelect={(dev) =>
                setSelectedDev((prev) =>
                  prev?.id === dev.id
                    ? null
                    : dev
                )
              }

              onEdit={
                handleOpenEdit
              }

              onDelete={
                handleDelete
              }
            />

          </div>

          {/* Alerts */}
          <AlertPanel
            device={selectedDev}
          />

          {/* Metrics */}
          <MetricPanel
            device={selectedDev}
          />

        </div>

      </div>

      {/* Device Modal */}
      <DeviceModal
        open={modalOpen}

        onClose={() =>
          setModalOpen(false)
        }

        onSave={handleSave}

        deviceTypes={deviceTypes}

        locations={locations}

        initial={editingDevice}

        preLocId={preLocId}
      />

      {/* Device Types Modal */}
      <DeviceTypeModal
        open={
          deviceTypeModalOpen
        }

        onClose={() =>
          setDeviceTypeModalOpen(false)
        }

        deviceTypes={deviceTypes}

        onCreate={
          handleDeviceTypeCreate
        }

        onUpdate={
          handleDeviceTypeUpdate
        }

        onDelete={
          handleDeviceTypeDelete
        }
      />

    </div>
  );
}

export default DevicePage;
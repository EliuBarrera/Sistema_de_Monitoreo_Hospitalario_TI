import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ServerCog,
} from "lucide-react";

import {
  createDevice,
} from "@/api/device_service";

import type {
  CreateDeviceDTO,
} from "@/types/Device/CreateDeviceDTO";

import DeviceForm from "@/components/Devices/DeviceForm";

import { Button } from "@/components/ui/button";

function CreateDevicePage() {

  const navigate = useNavigate();

  async function handleCreate(
    data: CreateDeviceDTO
  ) {

    try {

      await createDevice(data);

      navigate("/devices");

    } catch (error) {

      console.error(error);

    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      <header className="
        bg-white dark:bg-slate-900
        border-b border-slate-200 dark:border-slate-800
        px-6 py-4
      ">

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            onClick={() => navigate("/devices")}
            className="p-2 h-9 w-9 rounded-xl"
          >
            <ArrowLeft size={18} />
          </Button>

          <div className="flex items-center gap-3">

            <div className="
              p-2 rounded-xl
              bg-slate-100 dark:bg-slate-800
            ">

              <ServerCog
                size={18}
                className="
                  text-slate-600
                  dark:text-slate-300
                "
              />

            </div>

            <div>

              <h1 className="
                text-base font-semibold
                text-slate-900 dark:text-slate-100
              ">
                Crear Dispositivo
              </h1>

              <p className="
                text-xs
                text-slate-500 dark:text-slate-400
              ">
                Registrar nuevo dispositivo TI
              </p>

            </div>
          </div>
        </div>
      </header>

      <main className="p-6">

        <div className="
          max-w-2xl mx-auto
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-2xl p-6
        ">

          <DeviceForm
            onSubmit={handleCreate}
          />

        </div>
      </main>
    </div>
  );
}

export default CreateDevicePage;
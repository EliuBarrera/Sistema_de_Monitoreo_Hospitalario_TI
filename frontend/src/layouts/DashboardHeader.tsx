// src/components/layout/DashboardHeader.tsx

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  criticalAlerts?: number;
}

function DashboardHeader({
  title,
  subtitle = "Hospital Universitario San Rafael de Tunja",
  criticalAlerts = 0,
}: DashboardHeaderProps) {

  const [darkMode, setDarkMode] =
    useState(true);

  useEffect(() => {

    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme === "light") {

      document.documentElement
        .classList.remove("dark");

      setDarkMode(false);

    } else {

      document.documentElement
        .classList.add("dark");

      setDarkMode(true);
    }

  }, []);

  const toggleTheme = () => {

    const html =
      document.documentElement;

    if (darkMode) {

      html.classList.remove("dark");

      localStorage.setItem(
        "theme",
        "light"
      );

    } else {

      html.classList.add("dark");

      localStorage.setItem(
        "theme",
        "dark"
      );
    }

    setDarkMode(!darkMode);
  };

  return (
    <header
      className="
        sticky top-0 z-40
        flex items-center justify-between
        px-6 py-4
        border-b
        border-slate-200 dark:border-slate-800
        bg-white/80 dark:bg-slate-900/80
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-white/60
        dark:supports-[backdrop-filter]:bg-slate-900/60
        shadow-sm
      "
    >

      {/* Left */}
      <div>

        <h1
          className="
            text-base
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          {title}
        </h1>

        <p
          className="
            text-xs
            text-slate-500
          "
        >
          {subtitle}
        </p>

      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        <span
          className="
            flex items-center
            gap-1.5
            text-xs
            text-emerald-400
          "
        >

          <span
            className="
              w-1.5
              h-1.5
              rounded-full
              bg-emerald-400
              animate-pulse
            "
          />

          En tiempo real

        </span>

        <Badge
          variant="outline"
          className="
            border-red-500/40
            text-red-400
            text-xs
          "
        >
          {criticalAlerts} alertas activas
        </Badge>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="
            border-slate-700
            bg-transparent
          "
        >

          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}

        </Button>

      </div>

    </header>
  );
}

export default DashboardHeader;
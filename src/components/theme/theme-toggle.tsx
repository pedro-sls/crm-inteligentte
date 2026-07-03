"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark" | "system";

const storageKey = "crm-inteligentte-theme";

function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);

  document.documentElement.classList.toggle("dark", shouldUseDark);
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
}

function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const notify = () => {
    if (getStoredTheme() === "system") {
      applyTheme("system");
    }
    callback();
  };

  window.addEventListener("storage", notify);
  window.addEventListener("crm-theme-change", notify);
  media.addEventListener("change", notify);

  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("crm-theme-change", notify);
    media.removeEventListener("change", notify);
  };
}

function getServerThemeSnapshot(): ThemeMode {
  return "system";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, getServerThemeSnapshot);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function nextTheme() {
    const next: ThemeMode = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    window.localStorage.setItem(storageKey, next);
    applyTheme(next);
    window.dispatchEvent(new Event("crm-theme-change"));
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label =
    theme === "dark" ? "Modo escuro" : theme === "light" ? "Modo claro" : "Tema do sistema";

  return (
    <Button type="button" variant="outline" size="sm" onClick={nextTheme} aria-label={label}>
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

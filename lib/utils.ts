import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  if (amount === undefined || amount === null) return "N0";
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `N${formatted}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getMonthsSince(date: Date | string): number {
  const start = new Date(date);
  const now = new Date();
  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  );
}

export function getGrowthStage(monthsSincePlanting: number): string {
  if (monthsSincePlanting < 2) return "Establishment";
  if (monthsSincePlanting < 4) return "Early Vegetative";
  if (monthsSincePlanting < 6) return "Rapid Vegetative Growth";
  if (monthsSincePlanting < 8) return "Pre-Flowering";
  if (monthsSincePlanting < 10) return "Flowering";
  if (monthsSincePlanting < 12) return "Bunch Development";
  if (monthsSincePlanting < 15) return "Harvest Ready";
  return "Ratoon Stage";
}

export function getGrowthStageProgress(monthsSincePlanting: number): number {
  const capped = Math.min(monthsSincePlanting, 15);
  return Math.round((capped / 15) * 100);
}

export const CATEGORY_COLORS: Record<string, string> = {
  fertilizer: "#2E7D32",
  herbicide: "#6A1B9A",
  weeding: "#1565C0",
  propping: "#F9A825",
  sucker_harvest: "#E65100",
  bunch_harvest: "#B71C1C",
  gouging: "#4E342E",
  inspection: "#616161",
  pest_control: "#AD1457",
  other: "#9E9E9E",
};

export const CATEGORY_LABELS: Record<string, string> = {
  fertilizer: "Fertilizer",
  herbicide: "Herbicide",
  weeding: "Weeding",
  propping: "Propping",
  sucker_harvest: "Sucker Harvest",
  bunch_harvest: "Bunch Harvest",
  gouging: "Gouging",
  inspection: "Inspection",
  pest_control: "Pest Control",
  other: "Other",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "#9E9E9E",
  in_progress: "#1565C0",
  completed: "#2E7D32",
  overdue: "#B71C1C",
  skipped: "#757575",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "#9E9E9E",
  medium: "#F9A825",
  high: "#E65100",
  critical: "#B71C1C",
};

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

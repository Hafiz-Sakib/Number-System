import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* Class-name helper used by the Motion Brew components (clsx + tailwind-merge). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

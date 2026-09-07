import type { Platform } from "./types";
import { guides as guideArticles } from "@/lib/guides";

export const platforms: Platform[] = [];
export const guides = guideArticles;

export const getPlatform = (slug: string) => platforms.find((p) => p.slug === slug);

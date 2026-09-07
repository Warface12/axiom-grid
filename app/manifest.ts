import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TopPick.pro",
    short_name: "TopPick",
    description: "Independent crypto and trading platform research.",
    start_url: "/",
    display: "standalone",
    background_color: "#050a11",
    theme_color: "#050a11",
    lang: "en",
    icons: [
      { src: "/toppick-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Darman",
    short_name: "Darman",
    description: "Simple pharmacy inventory, sales, purchasing, and reporting.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#087f5b",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

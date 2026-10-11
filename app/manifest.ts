import type { MetadataRoute } from "next";

// Lets an iPad add the Wonder Wall to its Home Screen and open it without Safari's address bar.
// Scoped to /kid so the installed app can't wander into the parent pages.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quark",
    short_name: "Quark",
    description: "The Wonder Wall",
    id: "/kid",
    start_url: "/kid",
    scope: "/kid",
    display: "standalone",
    orientation: "any",
    background_color: "#fbf8f2",
    theme_color: "#fbf8f2",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/maintien")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { traiterMaintien } = await import("@/lib/server/maintien.server");
        return traiterMaintien(request);
      },
    },
  },
});

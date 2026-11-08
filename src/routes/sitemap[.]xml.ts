import { createFileRoute } from "@tanstack/react-router";
import { getColleges } from "@/lib/college-data";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const colleges = await getColleges().catch(() => []);
        const paths = ["/", "/guides/after-12th", "/colleges", "/courses", ...colleges.map((c) => `/colleges/${c.id}`)];
        const body =
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join("\n") +
          "\n</urlset>\n";
        return new Response(body, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

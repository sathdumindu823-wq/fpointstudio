import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function DronePage() {
  const supabase = await createClient();

  const categoryName = "Drone";
  const categorySlug = "drone";

  const { data: galleries, error } = await supabase
    .from("galleries")
    .select(`
      id,
      name,
      slug,
      category,
      description,
      cover_image,
      created_at,
      portfolio_photos (
        id,
        image_url
      )
    `)
    .ilike("category", categoryName)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0a0908] text-[#f5f1eb]">
      <header className="border-b border-white/10 px-6 py-24 text-center md:px-12">
        <Link
          href="/portfolio"
          className="text-xs uppercase tracking-[0.3em] text-[#c69b65]"
        >
          ← Back to Portfolio
        </Link>

        <p className="mt-10 text-xs uppercase tracking-[5px] text-[#c69b65]">
          Aerial
        </p>

        <h1 className="mt-5 text-5xl font-light tracking-[3px] md:text-8xl">
          {categoryName}
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-[#a9a39c]">
          Cinematic aerial photography and videography from a unique perspective.
        </p>
      </header>

      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          {error ? (
            <div className="py-24 text-center text-red-400">
              <p>Unable to load galleries.</p>
              <p className="mt-3 text-sm text-red-400/70">
                {error.message}
              </p>
            </div>
          ) : galleries && galleries.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {galleries.map((gallery) => {
                const photos = gallery.portfolio_photos || [];
                const cover = gallery.cover_image || photos[0]?.image_url || null;

                return (
                  <Link
                    key={gallery.id}
                    href={`/portfolio/${categorySlug}/${gallery.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#171513]">
                      {cover ? (
                        <img
                          src={cover}
                          alt={gallery.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#555]">
                          No photos
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                      <div className="absolute bottom-0 left-0 p-7">
                        <p className="text-xs tracking-[3px] text-[#c69b65]">
                          DRONE
                        </p>

                        <h2 className="mt-2 text-3xl font-light">
                          {gallery.name}
                        </h2>

                        {gallery.description && (
                          <p className="mt-2 max-w-md text-sm text-white/60">
                            {gallery.description}
                          </p>
                        )}

                        <p className="mt-4 text-xs uppercase tracking-[2px] text-white/50 transition group-hover:text-white">
                          View Gallery →
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-[#666]">
                No galleries yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050504] px-6 py-12 text-center">
        <Link
          href="/portfolio"
          className="text-xs uppercase tracking-[3px] text-[#777] hover:text-white"
        >
          ← Back to Portfolio
        </Link>

        <p className="mt-5 text-[11px] tracking-[1px] text-[#555]">
          © 2026 F Point Studio. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
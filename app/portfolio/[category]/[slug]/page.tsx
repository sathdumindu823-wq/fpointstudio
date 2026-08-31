import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

const categoryNames: Record<string, string> = {
  wedding: "Wedding",
  portraits: "Portraits",
  events: "Events",
  fashion: "Fashion",
  commercial: "Commercial",
  drone: "Drone",
};

export default async function GalleryPage({
  params,
}: {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}) {
  const { category, slug } = await params;

  const supabase = await createClient();

  const categoryName = categoryNames[category.toLowerCase()];

  if (!categoryName) {
    notFound();
  }

  // Get gallery
  const { data: gallery, error: galleryError } = await supabase
    .from("galleries")
    .select("id, name, slug, category, description")
    .eq("slug", slug)
    .eq("category", categoryName)
    .single();

  if (galleryError || !gallery) {
    notFound();
  }

  // Get gallery photos
  const { data: photos, error: photosError } = await supabase
    .from("portfolio_photos")
    .select("id, title, image_url, public_id")
    .eq("gallery_id", gallery.id)
    .order("created_at", { ascending: true });

  if (photosError) {
    console.error("Error loading gallery photos:", photosError);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-32">
        <a
          href={`/portfolio/${category}`}
          className="mb-8 inline-block text-sm text-white/60 transition hover:text-white"
        >
          ← Back to {categoryName}
        </a>

        <h1 className="text-4xl font-light tracking-wide md:text-6xl">
          {gallery.name}
        </h1>

        {gallery.description && (
          <p className="mt-4 max-w-2xl text-white/60">
            {gallery.description}
          </p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {!photos || photos.length === 0 ? (
          <p className="py-20 text-center text-white/50">
            No photos in this gallery yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden bg-white/5"
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || gallery.name}
                  className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
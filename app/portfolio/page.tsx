import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import {
  defaultPortfolioCategoryCoverImages,
  portfolioCategories,
} from "@/lib/portfolio-categories";

export default async function PortfolioPage() {
  const supabase = await createClient();

  const { data: categoryCovers } = await supabase
    .from("portfolio_categories")
    .select("slug, image_url");

  type PortfolioCategoryRow = {
    slug?: string;
    image_url?: string;
  };

  const rows = (categoryCovers ?? []) as PortfolioCategoryRow[];
  const savedCategoryCovers = rows.reduce<Record<string, string>>(
    (result, item) => {
      if (item.slug && item.image_url) {
        result[item.slug] = item.image_url;
      }
      return result;
    },
    {}
  );

  const categories = portfolioCategories.map((category) => ({
    ...category,
    image: savedCategoryCovers[category.slug] || category.defaultImage || defaultPortfolioCategoryCoverImages[category.slug],
  }));

  return (
    <main className="min-h-screen bg-[#0a0908] text-[#f5f1eb]">

      {/* HEADER */}

      <header className="border-b border-white/10 px-6 py-24 text-center md:px-12">

        <Link
          href="/"
          className="text-xs uppercase tracking-[0.35em] text-[#c69b65]"
        >
          F Point Studio
        </Link>

        <p className="mt-10 text-xs uppercase tracking-[5px] text-[#c69b65]">
          Selected Work
        </p>

        <h1 className="mt-5 text-5xl font-light tracking-[3px] md:text-8xl">
          Portfolio
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-[#a9a39c]">
          Explore our photography and visual productions.
        </p>

      </header>


      {/* CATEGORIES */}

      <section className="px-6 py-20 md:px-12 md:py-28">

        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">

          {categories.map((category) => (

            <Link
              key={category.slug}
              href={`/portfolio/${category.slug}`}
              className="group relative min-h-[430px] overflow-hidden bg-[#171513]"
            >

              {/* IMAGE */}

              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              {/* DARK OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* TEXT */}

              <div className="absolute bottom-0 left-0 right-0 p-8">

                <p className="text-xs tracking-[3px] text-[#c69b65]">
                  F POINT STUDIO
                </p>

                <h2 className="mt-3 text-3xl font-light tracking-wide">
                  {category.name}
                </h2>

                <p className="mt-4 text-xs uppercase tracking-[2px] text-white/50 transition group-hover:text-white">
                  View Collection →
                </p>

              </div>

            </Link>

          ))}

        </div>

      </section>


      {/* BACK HOME */}

      <section className="border-t border-white/10 py-16 text-center">

        <Link
          href="/"
          className="inline-block border border-[#c69b65] px-8 py-4 text-xs uppercase tracking-[2px] transition hover:bg-[#c69b65] hover:text-black"
        >
          Back To Home
        </Link>

      </section>


      {/* FOOTER */}

      <footer className="border-t border-white/10 bg-[#050504] px-6 py-12 text-center">

        <p className="text-xs tracking-[3px] text-[#777]">
          Photography · Videography · Aerial
        </p>

        <p className="mt-5 text-[11px] tracking-[1px] text-[#555]">
          © 2026 F Point Studio. All Rights Reserved.
        </p>

      </footer>

    </main>
  );
}
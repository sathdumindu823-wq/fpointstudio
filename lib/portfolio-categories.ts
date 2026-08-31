export type PortfolioCategory = {
  name: string;
  slug: string;
  defaultImage: string;
};

export const portfolioCategories: PortfolioCategory[] = [
  {
    name: "Weddings",
    slug: "wedding",
    defaultImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552",
  },
  {
    name: "Portraits",
    slug: "portraits",
    defaultImage:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b",
  },
  {
    name: "Events",
    slug: "events",
    defaultImage:
      "https://images.unsplash.com/photo-1504150558240-0b4fd8946624",
  },
  {
    name: "Fashion",
    slug: "fashion",
    defaultImage:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  },
  {
    name: "Commercial",
    slug: "commercial",
    defaultImage:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
  },
  {
    name: "Drone",
    slug: "drone",
    defaultImage:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f",
  },
];

export const defaultPortfolioCategoryCoverImages = Object.fromEntries(
  portfolioCategories.map((category: PortfolioCategory) => [category.slug, category.defaultImage])
) as Record<string, string>;

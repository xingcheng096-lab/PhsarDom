export { HomePage, ProductsPage, ProductDetailPage, CategoriesPage, CategoryPage, AboutPage, LegalPage } from "./PublicPages.jsx";
export { ProductCard } from "./PublicPages.jsx";

export function ProductFilters({ children }) {
  return <div className="space-y-4">{children}</div>;
}

export function ProductToolbar({ children }) {
  return <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row">{children}</div>;
}

export function ProductGrid({ children, grid = true }) {
  return <div className={grid ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-4"}>{children}</div>;
}

export { Reveal, useReveal } from "./PublicPages.jsx";

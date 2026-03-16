import { products } from "@/content/products";
import { ProductPageTemplate } from "@/components/sections/ProductPageTemplate";
import type { Metadata } from "next";

const product = products.find((p) => p.slug === "cobuild4ward")!;

export const metadata: Metadata = {
  title: `${product.name} — Pool4ward`,
  description: product.description,
};

export default function Cobuild4wardPage() {
  return <ProductPageTemplate product={product} />;
}

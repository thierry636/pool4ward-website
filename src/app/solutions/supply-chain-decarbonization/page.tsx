import { solutions } from "@/content/solutions";
import { SolutionPageTemplate } from "@/components/sections/SolutionPageTemplate";
import type { Metadata } from "next";

const solution = solutions.find(
  (s) => s.slug === "supply-chain-decarbonization"
)!;

export const metadata: Metadata = {
  title: `${solution.title} — Pool4ward`,
  description: solution.description,
};

export default function SupplyChainDecarbonizationPage() {
  return <SolutionPageTemplate solution={solution} />;
}

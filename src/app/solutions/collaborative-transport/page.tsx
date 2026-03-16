import { solutions } from "@/content/solutions";
import { SolutionPageTemplate } from "@/components/sections/SolutionPageTemplate";
import type { Metadata } from "next";

const solution = solutions.find((s) => s.slug === "collaborative-transport")!;

export const metadata: Metadata = {
  title: `${solution.title} — Pool4ward`,
  description: solution.description,
};

export default function CollaborativeTransportPage() {
  return <SolutionPageTemplate solution={solution} />;
}

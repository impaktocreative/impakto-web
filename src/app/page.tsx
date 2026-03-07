import Hero from "@/components/home/Hero";
import IntroPanel from "@/components/home/IntroPanel";
import ValueProposition from "@/components/home/ValueProposition";
import ServicesOverview from "@/components/home/ServicesOverview";
import Methodology from "@/components/home/Methodology";
import IdealClient from "@/components/home/IdealClient";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main className="flex-grow pt-[88px]">
      <Hero />
      <IntroPanel />
      <ValueProposition />
      <ServicesOverview />
      <Methodology />
      <IdealClient />
      <FinalCTA />
    </main>
  );
}

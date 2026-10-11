import Navbar from "@/components/home/navbar";
import Hero from "@/components/home/hero";
import ProblemSolution from "@/components/home/problem-solution";
import DashboardPreviews from "@/components/home/dashboard-preview";
import TeamAccess from "@/components/home/team-access";
import Pricing from "@/components/home/pricing";
import Faq from "@/components/home/faq"
import FinalCta from "@/components/home/final-cta";
import Footer from "@/components/home/footer";
import StandaloneRedirect from "@/components/home/standalone-redirect";

export default function Home() {
  return (
    <main className="min-h-screen bg-pry-clr font-sans text-[#333333]">
      <StandaloneRedirect />
      <Navbar />
      <Hero />
      <ProblemSolution />
      <DashboardPreviews />
      <TeamAccess />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
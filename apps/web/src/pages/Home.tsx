import { Navbar } from "@/components/Navbar"
import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { MetricsSection } from "@/components/MetricsSection"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MetricsSection />
      </main>
      <Footer />
    </div>
  )
}
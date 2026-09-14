import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Recognition } from "@/components/site/Recognition";
import { JourneySection } from "@/components/journey/JourneySection";
import { CaseStudies } from "@/components/casestudies/CaseStudies";
import { MeetJoyce } from "@/components/site/MeetJoyce";
import { Services } from "@/components/site/Services";
import { Close } from "@/components/site/Close";
import { Testimonials } from "@/components/testimonials/Testimonials";
import { Footer } from "@/components/site/Footer";

/**
 * One scroll, in the order a conversation would go: their world, the moment of
 * recognition, what it looks like when it works, who they'd be speaking to,
 * what we actually do, and how to start.
 *
 * Bands alternate solid white and 10% grey; the hero and journey are dark.
 */
export default function Home() {
  return (
    <main className="relative overflow-x-clip bg-white">
      <Nav />

      <Hero />

      <div className="band-white">
        <Recognition />
      </div>

      <JourneySection />

      <div className="band-white">
        <CaseStudies />
      </div>
      <div className="band-grey">
        <MeetJoyce />
      </div>
      <div className="band-white pt-28 md:pt-36">
        <Services />
      </div>
      <div className="band-white pt-16">
        <Close />
      </div>
      <div className="band-grey">
        <Testimonials />
      </div>
      <div className="band-white">
        <Footer />
      </div>
    </main>
  );
}

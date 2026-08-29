import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Recognition } from "@/components/site/Recognition";
import { JourneyChapter } from "@/components/journey/JourneyChapter";
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
 */
export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper">
        <Hero />
        <Recognition />
      </div>

      <JourneyChapter />

      <div className="paper">
        <CaseStudies />
        <MeetJoyce />
        <Services />
        <Close />
        <Testimonials />
        <Footer />
      </div>
    </main>
  );
}

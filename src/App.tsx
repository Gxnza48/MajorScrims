import { useEffect } from "react";
import Lenis from "lenis";
import { I18nProvider } from "./i18n";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { ProPlayers } from "./components/ProPlayers";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <I18nProvider>
      <div className="bg-black min-h-screen text-white selection:bg-[#1FC058] selection:text-black">
        <Navbar />
        <main>
          <Hero />
          <About />
          <ProPlayers />
          <Features />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </I18nProvider>
  );
}

export default App;

import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "@/components/chat/Chatbot";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import UpdatesPopup from "@/components/UpdatesPopup";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Scroll behaviour, the way most professional sites do it:
  // - new page (link click): start at the top instantly, no sliding
  // - Back / Forward: return to where the user was on that page
  // - link to a section (e.g. /services#pcc): go to that section
  //   (smooth only when it is on the same page; instant when coming from another page)
  const navType = useNavigationType();
  const positions = useRef<Record<string, number>>({});
  const lastPath = useRef(location.pathname);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const save = () => { positions.current[window.history.state?.key ?? location.key] = window.scrollY; };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [location.key]);

  useLayoutEffect(() => {
    const samePage = lastPath.current === location.pathname;
    lastPath.current = location.pathname;
    const id = location.hash.slice(1);
    const instant = { behavior: "instant" as ScrollBehavior };

    if (id === "chat") {
      window.dispatchEvent(new Event("pencom:open-chat"));
      return;
    }
    if (navType === "POP" && !id) {
      const y = positions.current[location.key] ?? 0;
      window.scrollTo({ top: y, ...instant });
      // The page may still be building; try again once it has its full height
      const t = setTimeout(() => window.scrollTo({ top: y, ...instant }), 80);
      return () => clearTimeout(t);
    }
    if (!id) {
      window.scrollTo({ top: 0, ...instant });
      return;
    }
    if (!samePage) window.scrollTo({ top: 0, ...instant });
    const t = setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(id));
      if (!el) return;
      const offset = (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 126) + 64;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: samePage && !reduce ? "smooth" : ("instant" as ScrollBehavior) });
    }, samePage ? 0 : 60);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash, location.key, navType]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content link - first focusable element for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-[#326206] focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Header - includes top bar + main navigation */}
      <Header />

      {/* Main content - pt for header height */}
      <main id="main-content" className="flex-1 pt-[var(--header-h,126px)]" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
      <Chatbot />
      <UpdatesPopup />

      {/* Floating Accessibility Widget - Home page only */}
      {isHome && <AccessibilityWidget />}

    </div>
  );
}

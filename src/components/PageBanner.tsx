import { motion } from "framer-motion";
import { Link } from "react-router";
import type { ReactNode } from "react";

interface PageBannerProps {
  label: string;
  title: string;
  description: string;
  bgImage?: string;
  children?: ReactNode;
  /** Name of this page in the "you are here" trail (defaults to the label) */
  crumb?: string;
}

export default function PageBanner({ label, title, description, bgImage, children, crumb }: PageBannerProps) {
  // Design 2 (bold, photo-led): a tall photo banner on every page. The menu sits on top of the photo,
  // and the title sits low on the picture like a magazine cover. Each page has its own photo.
  void bgImage;
  const photo = bannerPhotos[label] ?? { src: "./d2/towers.jpg", pos: "center" };
  return (
    <div data-hero className="relative -mt-[var(--header-h,126px)] pt-[var(--header-h,126px)] min-h-[440px] md:min-h-[520px] flex items-end overflow-hidden bg-[#326206]">
      <motion.img
        src={photo.src} alt=""
        initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: photo.pos }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/30" aria-hidden="true" />
      <div className="relative w-full max-w-7xl mx-auto px-4 pb-10 md:pb-14 pt-10">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-white/85">
            <li><Link to="/" className="underline underline-offset-4 decoration-white/40 hover:decoration-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white font-semibold">{crumb ?? label}</li>
          </ol>
        </nav>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] !text-white max-w-4xl">{title}</h1>
          <div className="mt-5 flex gap-4 max-w-2xl">
            <span className="w-1 shrink-0 rounded-full bg-white" aria-hidden="true" />
            <p className="text-base md:text-lg text-white/90">{description}</p>
          </div>
          {children && <div className="mt-5">{children}</div>}
        </motion.div>
      </div>
    </div>
  );
}

const bannerPhotos: Record<string, { src: string; pos: string }> = {
  "About Us": { src: "./d2/abuja.jpg", pos: "center 60%" },
  Services: { src: "./d2/people.jpg", pos: "center 30%" },
  Operators: { src: "./d2/employer.jpg", pos: "center 35%" },
  Regulations: { src: "./d2/lagos-tower.jpg", pos: "center 40%" },
  Resources: { src: "./d2/signing.jpg", pos: "center 55%" },
  Connect: { src: "./d2/team.jpg", pos: "center 30%" },
  Analytics: { src: "./d2/towers.jpg", pos: "center 40%" },
  Search: { src: "./d2/towers.jpg", pos: "center 40%" },
  Legal: { src: "./d2/signing.jpg", pos: "center 55%" },
};

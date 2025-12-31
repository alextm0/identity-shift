'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export function BackgroundShapes() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4], [0.03, 0.05, 0.04]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.2, 0.4], [0.02, 0.04, 0.06]);
  const color1 = useTransform(scrollYProgress, [0, 0.4], ["rgba(139, 92, 246, 0.2)", "rgba(167, 139, 250, 0.15)"]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        style={{ y: y1, opacity: opacity1, backgroundColor: color1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px]"
      />

      <motion.div
        style={{ y: y2, opacity: opacity2 }}
        animate={{ scale: [1.05, 1, 1.05] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[140px]"
      />

      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />
    </div>
  );
}

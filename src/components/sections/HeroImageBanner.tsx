"use client";

import React from "react";
import Image from "next/image";

export function HeroImageBanner() {
  return (
    <div className="relative w-full h-[360px] sm:h-[480px] md:h-[580px] lg:h-[680px] xl:h-[760px] overflow-hidden bg-[#FBF9F5] select-none">
      {/* High-Resolution Lifestyle Photography: Mother, Father, and Child */}
      <Image
        src="https://images.unsplash.com/photo-1609234656388-0ff363383899?q=80&w=2400&auto=format&fit=crop"
        alt="Famille TefLook - Moments tendres et chaleureux"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center scale-101"
      />

      {/* Subtle, minimal natural lighting vignette without any text or obstruction */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/5 pointer-events-none" />
    </div>
  );
}

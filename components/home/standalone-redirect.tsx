"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** When PetArk is opened as an installed PWA, skip the landing page and go to /login. */
export default function StandaloneRedirect() {
  const router = useRouter();

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) router.replace("/login");
  }, [router]);

  return null;
}
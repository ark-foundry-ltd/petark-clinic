// app/(auth)/signup/page.tsx

"use client";

import { useState } from "react";
import RegisterComponent from "@/components/register-comp";
import WelcomeOnboardingComp from "@/components/welcome-onboarding-comp";

export default function RegisterPage() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return (
      <main>
        <WelcomeOnboardingComp
          onComplete={() => setShowWelcome(false)}
          onSkip={() => setShowWelcome(false)}
        />
      </main>
    );
  }

  return (
    <main>
      <RegisterComponent />
    </main>
  );
}
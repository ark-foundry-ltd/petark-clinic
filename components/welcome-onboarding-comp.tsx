// src/components/welcome-onboarding-comp.tsx

"use client";

import { useState } from "react";
import { ShieldPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { steps } from "./onboarding-steps";
import Image from "next/image";

type WelcomeOnboardingProps = {
  onComplete: () => void;
  onSkip: () => void;
};

export default function WelcomeOnboardingComp({
  onComplete,
  onSkip,
}: WelcomeOnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const goNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-clr relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Subtle background rings — matches register-comp.tsx */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-acc-clr/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-acc-clr/5 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-acc-clr/3 blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl bg-pry-clr/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl relative z-10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center text-pry-clr">
              <Image src="/petark_logo.png" alt="PetArk Logo" width={24} height={24} />
            </div>
            <span className="pry-ff text-[17px] font-semibold text-sec-clr">
              PetArk
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="sec-ff text-xs text-sec-clr/60">
              Step {step.id} of {steps.length}
            </span>
            {!isLastStep && (
              <button
                onClick={onSkip}
                className="sec-ff text-xs text-sec-clr/70 hover:text-acc-clr transition-colors duration-200"
              >
                Skip setup
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-10 px-6 sm:px-8 py-8 sm:py-10 md:grid-cols-2 md:items-center animate-fadeIn">
          {/* Left: copy */}
          <div>
            <span className="inline-block rounded-full bg-acc-clr/10 px-3 py-1 sec-ff text-[11px] font-medium text-acc-clr">
              {step.eyebrow}
            </span>

            <h1 className="mt-4 pry-ff text-2xl sm:text-3xl font-semibold leading-tight text-sec-clr">
              {step.heading}
            </h1>

            <p className="mt-3 max-w-md sec-ff text-[15px] leading-relaxed text-sec-clr/70">
              {step.description}
            </p>

            <p className="mt-7 sec-ff text-[11px] font-medium uppercase tracking-wide text-sec-clr/50">
              Included in the Core Suite
            </p>

            <div className="mt-3 flex flex-wrap gap-2.5">
              {step.features.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 sec-ff text-[12px] text-sec-clr"
                >
                  <Icon className="h-3.5 w-3.5 text-acc-clr" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: image + floating card */}
          <div className="relative pb-8">
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.imageSrc}
                alt={step.imageAlt}
                className="h-64 w-full object-cover md:h-72"
              />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-pry-clr/90 px-2.5 py-1 sec-ff text-[11px] font-medium text-sec-clr backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acc-clr" />
                {step.liveTag}
              </span>
            </div>
            {step.floatingCard}
          </div>
        </div>

        {/* Footer: progress + navigation */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 sm:px-8 py-6">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? "w-6 bg-acc-clr"
                    : i < stepIndex
                    ? "w-1.5 bg-acc-clr/50"
                    : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-sec-clr bg-pry-clr hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr transition-all duration-200 sec-ff"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-pry-clr bg-acc-clr hover:bg-acc-clr/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr transition-all duration-200 sec-ff"
            >
              {step.ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
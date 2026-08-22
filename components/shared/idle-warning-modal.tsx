// components/shared/idle-warning-modal.tsx
"use client";

interface IdleWarningModalProps {
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}

export default function IdleWarningModal({
  secondsLeft,
  onStay,
  onLogout,
}: Readonly<IdleWarningModalProps>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm bg-pry-clr rounded-xl p-6 space-y-4 text-center">
        <h2 className="text-base font-semibold text-gray-900 pry-ff pry-ff">
          Still there?
        </h2>
        <p className="text-sm text-gray-500 sec-ff">
          You&apos;ll be logged out in <span className="font-semibold text-gray-900">{secondsLeft}s</span> due to inactivity.
        </p>
        <div className="flex gap-2 pt-2 pry-ff">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors pry-ff cursor-pointer"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={onStay}
            className="flex-1 py-2 text-sm font-medium bg-acc-clr text-pry-clr rounded-lg hover:bg-acc-clr/80 transition-colors pry-ff cursor-pointer"
          >
            I&apos;m still here
          </button>
        </div>
      </div>
    </div>
  );
}
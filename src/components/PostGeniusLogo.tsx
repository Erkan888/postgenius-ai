import { cn } from "@/lib/utils";

export function PostGeniusLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-gradient-violet glow-violet">
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className="size-6 text-primary-foreground"
          fill="none"
        >
          {/* speech-mark motif */}
          <path
            d="M7 21c-1.7 0-3-1.4-3-3.1 0-3.2 2-6 5-7.2l.9 2.1c-1.6.7-2.7 2-2.9 3.4.2-.1.6-.2 1-.2 1.7 0 3 1.3 3 2.9C11 20.5 8.9 21 7 21Z"
            fill="currentColor"
            opacity="0.55"
          />
          <path
            d="M25.6 10.7c-3 1.2-5 4-5 7.2 0 1.7 1.3 3.1 3 3.1 1.9 0 4-.5 4-2.1 0-1.6-1.3-2.9-3-2.9-.4 0-.8.1-1 .2.2-1.4 1.3-2.7 2.9-3.4l-.9-2.1Z"
            fill="currentColor"
            opacity="0.55"
          />
          {/* lightning bolt */}
          <path
            d="M18.4 2 9.6 15.1c-.3.5 0 1.2.6 1.2h4.3l-2.1 12.4c-.1.7.8 1.1 1.2.5l9.1-13.4c.3-.5 0-1.2-.6-1.2h-4.4L19.7 2.6c.1-.7-.9-1.1-1.3-.6Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Post<span className="text-gradient-violet">Genius</span>
        </span>
      )}
    </span>
  );
}

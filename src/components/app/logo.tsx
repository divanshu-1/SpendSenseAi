import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6", className)}
  >
    <path d="M12 2v20" />
    <path d="M17.6 3.2c-1.5 1.5-1.5 4.5 0 6s4.5 1.5 6 0" />
    <path d="M17.6 14.8c-1.5 1.5-1.5 4.5 0 6s4.5 1.5 6 0" />
    <path d="M4 6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    <path d="m4 14 4 6 4-6" />
    <path d="M4 14h8" />
  </svg>
);

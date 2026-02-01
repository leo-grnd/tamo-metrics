import Link from "next/link";

function FirebaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.53 18.64L5.79 3.23C5.82 2.84 6.29 2.63 6.58 2.87L8.01 4.13L10.57 9.66L4.53 18.64Z"
        fill="#FFA000"
      />
      <path
        d="M12.54 11.64L10.57 9.66L4.53 18.64L12.54 11.64Z"
        fill="#F57C00"
      />
      <path
        d="M17.47 7.64L15.54 3.54C15.39 3.22 14.92 3.19 14.73 3.49L4.53 18.64L11.59 22.73C11.86 22.89 12.19 22.89 12.46 22.73L19.47 18.64L17.47 7.64Z"
        fill="#FFCA28"
      />
      <path
        d="M10.57 9.66L8.01 4.13C7.85 3.79 7.35 3.79 7.18 4.13L4.53 18.64L10.57 9.66Z"
        fill="#FFA000"
      />
    </svg>
  );
}

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Firestore Analytics" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <FirebaseIcon className="h-8 w-8" />
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Console
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}

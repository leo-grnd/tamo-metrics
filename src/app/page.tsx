import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3">
          <FirebaseIcon className="h-16 w-16" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Firestore Analytics
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Visualisez les statistiques de votre base de données Firestore en
            temps réel
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" className="min-w-[200px]">
              Accéder au Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span>Statistiques en temps réel</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <span>Détection auto des collections</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Visualisations interactives</span>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-8 text-sm text-zinc-400 dark:text-zinc-600">
        Powered by Firebase Admin SDK
      </footer>
    </div>
  );
}

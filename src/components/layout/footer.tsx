export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <p>Powered by Firebase Admin SDK</p>
        <p>
          <a
            href="https://firebase.google.com/docs/firestore"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-600 dark:hover:text-amber-500"
          >
            Documentation Firestore
          </a>
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { prototypeLinks } from "./prototypes";

export default function Home() {
  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-3xl tracking-tight">プロトタイプ一覧</h1>

          <div className="mt-7 grid gap-3">
            {prototypeLinks.map((prototype) => (
              <Link
                key={prototype.id}
                href={prototype.href}
                className="rounded-lg border bg-card px-5 py-4 transition hover:bg-accent"
              >
                <p className="text-lg font-medium text-card-foreground">{prototype.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

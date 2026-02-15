import Link from "next/link";
import { prototypeLinks } from "./prototypes";

export default function Home() {
  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-3xl tracking-tight">プロトタイプ一覧</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            ここから各プロトタイプに移動できます。リンクは `app/prototypes.ts` の定義から動的に表示されます。
          </p>

          <div className="mt-7 grid gap-3">
            {prototypeLinks.map((prototype) => (
              <Link
                key={prototype.id}
                href={prototype.href}
                className="rounded-lg border bg-card px-5 py-4 transition hover:bg-accent"
              >
                <p className="text-lg font-medium text-card-foreground">{prototype.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{prototype.description}</p>
                <p className="mt-3 text-sm font-medium text-primary">移動する</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

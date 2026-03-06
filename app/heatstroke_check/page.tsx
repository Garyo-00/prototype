import Link from "next/link";

const pages = [
  {
    id: "setting",
    title: "熱中症チェック項目設定/QRコード印刷",
    href: "/heatstroke_check/check-item-settings",
  },
  {
    id: "record",
    title: "熱中症チェック記録",
    href: "/heatstroke_check/check-records",
  },
] as const;

export default function HeatstrokeCheckHome() {
  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-3xl tracking-tight">熱中症チェックシステム</h1>

          <div className="mt-7 grid gap-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className="rounded-lg border bg-card px-5 py-4 transition hover:bg-accent"
              >
                <p className="text-lg font-medium text-card-foreground">{page.title}</p>
              </Link>
            ))}
          </div>

          <Link href="/" className="app-link mt-7 inline-block">
            プロトタイプ一覧へ戻る
          </Link>
        </section>
      </div>
    </main>
  );
}

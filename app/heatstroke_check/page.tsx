import Link from "next/link";

const pages = [
  {
    id: "setting",
    title: "熱中症チェック項目設定/QRコード印刷",
    description: "チェック項目の設定と現場掲示用QRコードの印刷を行うページ",
    href: "/heatstroke_check/check-item-settings",
  },
  {
    id: "record",
    title: "熱中症チェック記録",
    description: "職長や職人のチェック記録を入力・確認するページ",
    href: "/heatstroke_check/check-records",
  },
] as const;

export default function HeatstrokeCheckHome() {
  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-3xl tracking-tight">熱中症チェックシステム</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            目的に応じてページを選択してください（プロトタイプ用の画面遷移）。
          </p>

          <div className="mt-7 grid gap-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className="rounded-lg border bg-card px-5 py-4 transition hover:bg-accent"
              >
                <p className="text-lg font-medium text-card-foreground">{page.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{page.description}</p>
                <p className="mt-3 text-sm font-medium text-primary">開く</p>
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

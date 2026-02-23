import Link from "next/link";

type Props = {
  searchParams: Promise<{ patternId?: string }>;
};

export default async function CheckEntryPage({ searchParams }: Props) {
  const params = await searchParams;
  const patternId = params.patternId ?? "未指定";

  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-2xl tracking-tight">熱中症チェック実施ページ（準備中）</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            このページは後ほど実装予定です。QR読み込み時の遷移先としてプレースホルダーを表示しています。
          </p>
          <p className="mt-4 rounded-md border bg-background p-3 text-sm">
            選択されたパターンID: <span className="font-medium">{patternId}</span>
          </p>
          <Link href="/heatstroke_check/check-item-settings" className="app-link mt-6 inline-block">
            設定ページへ戻る
          </Link>
        </section>
      </div>
    </main>
  );
}

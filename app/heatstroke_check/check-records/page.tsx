import Link from "next/link";

const dummyRecords = [
  {
    company: "A設備工業",
    user: "山田 太郎（職長）",
    date: "2026-02-15",
    status: "記録済み",
  },
  {
    company: "B建設",
    user: "佐藤 花子（職人）",
    date: "2026-02-15",
    status: "記録済み",
  },
  {
    company: "C電工",
    user: "鈴木 一郎（職長）",
    date: "2026-02-15",
    status: "未記録",
  },
] as const;

export default function CheckRecordsPage() {
  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-2xl tracking-tight">熱中症チェック記録</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            協力会社ごと・ユーザーごとの記録状況を確認するダミー画面です。
          </p>

          <div className="mt-7 overflow-hidden rounded-lg border bg-background">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">会社名</th>
                  <th className="px-4 py-3 font-medium">ユーザー</th>
                  <th className="px-4 py-3 font-medium">日付</th>
                  <th className="px-4 py-3 font-medium">状態</th>
                </tr>
              </thead>
              <tbody>
                {dummyRecords.map((record) => (
                  <tr key={`${record.company}-${record.user}`} className="border-t">
                    <td className="px-4 py-3">{record.company}</td>
                    <td className="px-4 py-3">{record.user}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          record.status === "記録済み"
                            ? "border-primary/25 bg-primary/10 text-primary"
                            : "border-destructive/25 bg-destructive/10 text-destructive"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7 flex gap-4">
            <Link href="/heatstroke_check" className="app-link">
              熱中症チェックシステムトップへ戻る
            </Link>
            <Link href="/" className="app-link">
              プロトタイプ一覧へ
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

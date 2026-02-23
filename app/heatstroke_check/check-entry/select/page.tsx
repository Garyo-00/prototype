"use client";

import Link from "next/link";
import { useState } from "react";

type Pattern = {
  id: string;
  name: string;
};

export default function CheckEntrySelectPage() {
  const [patterns] = useState<Pattern[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = localStorage.getItem("heatstroke-check-master-patterns");
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as Array<{ id: string; name: string }>;
      return parsed.map((pattern) => ({ id: pattern.id, name: pattern.name }));
    } catch {
      return [];
    }
  });

  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-2xl tracking-tight">チェックパターン選択</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            QRコードから遷移したユーザーが、実施するチェックパターンを選択するページです。
          </p>

          <div className="mt-6 grid gap-3">
            {patterns.length > 0 ? (
              patterns.map((pattern) => (
                <Link
                  key={pattern.id}
                  href={`/heatstroke_check/check-entry?patternId=${pattern.id}`}
                  className="rounded-lg border bg-background px-4 py-3 text-sm font-medium hover:bg-accent"
                >
                  {pattern.name} を選択
                </Link>
              ))
            ) : (
              <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                利用可能なパターンがありません。先に設定ページで保存してください。
              </p>
            )}
          </div>

          <Link href="/heatstroke_check/check-item-settings" className="app-link mt-6 inline-block">
            設定ページへ戻る
          </Link>
        </section>
      </div>
    </main>
  );
}

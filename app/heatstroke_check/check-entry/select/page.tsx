"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type TimeSlot = "morning" | "break10" | "lunch" | "break15" | "end";

type FormState = {
  name: string;
  company: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
};

const TIME_OPTIONS: Array<{ value: TimeSlot; label: string }> = [
  { value: "morning", label: "朝" },
  { value: "break10", label: "休憩（10時）" },
  { value: "lunch", label: "昼" },
  { value: "break15", label: "休憩（15時）" },
  { value: "end", label: "退勤時" },
];

const ML_OPTIONS = Array.from({ length: 21 }, (_, index) => index * 50);
const TEMP_OPTIONS = Array.from({ length: 61 }, (_, index) => (35 + index * 0.1).toFixed(1));
const WBGT_OPTIONS = Array.from({ length: 30 }, (_, index) => 15 + index);

function getWbgtLabel(value: number) {
  if (value >= 31) {
    return `${value}（危険）`;
  }
  if (value >= 28) {
    return `${value}（厳重警戒）`;
  }
  if (value >= 25) {
    return `${value}（警戒）`;
  }
  return String(value);
}

function initialFormState(): FormState {
  return {
    name: "",
    company: "",
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
  };
}

export default function CheckEntrySelectPage() {
  const [selectedTime, setSelectedTime] = useState<TimeSlot | "">("");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const abnormalItems = useMemo(() => {
    const items: string[] = [];

    if (form.q1 && form.q1 !== "はい") {
      items.push("1.昨晩はよく眠れましたか？");
    }

    if (form.q2) {
      const value = Number(form.q2);
      if (value < 0 || value > 500) {
        items.push("2.昨晩の飲酒量");
      }
    }

    if (form.q3) {
      const value = Number(form.q3);
      if (value < 36.0 || value > 37.0) {
        items.push("3.今朝の体温");
      }
    }

    if (form.q4) {
      const value = Number(form.q4);
      if (value < 15 || value > 27) {
        items.push("4.WBGT値");
      }
    }

    if (form.q5) {
      const value = Number(form.q5);
      if (value < 200 || value > 1000) {
        items.push("5.摂取した水分量");
      }
    }

    return items;
  }, [form]);

  const handleSubmit = () => {
    if (abnormalItems.length > 0) {
      setShowConfirmModal(true);
      return;
    }
    setIsCompleted(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <main className="app-page">
        <div className="app-container">
          <section className="app-panel p-7 text-center">
            <h1 className="text-2xl tracking-tight">熱中症チェックが完了しました</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              ご回答ありがとうございました。
            </p>
            <Link href="/heatstroke_check/check-entry/select" className="app-btn-primary mt-6 inline-flex">
              パターン選択画面に戻る
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-7">
          <h1 className="text-2xl tracking-tight">チェックパターン選択</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            実施タイミングを選択し、チェック項目を入力してください。
          </p>

          <div className="mt-6 max-w-sm">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">実施タイミング</span>
              <select
                value={selectedTime}
                onChange={(event) => setSelectedTime(event.target.value as TimeSlot)}
                className="app-select"
              >
                <option value="">選択してください</option>
                {TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedTime && (
            <div className="mt-8 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-muted-foreground">名前</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="app-input"
                    placeholder="山田 太郎"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-muted-foreground">会社名</span>
                  <input
                    value={form.company}
                    onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                    className="app-input"
                    placeholder="〇〇建設"
                  />
                </label>
              </div>

              <article className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">1.昨晩はよく眠れましたか？</p>
                <p className="mt-1 text-xs text-muted-foreground">正常値: はい</p>
                <select
                  value={form.q1}
                  onChange={(event) => setForm((prev) => ({ ...prev, q1: event.target.value }))}
                  className="app-select mt-3"
                >
                  <option value="">選択してください</option>
                  <option value="はい">はい</option>
                  <option value="いいえ">いいえ</option>
                </select>
              </article>

              <article className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">2.昨晩の飲酒量</p>
                <p className="mt-1 text-xs text-muted-foreground">正常値: 0ml~500ml</p>
                <select
                  value={form.q2}
                  onChange={(event) => setForm((prev) => ({ ...prev, q2: event.target.value }))}
                  className="app-select mt-3"
                >
                  <option value="">選択してください</option>
                  {ML_OPTIONS.map((value) => (
                    <option key={`drink-${value}`} value={String(value)}>
                      {value}ml
                    </option>
                  ))}
                </select>
              </article>

              <article className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">3.今朝の体温</p>
                <p className="mt-1 text-xs text-muted-foreground">正常値: 36.0℃以上37.0℃以下</p>
                <select
                  value={form.q3}
                  onChange={(event) => setForm((prev) => ({ ...prev, q3: event.target.value }))}
                  className="app-select mt-3"
                >
                  <option value="">選択してください</option>
                  {TEMP_OPTIONS.map((value) => (
                    <option key={`temp-${value}`} value={value}>
                      {value}℃
                    </option>
                  ))}
                </select>
              </article>

              <article className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">4.WBGT値</p>
                <p className="mt-1 text-xs text-muted-foreground">正常値: 15以上27（警戒）以下</p>
                <select
                  value={form.q4}
                  onChange={(event) => setForm((prev) => ({ ...prev, q4: event.target.value }))}
                  className="app-select mt-3"
                >
                  <option value="">選択してください</option>
                  {WBGT_OPTIONS.map((value) => (
                    <option key={`wbgt-${value}`} value={String(value)}>
                      {getWbgtLabel(value)}
                    </option>
                  ))}
                </select>
              </article>

              <article className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">5.摂取した水分量</p>
                <p className="mt-1 text-xs text-muted-foreground">正常値: 200ml~1,000ml</p>
                <select
                  value={form.q5}
                  onChange={(event) => setForm((prev) => ({ ...prev, q5: event.target.value }))}
                  className="app-select mt-3"
                >
                  <option value="">選択してください</option>
                  {ML_OPTIONS.map((value) => (
                    <option key={`water-${value}`} value={String(value)}>
                      {value}ml
                    </option>
                  ))}
                </select>
              </article>

              <article className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">6.摂取した水分の種類</p>
                <p className="mt-1 text-xs text-muted-foreground">正常値: 空白</p>
                <input
                  value={form.q6}
                  onChange={(event) => setForm((prev) => ({ ...prev, q6: event.target.value }))}
                  className="app-input mt-3"
                  placeholder="自由記述"
                />
              </article>

              <div className="pt-2">
                <button type="button" onClick={handleSubmit} className="app-btn-primary min-w-36">
                  チェック送信
                </button>
              </div>
            </div>
          )}

          <Link href="/heatstroke_check/check-item-settings" className="app-link mt-8 inline-block">
            設定ページへ戻る
          </Link>
        </section>

        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-lg border bg-card p-5">
              <h2 className="text-lg font-medium">確認</h2>
              <p className="mt-3 text-sm">
                異常値があります。元請管理者に通知されますが、送信しますか？
              </p>
              <div className="mt-3 rounded-md border bg-background p-3">
                <p className="text-xs font-medium text-muted-foreground">異常値項目</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {abnormalItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="app-btn-outline"
                >
                  キャンセル
                </button>
                <button type="button" onClick={handleConfirmSubmit} className="app-btn-primary">
                  送信する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type ViewMode = "day" | "month";
type Pattern = "朝" | "休憩（10時）" | "昼" | "休憩（15時）" | "退勤時";
type Status = "normal" | "abnormal" | "empty";

type WorkerRow = {
  id: string;
  name: string;
  company: string;
  dayChecks: Partial<Record<Pattern, boolean>>;
};

type DetailItem = {
  item: string;
  answer: string;
  status: Status;
};

type Selection = {
  mode: ViewMode;
  rowId: string;
  worker: string;
  company: string;
  pattern?: Pattern;
  dateLabel: string;
  day?: number;
} | null;

type PatternDetail = {
  pattern: Pattern;
  completed: boolean;
  items: DetailItem[];
};

const PATTERNS: Pattern[] = ["朝", "休憩（10時）", "昼", "休憩（15時）", "退勤時"];

const ROWS: WorkerRow[] = [
  {
    id: "yamada-taro",
    name: "山田太郎",
    company: "A株式会社",
    dayChecks: { 朝: true, "休憩（10時）": true, 昼: true, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "yamada-hanako",
    name: "山田花子",
    company: "A株式会社",
    dayChecks: { 朝: true, "休憩（10時）": false, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "nakamura-makoto",
    name: "中村誠",
    company: "A株式会社",
    dayChecks: { 朝: true, "休憩（10時）": true, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "kato-ren",
    name: "加藤蓮",
    company: "A株式会社",
    dayChecks: { 朝: false, "休憩（10時）": true, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "ogawa-rina",
    name: "小川里奈",
    company: "A株式会社",
    dayChecks: { 朝: true, "休憩（10時）": true, 昼: true, "休憩（15時）": true, 退勤時: false },
  },
  {
    id: "kimura-sho",
    name: "木村翔",
    company: "A株式会社",
    dayChecks: { 朝: false, "休憩（10時）": false, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "sato-ichiro",
    name: "佐藤一郎",
    company: "B株式会社",
    dayChecks: { 朝: true, "休憩（10時）": false, 昼: true, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "ito-aya",
    name: "伊藤彩",
    company: "B株式会社",
    dayChecks: { 朝: false, "休憩（10時）": true, 昼: false, "休憩（15時）": false, 退勤時: true },
  },
  {
    id: "watanabe-aoi",
    name: "渡辺葵",
    company: "B株式会社",
    dayChecks: { 朝: true, "休憩（10時）": true, 昼: true, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "fujita-yu",
    name: "藤田優",
    company: "B株式会社",
    dayChecks: { 朝: false, "休憩（10時）": false, 昼: false, "休憩（15時）": true, 退勤時: true },
  },
  {
    id: "morita-kai",
    name: "森田海",
    company: "B株式会社",
    dayChecks: { 朝: true, "休憩（10時）": false, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "hayashi-sora",
    name: "林空",
    company: "B株式会社",
    dayChecks: { 朝: false, "休憩（10時）": false, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "tanaka",
    name: "田中",
    company: "株式会社C組",
    dayChecks: { 朝: true, "休憩（10時）": false, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "tanaka-jiro",
    name: "田中次郎",
    company: "株式会社C組",
    dayChecks: { 朝: false, "休憩（10時）": true, 昼: true, "休憩（15時）": true, 退勤時: true },
  },
  {
    id: "suzuki-haru",
    name: "鈴木晴",
    company: "株式会社C組",
    dayChecks: { 朝: true, "休憩（10時）": false, 昼: false, "休憩（15時）": false, 退勤時: true },
  },
  {
    id: "inoue-nao",
    name: "井上直",
    company: "株式会社C組",
    dayChecks: { 朝: true, "休憩（10時）": true, 昼: false, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "abe-rei",
    name: "阿部怜",
    company: "株式会社C組",
    dayChecks: { 朝: false, "休憩（10時）": false, 昼: true, "休憩（15時）": false, 退勤時: false },
  },
  {
    id: "shimizu-yuna",
    name: "清水優奈",
    company: "株式会社C組",
    dayChecks: { 朝: true, "休憩（10時）": true, 昼: true, "休憩（15時）": false, 退勤時: false },
  },
];

const MORNING_ITEMS: DetailItem[] = [
  { item: "1.昨晩はよく眠れましたか？", answer: "はい", status: "normal" },
  { item: "2.昨晩の飲酒量", answer: "350ml", status: "normal" },
  { item: "3.今朝の体温", answer: "36.5℃", status: "normal" },
  { item: "4.WBGT値", answer: "25（警戒）", status: "normal" },
  { item: "5.摂取した水分量", answer: "350ml", status: "normal" },
  { item: "6.摂取した水分の種類", answer: "スポーツドリンク", status: "empty" },
];

const BREAK10_ITEMS: DetailItem[] = [
  { item: "1.顔色は悪くないですか", answer: "はい", status: "normal" },
  { item: "2.水分摂取しましたか", answer: "はい", status: "normal" },
  { item: "3.摂取した水分量", answer: "100ml", status: "abnormal" },
];

const LUNCH_ITEMS: DetailItem[] = [
  { item: "1.顔色は悪くないですか", answer: "はい", status: "normal" },
  { item: "2.水分摂取しましたか", answer: "はい", status: "normal" },
  { item: "3.摂取した水分量", answer: "300ml", status: "normal" },
  { item: "4.昼食はしっかり食べられましたか？", answer: "いいえ", status: "abnormal" },
];

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function daysInMonth(value: string) {
  const date = parseMonth(value);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function moveDate(value: string, diff: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + diff);
  return formatDate(date);
}

function moveMonth(value: string, diff: number) {
  const date = parseMonth(value);
  date.setMonth(date.getMonth() + diff);
  return formatMonth(date);
}

function isMonthDone(rowId: string, day: number) {
  if (rowId === "tanaka") {
    return day === 1;
  }
  if (rowId === "tanaka-jiro") {
    return [2, 3, 4, 8, 12, 16, 20, 24, 28].includes(day);
  }
  const seed = rowId.length;
  return (day + seed) % 4 === 0;
}

function getPatternDetails(row: WorkerRow, mode: ViewMode): PatternDetail[] {
  const base = row.dayChecks;
  const allCompleted = mode === "month";

  return [
    { pattern: "朝", completed: allCompleted ? true : Boolean(base["朝"]), items: MORNING_ITEMS },
    { pattern: "休憩（10時）", completed: allCompleted ? true : Boolean(base["休憩（10時）"]), items: BREAK10_ITEMS },
    { pattern: "昼", completed: allCompleted ? true : Boolean(base["昼"]), items: LUNCH_ITEMS },
    { pattern: "休憩（15時）", completed: allCompleted ? false : Boolean(base["休憩（15時）"]), items: [] },
    { pattern: "退勤時", completed: allCompleted ? false : Boolean(base["退勤時"]), items: [] },
  ];
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "empty") {
    return <span className="text-xs text-muted-foreground" />;
  }
  if (status === "normal") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="size-3.5" />
        正常
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
      <AlertTriangle className="size-3.5" />
      異常
    </span>
  );
}

export default function CheckRecordsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([...new Set(ROWS.map((row) => row.company))]);
  const [dayValue, setDayValue] = useState(formatDate(new Date()));
  const [monthValue, setMonthValue] = useState(formatMonth(new Date()));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selection, setSelection] = useState<Selection>(null);

  const dayInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const companies = useMemo(
    () => [...new Set(ROWS.map((row) => row.company))].sort((a, b) => a.localeCompare(b, "ja")),
    [],
  );
  const filteredRows = useMemo(
    () =>
      ROWS.filter((row) => selectedCompanies.includes(row.company)).sort((a, b) => {
        const companyOrder = a.company.localeCompare(b.company, "ja");
        if (companyOrder !== 0) {
          return companyOrder;
        }
        return a.name.localeCompare(b.name, "ja");
      }),
    [selectedCompanies],
  );

  const selectedRow = useMemo(() => {
    if (!selection) {
      return null;
    }
    return ROWS.find((row) => row.id === selection.rowId) ?? null;
  }, [selection]);

  const dayLabel = dayValue === formatDate(new Date()) ? "今日" : dayValue;
  const monthLabel = monthValue === formatMonth(new Date()) ? "今月" : monthValue;

  const toggleCompany = (name: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(name) ? prev.filter((value) => value !== name) : [...prev, name],
    );
  };

  return (
    <main className="app-page">
      <div className="app-container">
        <section className="app-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode("month");
                  setSelection(null);
                }}
                className={`app-btn-outline h-8 px-4 text-xs ${viewMode === "month" ? "bg-accent" : ""}`}
              >
                月
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("day");
                  setSelection(null);
                }}
                className={`app-btn-outline h-8 px-4 text-xs ${viewMode === "day" ? "bg-accent" : ""}`}
              >
                日
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  viewMode === "day"
                    ? setDayValue((prev) => moveDate(prev, -1))
                    : setMonthValue((prev) => moveMonth(prev, -1))
                }
                className="app-btn-outline h-8 w-8 px-0"
              >
                <ChevronLeft className="size-4" />
              </button>

              <p className="min-w-28 text-center text-sm font-medium">
                {viewMode === "day" ? dayLabel : monthLabel}
              </p>

              <button
                type="button"
                onClick={() =>
                  viewMode === "day"
                    ? setDayValue((prev) => moveDate(prev, 1))
                    : setMonthValue((prev) => moveMonth(prev, 1))
                }
                className="app-btn-outline h-8 w-8 px-0"
              >
                <ChevronRight className="size-4" />
              </button>

              {viewMode === "day" ? (
                <>
                  <button
                    type="button"
                    onClick={() => dayInputRef.current?.showPicker?.() ?? dayInputRef.current?.click()}
                    className="app-btn-outline h-8 w-8 px-0"
                  >
                    <Calendar className="size-4" />
                  </button>
                  <input
                    ref={dayInputRef}
                    type="date"
                    value={dayValue}
                    onChange={(event) => setDayValue(event.target.value)}
                    className="sr-only"
                  />
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => monthInputRef.current?.showPicker?.() ?? monthInputRef.current?.click()}
                    className="app-btn-outline h-8 w-8 px-0"
                  >
                    <Calendar className="size-4" />
                  </button>
                  <input
                    ref={monthInputRef}
                    type="month"
                    value={monthValue}
                    onChange={(event) => setMonthValue(event.target.value)}
                    className="sr-only"
                  />
                </>
              )}
            </div>
          </div>

          <div className="mt-4 max-w-md">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">協力会社名（複数選択）</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="app-select justify-between"
              >
                <span>
                  {selectedCompanies.length === 0
                    ? "未選択"
                    : selectedCompanies.length === companies.length
                      ? "すべて選択中"
                      : `${selectedCompanies.length}件選択中`}
                </span>
                <span>▼</span>
              </button>
              {isFilterOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-card p-2 shadow">
                  {companies.map((company) => (
                    <label key={company} className="flex items-center gap-2 px-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company)}
                        onChange={() => toggleCompany(company)}
                      />
                      {company}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-6">
            {selection && selectedRow && (
              <div className="absolute inset-x-0 top-0 z-30 rounded-lg border bg-card p-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-medium">チェック内容</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selection.worker} / {selection.company} / {selection.dateLabel}
                      {selection.pattern ? ` / ${selection.pattern}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelection(null)}
                    className="app-btn-outline h-8 w-8 px-0"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {getPatternDetails(selectedRow, selection.mode).map((detail) => (
                    <details
                      key={detail.pattern}
                      open={detail.pattern === (selection.pattern ?? "朝")}
                      className={`rounded-md border ${detail.completed ? "bg-background" : "bg-muted/40"}`}
                    >
                      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium">
                        {detail.pattern}
                        <span className={`ml-2 text-xs ${detail.completed ? "text-primary" : "text-muted-foreground"}`}>
                          {detail.completed ? "チェック済み" : "未記録"}
                        </span>
                      </summary>

                      {detail.completed && detail.items.length > 0 && (
                        <div className="border-t px-3 py-3">
                          <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-xs">
                              <thead className="bg-muted/70">
                                <tr>
                                  <th className="border px-2 py-1 text-left">項目</th>
                                  <th className="border px-2 py-1 text-left">回答</th>
                                  <th className="border px-2 py-1 text-left">状態</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detail.items.map((item) => (
                                  <tr key={`${detail.pattern}-${item.item}`}>
                                    <td className="border px-2 py-1">{item.item}</td>
                                    <td className="border px-2 py-1">{item.answer}</td>
                                    <td className="border px-2 py-1">
                                      <StatusBadge status={item.status} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </div>
            )}

            <div className={`overflow-hidden rounded-lg border bg-background ${selection ? "pt-[420px]" : ""}`}>
              {viewMode === "day" ? (
                <table className="w-full table-fixed text-left text-xs">
                  <thead>
                    <tr className="bg-muted/70">
                      <th className="border px-1 py-1" />
                      <th className="border px-1 py-1" />
                      <th className="border px-1 py-1 text-left text-xs font-medium" colSpan={PATTERNS.length}>
                        パターン名
                      </th>
                    </tr>
                    <tr className="bg-muted/70">
                      <th className="border px-1 py-1 text-xs font-medium">名前</th>
                      <th className="border px-1 py-1 text-xs font-medium">協力会社名</th>
                      {PATTERNS.map((pattern) => (
                        <th key={pattern} className="border px-1 py-1 text-center text-xs font-medium">
                          {pattern}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td className="border px-1 py-1 text-xs">{row.name}</td>
                        <td className="border px-1 py-1 text-xs">{row.company}</td>
                        {PATTERNS.map((pattern) => {
                          const done = Boolean(row.dayChecks[pattern]);
                          return (
                            <td key={`${row.id}-${pattern}`} className="border px-1 py-1 text-center">
                              {done ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelection({
                                      mode: "day",
                                      rowId: row.id,
                                      worker: row.name,
                                      company: row.company,
                                      pattern,
                                      dateLabel: dayValue,
                                    })
                                  }
                                  className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                                >
                                  済
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">未</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full table-fixed text-left text-xs">
                  <thead>
                    <tr className="bg-muted/70">
                      <th className="border px-1 py-1" />
                      <th className="border px-1 py-1" />
                      <th className="border px-1 py-1 text-left text-xs font-medium" colSpan={daysInMonth(monthValue)}>
                        日付
                      </th>
                    </tr>
                    <tr className="bg-muted/70">
                      <th className="border px-1 py-1 text-xs font-medium">名前</th>
                      <th className="border px-1 py-1 text-xs font-medium">協力会社名</th>
                      {Array.from({ length: daysInMonth(monthValue) }, (_, idx) => idx + 1).map((day) => (
                        <th key={day} className="border px-1 py-1 text-center text-xs font-medium">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td className="border px-1 py-1 text-xs">{row.name}</td>
                        <td className="border px-1 py-1 text-xs">{row.company}</td>
                        {Array.from({ length: daysInMonth(monthValue) }, (_, idx) => idx + 1).map((day) => {
                          const done = isMonthDone(row.id, day);
                          return (
                            <td key={`${row.id}-${day}`} className="border px-1 py-1 text-center">
                              {done ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelection({
                                      mode: "month",
                                      rowId: row.id,
                                      worker: row.name,
                                      company: row.company,
                                      dateLabel: `${monthValue}-${String(day).padStart(2, "0")}`,
                                      day,
                                    })
                                  }
                                  className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                                >
                                  済
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">未</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Link href="/heatstroke_check" className="app-link">
              熱中症チェックシステムトップへ戻る
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

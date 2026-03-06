"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, QrCode, X } from "lucide-react";

type ResponseType = "free_text" | "single_choice" | "temperature" | "wbgt" | "ml";

type NormalValue =
  | {
      kind: "single_choice";
      selectedOption: string;
    }
  | {
      kind: "range";
      min: string;
      max: string;
    };

type CheckItem = {
  id: string;
  name: string;
  responseType: ResponseType;
  options: string[];
  normalValue?: NormalValue;
};

type Pattern = {
  id: string;
  name: string;
  items: CheckItem[];
};

const MAX_PATTERNS = 5;
const INITIAL_ITEMS_COUNT = 10;

const RESPONSE_TYPE_LABELS: Record<ResponseType, string> = {
  free_text: "自由記述",
  single_choice: "選択式（単数）",
  temperature: "選択式（体温）",
  wbgt: "選択式（WBGT値）",
  ml: "選択式（ml）",
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function createItem(): CheckItem {
  return {
    id: generateId(),
    name: "",
    responseType: "free_text",
    options: [""],
  };
}

function createDefaultItems(count: number): CheckItem[] {
  return Array.from({ length: count }, () => createItem());
}

function createDefaultPattern(index: number): Pattern {
  return {
    id: generateId(),
    name: `パターン${index + 1}`,
    items: createDefaultItems(INITIAL_ITEMS_COUNT),
  };
}

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

export default function CheckItemSettingsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([createDefaultPattern(0)]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [editingPatternName, setEditingPatternName] = useState("");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const temperatureOptions = useMemo(
    () => Array.from({ length: 61 }, (_, index) => (35 + index * 0.1).toFixed(1)),
    [],
  );
  const wbgtOptions = useMemo(() => Array.from({ length: 30 }, (_, index) => 15 + index), []);
  const mlOptions = useMemo(() => Array.from({ length: 21 }, (_, index) => index * 50), []);

  const activePattern = patterns[activeTabIndex];
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const selectPageUrl = `${origin}/heatstroke_check/check-entry/select`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(selectPageUrl)}`;

  const openPrintWindow = () => {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      return;
    }

    const html = `
      <!doctype html>
      <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>全パターンQRコード印刷</title>
        <style>
          body { font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif; margin: 24px; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; max-width: 360px; }
          .label { font-weight: 700; margin-bottom: 8px; }
          .url { font-size: 12px; color: #555; word-break: break-all; margin-top: 8px; }
          img { width: 220px; height: 220px; }
        </style>
      </head>
      <body>
        <h1>全パターンQRコード印刷</h1>
        <div class="card">
          <div class="label">チェックパターン選択</div>
          <img src="${qrImageUrl}" alt="チェックパターン選択QR" />
          <div class="url">${selectPageUrl}</div>
        </div>
      </body>
      </html>
    `;

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    setTimeout(() => popup.print(), 300);
  };

  const setActivePatternItems = (updater: (items: CheckItem[]) => CheckItem[]) => {
    setPatterns((prev) =>
      prev.map((pattern, index) =>
        index === activeTabIndex ? { ...pattern, items: updater(pattern.items) } : pattern,
      ),
    );
  };

  const handleAddPattern = () => {
    if (patterns.length >= MAX_PATTERNS) {
      return;
    }
    setPatterns((prev) => [...prev, createDefaultPattern(prev.length)]);
    setActiveTabIndex(patterns.length);
    setSaveMessage("");
  };

  const handleDeletePattern = (patternId: string, patternIndex: number) => {
    if (patterns.length <= 1) {
      window.alert("最後の1パターンは削除できません。");
      return;
    }

    if (!window.confirm("本当に削除しますか？")) {
      return;
    }

    setPatterns((prev) => prev.filter((pattern) => pattern.id !== patternId));
    setSaveMessage("");
    setEditingPatternId(null);

    setActiveTabIndex((current) => {
      if (current === patternIndex) {
        return Math.max(0, patternIndex - 1);
      }
      if (current > patternIndex) {
        return current - 1;
      }
      return current;
    });
  };

  const startPatternRename = (patternId: string, currentName: string) => {
    setEditingPatternId(patternId);
    setEditingPatternName(currentName);
  };

  const commitPatternRename = (patternId: string) => {
    const nextName = editingPatternName.trim();
    if (!nextName) {
      setEditingPatternId(null);
      setEditingPatternName("");
      return;
    }

    setPatterns((prev) =>
      prev.map((pattern) => (pattern.id === patternId ? { ...pattern, name: nextName } : pattern)),
    );
    setSaveMessage("");
    setEditingPatternId(null);
    setEditingPatternName("");
  };

  const handleAddItem = () => {
    setActivePatternItems((items) => [...items, createItem()]);
    setSaveMessage("");
  };

  const handleUpdateItem = (itemId: string, updater: (item: CheckItem) => CheckItem) => {
    setActivePatternItems((items) =>
      items.map((item) => (item.id === itemId ? updater(item) : item)),
    );
    setSaveMessage("");
  };

  const handleDeleteItem = (itemId: string) => {
    setActivePatternItems((items) => items.filter((item) => item.id !== itemId));
    setSaveMessage("");
  };

  const handleResponseTypeChange = (item: CheckItem, responseType: ResponseType): CheckItem => {
    if (responseType === "single_choice") {
      return {
        ...item,
        responseType,
        options: item.options.length > 0 ? item.options : [""],
        normalValue: { kind: "single_choice", selectedOption: "" },
      };
    }
    if (responseType === "temperature" || responseType === "wbgt" || responseType === "ml") {
      return {
        ...item,
        responseType,
        options: [],
        normalValue: { kind: "range", min: "", max: "" },
      };
    }
    return {
      ...item,
      responseType,
      options: [],
      normalValue: undefined,
    };
  };

  const handleSave = () => {
    localStorage.setItem("heatstroke-check-master-patterns", JSON.stringify(patterns));
    setSaveMessage("保存しました");
  };

  return (
    <main className="app-page">
      <div className="app-container">
        <section className="mb-6">
          <h1 className="text-3xl tracking-tight">熱中症チェックシート マスター作成</h1>
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="app-btn-outline mt-3 h-9 px-4"
          >
            <QrCode className="size-4" />
            全パターンQRコード印刷
          </button>
        </section>

        <section className="app-panel p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 flex-1 items-center gap-1 rounded-md bg-muted p-1">
              {patterns.map((pattern, index) => (
                <div
                  key={pattern.id}
                  className={`flex h-8 items-center rounded-md px-2 ${
                    index === activeTabIndex ? "bg-background shadow-sm" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTabIndex(index)}
                    className={`text-xs ${
                      index === activeTabIndex
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {editingPatternId === pattern.id ? (
                      <input
                        value={editingPatternName}
                        autoFocus
                        onChange={(event) => setEditingPatternName(event.target.value)}
                        onBlur={() => commitPatternRename(pattern.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            commitPatternRename(pattern.id);
                          }
                          if (event.key === "Escape") {
                            setEditingPatternId(null);
                            setEditingPatternName("");
                          }
                        }}
                        className="h-6 w-24 rounded border bg-input-background px-2 text-xs"
                      />
                    ) : (
                      pattern.name
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => startPatternRename(pattern.id, pattern.name)}
                    className="ml-1 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="パターン名を編集"
                  >
                    <Pencil className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePattern(pattern.id, index)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                    aria-label="パターンを削除"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {patterns.length < MAX_PATTERNS && (
              <button type="button" onClick={handleAddPattern} className="app-btn-outline h-8 px-3 text-xs">
                ＋ パターン追加
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {activePattern.items.map((item, index) => {
              const choiceOptions = item.options.filter((option) => option.trim() !== "");

              return (
                <article key={item.id} className="rounded-lg border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">項目 {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-xs font-medium text-destructive hover:underline"
                    >
                      削除
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-sm">
                      <span className="mb-1 block text-muted-foreground">項目名</span>
                      <input
                        value={item.name}
                        onChange={(event) =>
                          handleUpdateItem(item.id, (current) => ({ ...current, name: event.target.value }))
                        }
                        placeholder="項目名を入力"
                        className="app-input"
                      />
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 block text-muted-foreground">回答方法</span>
                      <select
                        value={item.responseType}
                        onChange={(event) =>
                          handleUpdateItem(item.id, (current) =>
                            handleResponseTypeChange(current, event.target.value as ResponseType),
                          )
                        }
                        className="app-select"
                      >
                        {(Object.keys(RESPONSE_TYPE_LABELS) as ResponseType[]).map((type) => (
                          <option key={type} value={type}>
                            {RESPONSE_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {item.responseType === "single_choice" && (
                    <div className="mt-4 rounded-md border bg-card p-3">
                      <p className="text-sm text-muted-foreground">選択肢</p>
                      <div className="mt-2 space-y-2">
                        {item.options.map((option, optionIndex) => (
                          <div key={`${item.id}-option-${optionIndex}`} className="flex gap-2">
                            <input
                              value={option}
                              onChange={(event) =>
                                handleUpdateItem(item.id, (current) => {
                                  const updatedOptions = [...current.options];
                                  updatedOptions[optionIndex] = event.target.value;
                                  const nextNormal =
                                    current.normalValue?.kind === "single_choice" &&
                                    !updatedOptions.includes(current.normalValue.selectedOption)
                                      ? { kind: "single_choice" as const, selectedOption: "" }
                                      : current.normalValue;
                                  return { ...current, options: updatedOptions, normalValue: nextNormal };
                                })
                              }
                              placeholder={`選択肢${optionIndex + 1}`}
                              className="app-input"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItem(item.id, (current) => {
                                  const updatedOptions = current.options.filter((_, idx) => idx !== optionIndex);
                                  const nextNormal =
                                    current.normalValue?.kind === "single_choice" &&
                                    !updatedOptions.includes(current.normalValue.selectedOption)
                                      ? { kind: "single_choice" as const, selectedOption: "" }
                                      : current.normalValue;
                                  return { ...current, options: updatedOptions, normalValue: nextNormal };
                                })
                              }
                              className="app-btn-outline h-9 w-9 px-0"
                            >
                              -
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateItem(item.id, (current) => ({ ...current, options: [...current.options, ""] }))
                        }
                        className="app-btn-outline mt-3 h-8 px-3 text-xs"
                      >
                        ＋ 選択肢追加
                      </button>

                      <div className="mt-4">
                        <label className="text-sm">
                          <span className="mb-1 block text-muted-foreground">正常値（選択肢）</span>
                          <select
                            value={
                              item.normalValue?.kind === "single_choice"
                                ? item.normalValue.selectedOption
                                : ""
                            }
                            onChange={(event) =>
                              handleUpdateItem(item.id, (current) => ({
                                ...current,
                                normalValue: { kind: "single_choice", selectedOption: event.target.value },
                              }))
                            }
                            className="app-select"
                          >
                            <option value="">正常値を選択してください</option>
                            {choiceOptions.map((option) => (
                              <option key={`${item.id}-normal-${option}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}

                  {item.responseType === "temperature" && (
                    <div className="mt-4 rounded-md border bg-card p-3">
                      <p className="text-sm text-muted-foreground">回答候補: 35.0℃ から 41.0℃ まで（0.1℃刻み）</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="text-sm">
                          <span className="mb-1 block text-muted-foreground">正常値（以上）</span>
                          <select
                            value={item.normalValue?.kind === "range" ? item.normalValue.min : ""}
                            onChange={(event) =>
                              handleUpdateItem(item.id, (current) => ({
                                ...current,
                                normalValue: {
                                  kind: "range",
                                  min: event.target.value,
                                  max: current.normalValue?.kind === "range" ? current.normalValue.max : "",
                                },
                              }))
                            }
                            className="app-select"
                          >
                            <option value="">未設定</option>
                            {temperatureOptions.map((value) => (
                              <option key={`${item.id}-min-${value}`} value={value}>
                                {value}℃以上
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-sm">
                          <span className="mb-1 block text-muted-foreground">正常値（以下）</span>
                          <select
                            value={item.normalValue?.kind === "range" ? item.normalValue.max : ""}
                            onChange={(event) =>
                              handleUpdateItem(item.id, (current) => ({
                                ...current,
                                normalValue: {
                                  kind: "range",
                                  min: current.normalValue?.kind === "range" ? current.normalValue.min : "",
                                  max: event.target.value,
                                },
                              }))
                            }
                            className="app-select"
                          >
                            <option value="">未設定</option>
                            {temperatureOptions.map((value) => (
                              <option key={`${item.id}-max-${value}`} value={value}>
                                {value}℃以下
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}

                  {item.responseType === "wbgt" && (
                    <div className="mt-4 rounded-md border bg-card p-3">
                      <p className="text-sm text-muted-foreground">回答候補: 15 から 44 まで</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="text-sm">
                          <span className="mb-1 block text-muted-foreground">正常値（以上）</span>
                          <select
                            value={item.normalValue?.kind === "range" ? item.normalValue.min : ""}
                            onChange={(event) =>
                              handleUpdateItem(item.id, (current) => ({
                                ...current,
                                normalValue: {
                                  kind: "range",
                                  min: event.target.value,
                                  max: current.normalValue?.kind === "range" ? current.normalValue.max : "",
                                },
                              }))
                            }
                            className="app-select"
                          >
                            <option value="">未設定</option>
                            {wbgtOptions.map((value) => (
                              <option key={`${item.id}-wbgt-min-${value}`} value={String(value)}>
                                {getWbgtLabel(value)}以上
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-sm">
                          <span className="mb-1 block text-muted-foreground">正常値（以下）</span>
                          <select
                            value={item.normalValue?.kind === "range" ? item.normalValue.max : ""}
                            onChange={(event) =>
                              handleUpdateItem(item.id, (current) => ({
                                ...current,
                                normalValue: {
                                  kind: "range",
                                  min: current.normalValue?.kind === "range" ? current.normalValue.min : "",
                                  max: event.target.value,
                                },
                              }))
                            }
                            className="app-select"
                          >
                            <option value="">未設定</option>
                            {wbgtOptions.map((value) => (
                              <option key={`${item.id}-wbgt-max-${value}`} value={String(value)}>
                                {getWbgtLabel(value)}以下
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}

                  {item.responseType === "ml" && (
                    <div className="mt-4 rounded-md border bg-card p-3">
                      <p className="text-sm text-muted-foreground">回答候補: 0 から 1000ml まで（50ml刻み）</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="text-sm">
                          <span className="mb-1 block text-muted-foreground">正常値（以上）</span>
                          <select
                            value={item.normalValue?.kind === "range" ? item.normalValue.min : ""}
                            onChange={(event) =>
                              handleUpdateItem(item.id, (current) => ({
                                ...current,
                                normalValue: {
                                  kind: "range",
                                  min: event.target.value,
                                  max: current.normalValue?.kind === "range" ? current.normalValue.max : "",
                                },
                              }))
                            }
                            className="app-select"
                          >
                            <option value="">未設定</option>
                            {mlOptions.map((value) => (
                              <option key={`${item.id}-ml-min-${value}`} value={String(value)}>
                                {value}ml以上
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-sm">
                          <span className="mb-1 block text-muted-foreground">正常値（以下）</span>
                          <select
                            value={item.normalValue?.kind === "range" ? item.normalValue.max : ""}
                            onChange={(event) =>
                              handleUpdateItem(item.id, (current) => ({
                                ...current,
                                normalValue: {
                                  kind: "range",
                                  min: current.normalValue?.kind === "range" ? current.normalValue.min : "",
                                  max: event.target.value,
                                },
                              }))
                            }
                            className="app-select"
                          >
                            <option value="">未設定</option>
                            {mlOptions.map((value) => (
                              <option key={`${item.id}-ml-max-${value}`} value={String(value)}>
                                {value}ml以下
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            <button type="button" onClick={handleAddItem} className="app-btn-outline w-full border-dashed">
              ＋ 項目を追加
            </button>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between">
          <Link href="/heatstroke_check" className="app-link">
            熱中症チェックシステムトップへ戻る
          </Link>

          <div className="flex items-center gap-3">
            {saveMessage && <span className="text-sm text-primary">{saveMessage}</span>}
            <button type="button" onClick={handleSave} className="app-btn-primary min-w-32">
              保存
            </button>
          </div>
        </div>

        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-medium">全パターンQRコード印刷</h2>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 rounded-md border bg-background p-4 text-center">
                <p className="text-sm font-medium">チェックパターン選択</p>
                <img src={qrImageUrl} alt="全パターンQRコード" className="mx-auto mt-3 h-52 w-52" />
                <p className="mt-3 break-all text-xs text-muted-foreground">{selectPageUrl}</p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsQrModalOpen(false)} className="app-btn-outline">
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={openPrintWindow}
                  className="app-btn-primary"
                >
                  印刷する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

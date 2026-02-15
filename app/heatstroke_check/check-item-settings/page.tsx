"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ResponseType = "free_text" | "single_choice" | "temperature" | "numeric";

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
  numeric: "選択式（数値）",
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

export default function CheckItemSettingsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([createDefaultPattern(0)]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");

  const temperatureOptions = useMemo(
    () => Array.from({ length: 61 }, (_, index) => (35 + index * 0.1).toFixed(1)),
    [],
  );
  const numericOptions = useMemo(() => Array.from({ length: 101 }, (_, index) => String(index)), []);

  const activePattern = patterns[activeTabIndex];

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
    if (responseType === "temperature" || responseType === "numeric") {
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
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            ここで設定した項目は、ユーザーがQRコードを読み込んでチェックを実施する際に表示される内容になります。
          </p>
        </section>

        <section className="app-panel p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 flex-1 items-center gap-1 rounded-md bg-muted p-1">
              {patterns.map((pattern, index) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => setActiveTabIndex(index)}
                  className={`app-btn h-7 px-3 py-1 text-xs ${
                    index === activeTabIndex
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70"
                  }`}
                >
                  {pattern.name}
                </button>
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

                  {item.responseType === "numeric" && (
                    <div className="mt-4 rounded-md border bg-card p-3">
                      <p className="text-sm text-muted-foreground">回答候補: 0 から 100 まで</p>
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
                            {numericOptions.map((value) => (
                              <option key={`${item.id}-num-min-${value}`} value={value}>
                                {value}以上
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
                            {numericOptions.map((value) => (
                              <option key={`${item.id}-num-max-${value}`} value={value}>
                                {value}以下
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
      </div>
    </main>
  );
}

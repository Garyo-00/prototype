"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Upload } from "lucide-react";

type PlanPin = {
  x: number;
  y: number;
};

type PlanRegion = {
  pins: PlanPin[];
  isPolygonClosed: boolean;
};

type SavedPlan = {
  imageUrl: string;
  regions: PlanRegion[];
};

export default function HotWorkPermitCreatePage() {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);

  const [dialogImageUrl, setDialogImageUrl] = useState<string | null>(null);
  const [dialogRegions, setDialogRegions] = useState<PlanRegion[]>([]);
  const [activePins, setActivePins] = useState<PlanPin[]>([]);
  const [planError, setPlanError] = useState("");

  const activeShapePoints = useMemo(
    () => activePins.map((pin) => `${pin.x},${pin.y}`).join(" "),
    [activePins],
  );

  const savedTotalPins = useMemo(
    () => (savedPlan ? savedPlan.regions.reduce((sum, region) => sum + region.pins.length, 0) : 0),
    [savedPlan],
  );

  const dialogTotalPins = useMemo(
    () => dialogRegions.reduce((sum, region) => sum + region.pins.length, 0) + activePins.length,
    [dialogRegions, activePins],
  );

  const openPlanDialog = () => {
    setPlanError("");
    if (savedPlan) {
      setDialogImageUrl(savedPlan.imageUrl);
      setDialogRegions(savedPlan.regions);
    } else {
      setDialogImageUrl(null);
      setDialogRegions([]);
    }
    setActivePins([]);
    setShowPlanDialog(true);
  };

  const cleanupDialogImageIfUnsaved = () => {
    if (dialogImageUrl && dialogImageUrl !== savedPlan?.imageUrl) {
      URL.revokeObjectURL(dialogImageUrl);
    }
  };

  const closePlanDialog = () => {
    cleanupDialogImageIfUnsaved();
    setDialogImageUrl(null);
    setDialogRegions([]);
    setActivePins([]);
    setPlanError("");
    setShowPlanDialog(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (dialogImageUrl && dialogImageUrl !== savedPlan?.imageUrl) {
      URL.revokeObjectURL(dialogImageUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setDialogImageUrl(nextUrl);
    setDialogRegions([]);
    setActivePins([]);
    setPlanError("");
    event.currentTarget.value = "";
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dialogImageUrl) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));

    setActivePins((prev) => [...prev, { x, y }]);
    setPlanError("");
  };

  const finalizePolygonRegion = () => {
    if (activePins.length < 3) {
      setPlanError("範囲指定は3点以上のピンが必要です。");
      return;
    }

    setDialogRegions((prev) => [...prev, { pins: activePins, isPolygonClosed: true }]);
    setActivePins([]);
    setPlanError("");
  };

  const finalizeSinglePinRegion = () => {
    if (activePins.length !== 1) {
      setPlanError("単数ピン確定は1点のみ配置された状態で実行してください。");
      return;
    }

    setDialogRegions((prev) => [...prev, { pins: [activePins[0]], isPolygonClosed: false }]);
    setActivePins([]);
    setPlanError("");
  };

  const handleActivePinClick = (index: number) => {
    if (index === 0 && activePins.length >= 3) {
      finalizePolygonRegion();
    }
  };

  const handleResetPins = () => {
    setDialogRegions([]);
    setActivePins([]);
    setPlanError("");
  };

  const handleSavePlan = () => {
    let nextRegions = dialogRegions;

    if (activePins.length === 1) {
      nextRegions = [...dialogRegions, { pins: [activePins[0]], isPolygonClosed: false }];
    }

    if (activePins.length === 2) {
      setPlanError("2点の状態では保存できません。単数ピン確定、または3点以上で範囲を確定してください。");
      return;
    }

    if (activePins.length >= 3) {
      setPlanError("編集中の範囲があります。先頭ピンをクリックして範囲を確定してから保存してください。");
      return;
    }

    const totalPins = nextRegions.reduce((sum, region) => sum + region.pins.length, 0);
    if (dialogImageUrl && totalPins === 0) {
      setPlanError("画像登録後は、少なくとも1点以上のピンを配置してください。");
      return;
    }

    setSavedPlan((prev) => {
      if (!dialogImageUrl) {
        if (prev?.imageUrl) {
          URL.revokeObjectURL(prev.imageUrl);
        }
        return null;
      }

      if (prev?.imageUrl && prev.imageUrl !== dialogImageUrl) {
        URL.revokeObjectURL(prev.imageUrl);
      }

      return {
        imageUrl: dialogImageUrl,
        regions: nextRegions,
      };
    });

    setDialogImageUrl(null);
    setDialogRegions([]);
    setActivePins([]);
    setPlanError("");
    setShowPlanDialog(false);
  };

  return (
    <main className="min-h-screen bg-[#ececec] text-[#1f1f1f]">
      <header className="flex h-14 items-center justify-end bg-[#17c1cc] px-4 text-white">
        <nav className="flex items-center gap-4 text-lg font-medium">
          <button type="button">申請</button>
          <button type="button">承認</button>
          <button type="button" className="inline-flex items-center gap-1">
            メニュー
            <ChevronDown className="size-4" />
          </button>
          <button type="button" className="inline-flex items-center gap-1">
            マニュアル
            <ChevronDown className="size-4" />
          </button>
        </nav>
      </header>

      <div className="px-4 py-3">
        <Link href="/hot-work-permit" className="text-lg font-medium text-[#1667d9]">
          ≪戻る
        </Link>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-14">
        <h1 className="mb-6 pt-4 text-center text-3xl font-semibold">火気使用届 新規作成</h1>

        <section className="overflow-hidden rounded-md border border-[#cfd5dc] bg-[#f2f2f2]">
          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">申請日</LabelCell>
            <ValueCell className="col-span-4">2026年3月6日</ValueCell>
            <LabelCell className="col-span-2">申請会社</LabelCell>
            <ValueCell className="col-span-4">株式会社Arch</ValueCell>
          </div>

          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">申請者</LabelCell>
            <ValueCell className="col-span-4">星野 遼河</ValueCell>
            <LabelCell className="col-span-2">現場名</LabelCell>
            <ValueCell className="col-span-4">テストプロジェクト_星野</ValueCell>
          </div>

          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">使用日</LabelCell>
            <ValueCell className="col-span-10">
              <div className="flex flex-wrap items-center gap-2">
                <InputLike className="w-44">2026/03/06</InputLike>
                <span>〜</span>
                <InputLike className="w-44">2026/03/06</InputLike>
              </div>
            </ValueCell>
          </div>

          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">作業時間</LabelCell>
            <ValueCell className="col-span-10">
              <div className="flex flex-wrap items-center gap-2">
                <InputLike className="w-28">08:30</InputLike>
                <span>〜</span>
                <InputLike className="w-28">17:30</InputLike>
              </div>
            </ValueCell>
          </div>

          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">使用場所</LabelCell>
            <ValueCell className="col-span-10">
              <div className="flex flex-wrap items-center gap-2">
                <InputLike className="w-28">3F</InputLike>
                <InputLike className="w-[420px]">東側階段前の配管周辺</InputLike>
              </div>
            </ValueCell>
          </div>

          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">火気作業種別</LabelCell>
            <ValueCell className="col-span-10">
              <div className="flex flex-wrap gap-2">
                <Chip>溶接</Chip>
                <Chip>溶断</Chip>
                <Chip>グラインダー</Chip>
                <Chip>バーナー</Chip>
              </div>
            </ValueCell>
          </div>

          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">作業内容</LabelCell>
            <ValueCell className="col-span-10">
              <textarea
                className="min-h-20 w-full rounded border border-[#cfd5dc] bg-white px-3 py-2 text-base"
                defaultValue="ダクト支持材の溶接補修作業"
              />
            </ValueCell>
          </div>

          <div className="grid grid-cols-12 border-b border-[#cfd5dc]">
            <LabelCell className="col-span-2">安全対策</LabelCell>
            <ValueCell className="col-span-10">
              <div className="grid gap-2 md:grid-cols-2">
                <CheckRow label="消火器を設置する" defaultChecked />
                <CheckRow label="監視人を配置する" defaultChecked />
                <CheckRow label="可燃物の養生・撤去" defaultChecked />
                <CheckRow label="火花受けシートを設置" />
              </div>
            </ValueCell>
          </div>

          <div className="grid grid-cols-12">
            <LabelCell className="col-span-2">作業平面図</LabelCell>
            <ValueCell className="col-span-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[#555]">
                  {savedPlan
                    ? `登録済み（エリア: ${savedPlan.regions.length} / ピン: ${savedTotalPins}点）`
                    : "未登録"}
                </span>
                <button
                  type="button"
                  onClick={openPlanDialog}
                  className="rounded-md border border-[#17c1cc] bg-[#f4fbfd] px-4 py-2 text-base font-medium"
                >
                  作業平面図に登録
                </button>
              </div>
            </ValueCell>
          </div>
        </section>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="rounded-md bg-[#0ea9b4] px-14 py-2.5 text-xl font-semibold text-white hover:bg-[#0b96a0]"
          >
            申請
          </button>
        </div>
      </div>

      {showPlanDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">作業平面図に登録</h2>
            <p className="mt-1 text-sm text-[#555]">
              画像を登録後、台紙をクリックしてピンを配置してください。先頭ピンをクリックすると範囲指定を確定できます。
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#17c1cc] bg-[#f4fbfd] px-4 py-2 text-sm font-medium">
                <Upload className="size-4" />
                画像ファイルを選択
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              <button
                type="button"
                onClick={finalizeSinglePinRegion}
                className="rounded-md border border-[#cfd5dc] bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                disabled={activePins.length !== 1}
              >
                単数ピンで確定
              </button>

              <button
                type="button"
                onClick={finalizePolygonRegion}
                className="rounded-md border border-[#cfd5dc] bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                disabled={activePins.length < 3}
              >
                範囲を確定
              </button>

              <button
                type="button"
                onClick={handleResetPins}
                className="rounded-md border border-[#cfd5dc] bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!dialogImageUrl || dialogTotalPins === 0}
              >
                ピンをリセット
              </button>

              <span className="text-sm text-[#555]">
                エリア: {dialogRegions.length} / ピン: {dialogTotalPins}点 / 編集中: {activePins.length}点
              </span>
            </div>

            <div className="mt-4">
              <div
                className="relative h-[460px] w-full overflow-hidden rounded-md border border-[#cfd5dc] bg-[#f3f3f3]"
                onClick={handleMapClick}
              >
                {dialogImageUrl ? (
                  <>
                    <Image
                      src={dialogImageUrl}
                      alt="作業平面図"
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(max-width: 1200px) 100vw, 1100px"
                    />

                    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {dialogRegions.map((region, index) => {
                        const points = region.pins.map((pin) => `${pin.x},${pin.y}`).join(" ");
                        return (
                          <g key={`region-${index}`}>
                            {region.pins.length >= 2 ? (
                              <polyline
                                points={points}
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="0.35"
                                strokeLinejoin="round"
                              />
                            ) : null}

                            {region.isPolygonClosed && region.pins.length >= 3 ? (
                              <polygon
                                points={points}
                                fill="rgba(37, 99, 235, 0.18)"
                                stroke="#2563eb"
                                strokeWidth="0.4"
                                strokeLinejoin="round"
                              />
                            ) : null}
                          </g>
                        );
                      })}

                      {activePins.length >= 2 ? (
                        <polyline
                          points={activeShapePoints}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="0.4"
                          strokeLinejoin="round"
                        />
                      ) : null}
                    </svg>

                    {dialogRegions.map((region, regionIndex) =>
                      region.pins.map((pin, pinIndex) => (
                        <div
                          key={`saved-pin-${regionIndex}-${pinIndex}`}
                          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-[#2563eb] text-[10px] font-bold text-white shadow h-6 w-6"
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          title={`エリア${regionIndex + 1} / ピン${pinIndex + 1}`}
                        >
                          <span className="flex h-full w-full items-center justify-center">{pinIndex + 1}</span>
                        </div>
                      )),
                    )}

                    {activePins.map((pin, index) => (
                      <button
                        key={`active-pin-${index}-${pin.x}-${pin.y}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleActivePinClick(index);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white text-[10px] font-bold text-white shadow h-6 w-6 ${
                          index === 0 ? "bg-[#0f766e]" : "bg-[#dc2626]"
                        }`}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        title={index === 0 ? "先頭ピン（クリックで範囲確定）" : `編集中ピン${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#777]">
                    ここに登録画像が表示されます
                  </div>
                )}
              </div>
            </div>

            {planError ? <p className="mt-3 text-sm font-medium text-[#d93d3d]">{planError}</p> : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closePlanDialog}
                className="rounded-md border border-[#cfd5dc] bg-white px-5 py-2 text-sm font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSavePlan}
                className="rounded-md bg-[#0ea9b4] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b96a0] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={Boolean(dialogImageUrl && dialogTotalPins === 0)}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function LabelCell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex min-h-14 items-center border-r border-[#cfd5dc] bg-[#e9edf1] px-3 text-base font-semibold ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function ValueCell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`flex min-h-14 items-center bg-[#f7f7f7] px-3 py-2 text-base ${className ?? ""}`}>{children}</div>;
}

function InputLike({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={`inline-flex h-10 items-center rounded border border-[#cfd5dc] bg-white px-3 text-base ${className ?? ""}`}>{children}</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#bcc6d0] bg-white px-3 py-1 text-sm">
      {children}
    </span>
  );
}

function CheckRow({
  label,
  defaultChecked = false,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-[#0ea9b4]" defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

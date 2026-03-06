"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Link2,
  Map,
  X,
} from "lucide-react";

type WorkStatus = "作業前" | "作業中" | "作業終了" | "残火確認済";

type PermitRecord = {
  id: string;
  company: string;
  applicant: string;
  location: string;
  status: WorkStatus;
};

type PlanPin = {
  x: number;
  y: number;
};

type OverlayPermit = {
  id: string;
  company: string;
  status: WorkStatus;
  color: {
    stroke: string;
    fill: string;
    pin: string;
    badge: string;
    badgeText: string;
  };
  pins: PlanPin[];
  isArea: boolean;
};

const records: PermitRecord[] = [
  {
    id: "01",
    company: "株式会社Arch",
    applicant: "発注速人",
    location: "",
    status: "作業前",
  },
  {
    id: "02",
    company: "株式会社Arch",
    applicant: "星野 遼河",
    location: "1F",
    status: "作業中",
  },
  {
    id: "03",
    company: "株式会社Arch",
    applicant: "Arch管理者",
    location: "2F",
    status: "作業終了",
  },
  {
    id: "04",
    company: "株式会社Arch",
    applicant: "Arch管理者",
    location: "3F",
    status: "残火確認済",
  },
];

const statusClassName: Record<WorkStatus, string> = {
  作業前: "bg-[#ced8e5] text-[#1f5bc0]",
  作業中: "bg-[#e6d3e6] text-[#d93d3d]",
  作業終了: "bg-[#d8d8d8] text-[#3f3f3f]",
  残火確認済: "bg-[#d2e6d0] text-[#2b8e4f]",
};

const overlayPermits: OverlayPermit[] = [
  {
    id: "arch",
    company: "株式会社Arch",
    status: "作業前",
    color: {
      stroke: "#1d4ed8",
      fill: "rgba(29, 78, 216, 0.24)",
      pin: "#1d4ed8",
      badge: "#dbeafe",
      badgeText: "#1e3a8a",
    },
    pins: [{ x: 24, y: 66 }],
    isArea: false,
  },
  {
    id: "hirata",
    company: "株式会社平田建設",
    status: "作業中",
    color: {
      stroke: "#dc2626",
      fill: "rgba(220, 38, 38, 0.24)",
      pin: "#dc2626",
      badge: "#fee2e2",
      badgeText: "#7f1d1d",
    },
    pins: [
      { x: 42, y: 42 },
      { x: 56, y: 41 },
      { x: 58, y: 54 },
      { x: 43, y: 55 },
    ],
    isArea: true,
  },
  {
    id: "ishio",
    company: "石尾組",
    status: "残火確認済",
    color: {
      stroke: "#15803d",
      fill: "rgba(21, 128, 61, 0.24)",
      pin: "#15803d",
      badge: "#dcfce7",
      badgeText: "#14532d",
    },
    pins: [
      { x: 66, y: 58 },
      { x: 76, y: 57 },
      { x: 79, y: 67 },
      { x: 71, y: 74 },
      { x: 63, y: 68 },
    ],
    isArea: true,
  },
];

export default function HotWorkPermitPage() {
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

  const overlays = useMemo(
    () =>
      overlayPermits.map((permit) => {
        const points = permit.pins.map((pin) => `${pin.x},${pin.y}`).join(" ");
        const center = permit.pins.reduce(
          (acc, pin) => ({ x: acc.x + pin.x, y: acc.y + pin.y }),
          { x: 0, y: 0 },
        );

        return {
          ...permit,
          points,
          labelX: center.x / permit.pins.length,
          labelY: center.y / permit.pins.length,
        };
      }),
    [],
  );

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
        <Link href="/" className="text-lg font-medium text-[#1667d9]">
          ≪戻る
        </Link>
      </div>

      <div className="px-4">
        <h1 className="mb-8 pt-8 text-center text-3xl font-semibold">火気使用届一覧</h1>

        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-2xl">
            <span className="font-semibold">使用日：3月6日</span>
            <button
              type="button"
              className="rounded border border-transparent p-1 text-[#2d73e0] hover:border-[#2d73e0]"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="rounded border border-transparent p-1 text-[#2d73e0] hover:border-[#2d73e0]"
            >
              <CalendarDays className="size-5" />
            </button>
            <button
              type="button"
              className="rounded border border-transparent p-1 text-[#2d73e0] hover:border-[#2d73e0]"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md border border-[#17c1cc] bg-[#f4fbfd] px-3 py-1.5 text-xl font-medium text-[#343434]"
            >
              作成フォームQRコード印刷
            </button>
            <Link
              href="/hot-work-permit/create"
              className="rounded-md border border-[#17c1cc] bg-[#f4fbfd] px-3 py-1.5 text-xl font-medium text-[#343434]"
            >
              新規作成
            </Link>
          </div>
        </div>

        <section className="overflow-x-auto border border-[#ced3d9] bg-[#efefef]">
          <table className="w-full min-w-[960px] table-fixed border-collapse text-xl">
            <thead>
              <tr className="h-12 bg-[#eceff2] text-center">
                <th className="w-[60px] border border-[#ced3d9] font-semibold">URL</th>
                <th className="w-[240px] border border-[#ced3d9] font-semibold">申請会社</th>
                <th className="w-[240px] border border-[#ced3d9] font-semibold">申請者</th>
                <th className="border border-[#ced3d9] font-semibold">使用場所</th>
                <th className="w-[190px] border border-[#ced3d9] font-semibold">作業ステータス</th>
                <th className="w-[76px] border border-[#ced3d9] font-semibold">詳細</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="h-12 bg-[#f1f1f1]">
                  <td className="border border-[#ced3d9] text-center">
                    <button type="button" className="text-[#333]">
                      <Link2 className="mx-auto size-4" />
                    </button>
                  </td>
                  <td className="border border-[#ced3d9] px-2">{record.company}</td>
                  <td className="border border-[#ced3d9] px-2">{record.applicant}</td>
                  <td className="border border-[#ced3d9] px-2">
                    <div className="inline-flex items-center gap-2">
                      {record.location}
                      {record.location ? (
                        <button
                          type="button"
                          onClick={() => setIsMapDialogOpen(true)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#2d73e0] bg-white text-[#2d73e0] hover:bg-[#eaf2ff]"
                          aria-label="作業平面図を表示"
                          title="作業平面図を表示"
                        >
                          <Map className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className={`border border-[#ced3d9] text-center font-semibold ${statusClassName[record.status]}`}>
                    {record.status}
                  </td>
                  <td className="border border-[#ced3d9] p-1 text-center">
                    <button
                      type="button"
                      className="rounded-md border border-[#17c1cc] bg-[#f4fbfd] px-3 py-0.5 text-base font-medium"
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {isMapDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-6xl rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#d7d7d7] pb-3">
              <h2 className="text-xl font-semibold">作業平面図（複数届け出の重ね合わせ表示）</h2>
              <button
                type="button"
                onClick={() => setIsMapDialogOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d7d7d7] hover:bg-[#f4f4f4]"
                aria-label="閉じる"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-sm text-[#555]">
              サンプル表示: 3件の火気使用届（単数ピン1件、範囲指定2件）を色分けして表示しています。
            </p>

            <div className="mt-4">
              <div className="relative mx-auto aspect-[1200/930] w-full max-w-[1080px] overflow-hidden rounded-md border border-[#cfd5dc] bg-[#f7f7f7]">
                <Image
                  src="/hot-work-plan-base.svg"
                  alt="作業平面図"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1080px"
                />

                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {overlays.map((permit) => (
                    <g key={`shape-${permit.id}`}>
                      {permit.pins.length >= 2 ? (
                        <polyline
                          points={permit.points}
                          fill="none"
                          stroke={permit.color.stroke}
                          strokeWidth="0.4"
                          strokeLinejoin="round"
                        />
                      ) : null}

                      {permit.isArea && permit.pins.length >= 3 ? (
                        <polygon
                          points={permit.points}
                          fill={permit.color.fill}
                          stroke={permit.color.stroke}
                          strokeWidth="0.45"
                          strokeLinejoin="round"
                        />
                      ) : null}
                    </g>
                  ))}
                </svg>

                {overlays.map((permit) => (
                  <div
                    key={`label-${permit.id}`}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
                    style={{ left: `${permit.labelX}%`, top: `${permit.labelY - 2}%` }}
                  >
                    <div
                      className="whitespace-nowrap rounded border px-2 py-1 text-xs font-semibold shadow"
                      style={{
                        borderColor: permit.color.stroke,
                        backgroundColor: permit.color.badge,
                        color: permit.color.badgeText,
                      }}
                    >
                      {permit.company} / {permit.status}
                    </div>
                  </div>
                ))}

                {overlays.flatMap((permit) =>
                  permit.pins.map((pin, index) => (
                    <div
                      key={`pin-${permit.id}-${index}`}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        backgroundColor: permit.color.pin,
                        width: "14px",
                        height: "14px",
                      }}
                      title={`${permit.company} ${permit.status}`}
                    />
                  )),
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMapDialogOpen(false)}
                className="rounded-md border border-[#17c1cc] bg-[#f4fbfd] px-4 py-1.5 text-sm font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

/**
 * Live_DataBase.csv インポートスクリプト
 * 使い方: IMPORT_USER_EMAIL=xxx@xxx.com npx ts-node --project tsconfig.scripts.json scripts/import-live-database.ts
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CSV_PATH = path.resolve(
  "/Users/yamamotoryota/Desktop/アプリ開発/ドルスケ/Live_DataBase.csv"
);

// エリアキーワードマッピング
function detectArea(areaStr: string): string {
  const s = areaStr;

  // 大阪系
  if (/大阪|梅田|心斎橋|難波|なんば|天王寺|福島|淀屋橋|本町|北堀江|ミナミ|キタ/.test(s)) return "大阪";
  // 名古屋系
  if (/名古屋|栄|大須|今池|覚王山|鶴舞/.test(s)) return "名古屋";
  // 福岡系
  if (/福岡|博多|天神|小倉|北九州/.test(s)) return "福岡";
  // 札幌系
  if (/札幌|すすきの|北海道/.test(s)) return "札幌";
  // 仙台系
  if (/仙台|宮城/.test(s)) return "仙台";
  // 東京系（都内 + 近郊）
  if (/東京|渋谷|新宿|池袋|秋葉原|下北沢|吉祥寺|中野|高円寺|代官山|恵比寿|目黒|五反田|品川|表参道|原宿|銀座|有楽町|上野|浅草|汐留|お台場|台場|青海|豊洲|六本木|赤坂|四谷|荻窪|三軒茶屋|北千住|錦糸町|水道橋|御茶ノ水|神保町|市ヶ谷|飯田橋|新橋|虎ノ門|浜松町|田町|大崎|蒲田|川崎|横浜|武蔵小杉|溝の口|二子玉川|町田|相模原|千葉|埼玉|さいたま|大宮|浦和|川口|所沢|八王子|立川|国分寺/.test(s)) return "東京";

  return "その他";
}

// CSVの1行をパース（クォート対応）
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {

  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  // ヘッダー確認
  // ID,idolName,liveName,date,time,venue,area,URL,author,URL,Created,Updated
  const headers = parseCsvLine(lines[0]);
  console.log(`ヘッダー: ${headers.join(" | ")}`);
  console.log(`データ行数: ${lines.length - 1}\n`);

  const idxOf = (name: string) => headers.indexOf(name);
  const I = {
    idolName: idxOf("idolName"),
    liveName: idxOf("liveName"),
    time:     idxOf("time"),
    venue:    idxOf("venue"),
    area:     idxOf("area"),
    url:      idxOf("URL"), // 最初のURLを使用
  };

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 8) continue;

    const idolName = cols[I.idolName] || "";
    const liveName = cols[I.liveName] || "";
    const timeStr  = cols[I.time]     || "";
    const venue    = cols[I.venue]    || "";
    const areaRaw  = cols[I.area]     || "";
    const link     = cols[I.url]      || "";

    if (!liveName || !idolName || !timeStr || !venue || !link) {
      errors.push(`[行${i}] 必須項目不足: ${liveName || "(ライブ名なし)"}`);
      failed++;
      continue;
    }

    // 日時パース（ISO形式 or YYYY-MM-DD HH:MM）
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      errors.push(`[行${i}] 日時パース失敗: ${timeStr} (${liveName})`);
      failed++;
      continue;
    }

    const area = detectArea(areaRaw);

    try {
      await prisma.live.create({
        data: {
          liveName,
          idolName,
          date,
          venue,
          area,
          link,
        },
      });
      success++;
      console.log(`✓ [${i}] [${area}] ${liveName} / ${idolName}`);
    } catch (e) {
      failed++;
      const msg = `[行${i}] DB保存失敗: ${liveName} - ${(e as Error).message}`;
      errors.push(msg);
      console.error(`✗ ${msg}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`完了: 成功 ${success}件 / 失敗 ${failed}件`);
  if (errors.length > 0) {
    console.log(`\n失敗詳細:`);
    errors.forEach((e) => console.log(" ", e));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

/**
 * CSVインポートスクリプト
 * 使い方: npx ts-node --project tsconfig.scripts.json scripts/import-csv.ts path/to/data.csv
 *
 * CSVフォーマット（1行目はヘッダー必須）:
 * liveName,idolName,date,venue,area,link
 *
 * date フォーマット例:
 *   2026-05-01 18:00
 *   2026-05-01T18:00:00
 *   2026/05/01 18:00
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("使い方: npx ts-node scripts/import-csv.ts <csvファイルのパス>");
    process.exit(1);
  }

  const absolutePath = path.resolve(csvPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`ファイルが見つかりません: ${absolutePath}`);
    process.exit(1);
  }

  // CSV読み込み
  const content = fs.readFileSync(absolutePath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  console.log(`ヘッダー: ${headers.join(", ")}`);
  console.log(`データ行数: ${lines.length - 1}`);

  const required = ["liveName", "idolName", "date", "venue", "area", "link"];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    console.error(`必須カラムが不足しています: ${missing.join(", ")}`);
    process.exit(1);
  }

  let success = 0;
  let failed = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || "").trim();
    });

    try {
      const date = new Date(row.date.replace(/\//g, "-"));
      if (isNaN(date.getTime())) throw new Error(`日付が無効: ${row.date}`);

      await prisma.live.create({
        data: {
          liveName: row.liveName,
          idolName: row.idolName,
          date,
          venue: row.venue,
          area: row.area,
          link: row.link,
        },
      });
      success++;
      console.log(`✓ [${i}] ${row.liveName} - ${row.idolName}`);
    } catch (e) {
      failed++;
      console.error(`✗ [${i}] ${row.liveName || "(不明)"}: ${(e as Error).message}`);
    }
  }

  console.log(`\n完了: 成功 ${success}件 / 失敗 ${failed}件`);
}

// クォート対応のCSVパーサー
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

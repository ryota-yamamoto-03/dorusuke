import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { tweetUrl } = await req.json();
  if (!tweetUrl) {
    return NextResponse.json({ error: "ツイートURLを入力してください" }, { status: 400 });
  }

  // TwitterのoEmbed APIでツイート本文を取得（認証不要・無料）
  let tweetText = "";
  let authorName = "";
  let authorUrl = "";
  try {
    const oembedRes = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true`
    );
    if (!oembedRes.ok) {
      return NextResponse.json({ error: "ツイートを取得できませんでした。URLを確認してください" }, { status: 400 });
    }
    const oembed = await oembedRes.json();
    authorName = oembed.author_name ?? "";
    authorUrl = oembed.author_url ?? "";

    // HTML からテキストと URL を抽出
    const html: string = oembed.html ?? "";
    tweetText = html
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, "$2 ($1)")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&mdash;/g, "—")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
  } catch {
    return NextResponse.json({ error: "ツイートの取得に失敗しました" }, { status: 500 });
  }

  // Claude でライブ情報を抽出
  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  const prompt = `以下はXのツイート本文です。アイドルのライブ・イベント情報が含まれている場合、JSON形式で抽出してください。

ツイート本文:
${tweetText}

投稿者: ${authorName} (${authorUrl})

今日の日付: ${today}

抽出するフィールド（不明な場合はnullまたは空文字にしてください）:
- liveName: ライブ・イベント名
- idolName: アイドル・グループ名
- date: 日付（YYYY-MM-DD形式）
- time: 時刻（HH:MM形式、開場・開演どちらか明確な方。不明ならnull）
- venue: 会場名
- area: エリア（東京・横浜・大阪・名古屋・福岡・札幌・その他 のいずれか）
- link: 詳細URL（ツイート内にある場合）
- dateUndecided: 日時が未定かどうか（boolean）

ライブ・イベント情報が含まれていない場合は { "error": "ライブ情報が見つかりませんでした" } を返してください。
JSONのみを返してください。`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "解析に失敗しました" }, { status: 500 });
    }

    const extracted = JSON.parse(jsonMatch[0]);
    if (extracted.error) {
      return NextResponse.json({ error: extracted.error }, { status: 400 });
    }

    return NextResponse.json({
      ...extracted,
      posterName: authorName,
      posterXUrl: authorUrl,
    });
  } catch {
    return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 500 });
  }
}

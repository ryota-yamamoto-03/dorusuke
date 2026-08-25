import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchTweetText(url: string): Promise<{ text: string; authorName: string; authorUrl: string } | null> {
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`
    );
    if (!res.ok) return null;
    const oembed = await res.json();
    const html: string = oembed.html ?? "";
    const text = html
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, "$2 ($1)")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&mdash;/g, "—").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
      .trim();
    return { text, authorName: oembed.author_name ?? "", authorUrl: oembed.author_url ?? "" };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { tweetUrls } = await req.json() as { tweetUrls: string[] };
  if (!tweetUrls?.length) {
    return NextResponse.json({ error: "URLを入力してください" }, { status: 400 });
  }

  // 各ツイートを取得（最大20件）
  const urls = tweetUrls.slice(0, 20);
  const tweets = await Promise.all(urls.map(fetchTweetText));
  const validTweets = tweets.filter(Boolean) as { text: string; authorName: string; authorUrl: string }[];

  if (!validTweets.length) {
    return NextResponse.json({ error: "ツイートを取得できませんでした" }, { status: 400 });
  }

  const authorName = validTweets[0].authorName;
  const authorUrl = validTweets[0].authorUrl;

  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  const tweetList = validTweets.map((t, i) => `【ツイート${i + 1}】\n${t.text}`).join("\n\n");

  const prompt = `以下は複数のXのツイートです。それぞれにライブ・イベント情報が含まれている場合、JSON配列として抽出してください。

今日の日付: ${today}
投稿者: ${authorName} (${authorUrl})

${tweetList}

各ツイートについて、ライブ・イベント情報が含まれる場合のみ以下のフィールドを持つオブジェクトを配列に含めてください:
- liveName: ライブ・イベント名
- idolName: アイドル・グループ名
- date: 日付（YYYY-MM-DD形式、不明ならnull）
- time: 時刻（HH:MM形式、不明ならnull）
- venue: 会場名（不明なら空文字）
- area: エリア（東京・横浜・大阪・名古屋・福岡・札幌・その他 のいずれか）
- link: 詳細URL（ツイート内にある場合、なければ空文字）
- dateUndecided: 日時未定かどうか（boolean）
- isFuture: 今日以降のイベントかどうか（boolean、日付不明の場合はtrue）

ライブ情報がないツイートは無視してください。
JSON配列のみを返してください（コードブロック不要）。`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "ライブ情報が見つかりませんでした" }, { status: 400 });
    }

    const events = JSON.parse(jsonMatch[0]);
    // 未来のイベントのみ返す
    const futureEvents = events.filter((e: { isFuture?: boolean }) => e.isFuture !== false);

    return NextResponse.json({ events: futureEvents, authorName, authorUrl });
  } catch {
    return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 500 });
  }
}

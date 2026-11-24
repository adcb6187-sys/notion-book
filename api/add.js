// 선택한 책을 노션 데이터베이스에 추가하는 함수

// ▼▼▼ 노션 DB의 속성 이름이 다르면 오른쪽 따옴표 안의 이름만 고치세요 ▼▼▼
const PROP = {
  title: "이름",       // 제목(Title) 속성
  author: "지은이",      // 텍스트
  publisher: "출판사", // 텍스트
  isbn: "ISBN",        // 텍스트
  date: "출판 날짜",      // 날짜
  cover: "표지",       // 파일과 미디어
  summary: "소개",     // 텍스트
  link: "링크",        // URL
};
// ▲▲▲ 여기까지 ▲▲▲

const text = (s) => [{ text: { content: String(s || "").slice(0, 1900) } }];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const b = req.body || {};
  const props = {};
  props[PROP.title] = { title: text(b.title) };
  props[PROP.author] = { rich_text: text((b.authors || []).join(", ")) };
  props[PROP.publisher] = { rich_text: text(b.publisher) };
  props[PROP.isbn] = { rich_text: text(b.isbn) };
  props[PROP.summary] = { rich_text: text(b.contents) };
  if (b.datetime) props[PROP.date] = { date: { start: b.datetime.slice(0, 10) } };
  if (b.url) props[PROP.link] = { url: b.url };
  if (b.thumbnail) {
    props[PROP.cover] = {
      files: [{ name: "cover.jpg", type: "external", external: { url: b.thumbnail } }],
    };
  }

  const body = {
    parent: { database_id: process.env.NOTION_DB_ID },
    properties: props,
  };
  if (b.thumbnail) body.cover = { type: "external", external: { url: b.thumbnail } };

  try {
    const r = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.NOTION_TOKEN,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || "노션 API 오류" });
    res.status(200).json({ ok: true, url: data.url });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}

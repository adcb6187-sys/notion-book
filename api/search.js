// 카카오 책 검색을 대신 호출해주는 함수
export default async function handler(req, res) {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "검색어를 입력하세요." });

  try {
    const url = "https://dapi.kakao.com/v3/search/book?size=10&query=" + encodeURIComponent(q);
    const r = await fetch(url, {
      headers: { Authorization: "KakaoAK " + process.env.KAKAO_REST_KEY },
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || "카카오 API 오류" });
    res.status(200).json({ documents: data.documents });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}

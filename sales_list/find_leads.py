#!/usr/bin/env python3
"""
落合・中野周辺の現場系企業（製造・建設・運輸物流など）を Google マップ (Places API) から探し、
ホームページ制作の営業先リストを作るスクリプト。

抽出条件（デフォルト）
  - 評価 ★5.0
  - クチコミ件数 5〜20 件（「10件程度」）
  - ホームページなし / SNS のみ / 古いホームページ（推定10年以上更新なし）
  - メールアドレス、またはファイル添付できる問い合わせフォームが見つかったところ
    （見つからなかった候補は別シート「要手動確認」に出力）

使い方
  export GOOGLE_MAPS_API_KEY=xxxxxxxx   # Places API (New) を有効にしたキー
  python3 sales_list/find_leads.py              # -> sales_list/output/leads_YYYYMMDD.xlsx / .csv
  python3 sales_list/find_leads.py --min-reviews 3 --max-reviews 30   # 条件を緩める
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# 検索設定
# ---------------------------------------------------------------------------
AREAS = {
    # 名前: (緯度, 経度, 半径m)
    "落合周辺": (35.7140, 139.6850, 1500),  # 落合駅・中井駅・下落合・中落合・西落合・上落合
    "中野周辺": (35.7056, 139.6657, 1800),  # 中野駅・中野坂上・東中野・新井
}

KEYWORDS = [
    # 製造業
    "製作所", "工場", "金属加工", "板金", "鉄工所", "溶接", "プレス加工", "切削加工",
    "印刷会社", "製本", "看板製作", "家具製作", "木工所", "食品製造",
    # 建設業
    "工務店", "建設会社", "リフォーム会社", "内装工事", "解体工事", "電気工事",
    "設備工事", "水道工事", "空調工事", "塗装工事", "防水工事", "左官", "大工",
    "とび 足場", "外構工事", "造園", "屋根工事", "サッシ ガラス工事", "建具",
    # 運輸・物流
    "運送会社", "軽貨物", "物流", "倉庫", "引越し業者", "赤帽",
    # その他現場系
    "自動車整備", "鈑金塗装", "ビルメンテナンス", "清掃会社", "廃品回収 産業廃棄物",
]

SNS_DOMAINS = (
    "instagram.com", "facebook.com", "twitter.com", "x.com", "tiktok.com",
    "line.me", "lin.ee", "youtube.com", "ameblo.jp", "note.com",
)
DIRECTORY_DOMAINS = (
    "ekiten.jp", "itp.ne.jp", "homes.co.jp", "suumo.jp", "zehitomo.com",
    "kurashinomarket.jp", "meetsmore.com", "goope.jp", "jimdofree.com", "wixsite.com",
)

FIELD_MASK = ",".join([
    "places.id", "places.displayName", "places.formattedAddress", "places.rating",
    "places.userRatingCount", "places.websiteUri", "places.nationalPhoneNumber",
    "places.googleMapsUri", "places.primaryTypeDisplayName", "places.businessStatus",
    "nextPageToken",
])

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+(?:@|＠|\s?\[at\]\s?|\s?\(at\)\s?)[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
EMAIL_BAD_SUFFIX = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".css", ".js")
EMAIL_BAD_DOMAINS = ("example.com", "sentry.io", "wixpress.com", "domain.com", "xxx.co.jp")
YEAR_RE = re.compile(r"(?:©|&copy;|copyright|\(c\))\s*(?:\d{4}\s*[-–〜~]\s*)?((?:19|20)\d{2})", re.I)
ANY_YEAR_RE = re.compile(r"((?:19|20)\d{2})[年./\-]\s?\d{1,2}[月./\-]")
CONTACT_HINTS = ("contact", "inquiry", "toiawase", "otoiawase", "mail", "form",
                 "お問い合わせ", "お問合せ", "問い合わせ", "問合せ", "会社概要", "company", "about")


@dataclass
class Lead:
    area: str
    keyword: str
    name: str
    address: str
    phone: str
    rating: float
    reviews: int
    category: str
    maps_url: str
    website: str = ""
    site_status: str = ""          # HPなし / SNSのみ / 古いHP(推定) / 新しいHP
    site_evidence: str = ""
    emails: list[str] = field(default_factory=list)
    contact_form: str = ""         # URL
    form_file_upload: bool = False
    contact_method: str = ""       # メール / フォーム(添付可) / フォーム / 要手動確認
    place_id: str = ""


# ---------------------------------------------------------------------------
# Places API
# ---------------------------------------------------------------------------
def search_places(api_key: str, query: str, lat: float, lng: float, radius: int):
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }
    body = {
        "textQuery": query,
        "languageCode": "ja",
        "regionCode": "JP",
        "pageSize": 20,
        "locationBias": {"circle": {"center": {"latitude": lat, "longitude": lng},
                                    "radius": float(radius)}},
    }
    for _ in range(3):  # 最大60件
        r = requests.post(url, headers=headers, data=json.dumps(body), timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"Places API error {r.status_code}: {r.text[:300]}")
        data = r.json()
        yield from data.get("places", [])
        token = data.get("nextPageToken")
        if not token:
            break
        body["pageToken"] = token
        time.sleep(1.5)


def in_radius(lat1, lng1, lat2, lng2, radius_m) -> bool:
    import math
    dy = (lat2 - lat1) * 111_000
    dx = (lng2 - lng1) * 111_000 * math.cos(math.radians(lat1))
    return (dx * dx + dy * dy) ** 0.5 <= radius_m


# ---------------------------------------------------------------------------
# Web サイト解析
# ---------------------------------------------------------------------------
def fetch(url: str, session: requests.Session):
    try:
        r = session.get(url, timeout=15, allow_redirects=True)
        if r.status_code >= 400:
            return None, None
        r.encoding = r.apparent_encoding or r.encoding
        return r, r.text
    except requests.RequestException:
        return None, None


def clean_emails(text: str) -> list[str]:
    out = []
    for m in EMAIL_RE.findall(text):
        e = re.sub(r"\s?(\[at\]|\(at\))\s?", "@", m).replace("＠", "@").strip(".").lower()
        if e.endswith(EMAIL_BAD_SUFFIX) or any(d in e for d in EMAIL_BAD_DOMAINS):
            continue
        if e not in out:
            out.append(e)
    return out


def analyze_site(lead: Lead, session: requests.Session, old_years: int, today: dt.date):
    url = lead.website
    if not url:
        lead.site_status = "HPなし"
        return
    host = urlparse(url).netloc.lower()
    if any(d in host for d in SNS_DOMAINS):
        lead.site_status = "SNSのみ"
        lead.site_evidence = host
        return
    if any(d in host for d in DIRECTORY_DOMAINS):
        lead.site_status = "ポータル/無料ページのみ"
        lead.site_evidence = host

    resp, html = fetch(url, session)
    if html is None:
        lead.site_status = "HPリンク切れ"
        lead.site_evidence = "トップページ取得不可"
        return

    soup = BeautifulSoup(html, "html.parser")
    low = html.lower()
    evidence = []
    years = [int(y) for y in YEAR_RE.findall(html)]
    news_years = [int(y) for y in ANY_YEAR_RE.findall(soup.get_text(" "))]
    latest = max(years + news_years) if (years or news_years) else None
    lm = resp.headers.get("Last-Modified", "")
    lm_year = None
    if lm:
        try:
            lm_year = dt.datetime.strptime(lm, "%a, %d %b %Y %H:%M:%S %Z").year
        except ValueError:
            pass

    no_viewport = soup.find("meta", attrs={"name": re.compile("viewport", re.I)}) is None
    not_https = not resp.url.startswith("https://")
    legacy_markup = any(t in low for t in ("<frameset", ".swf", "<font ", "<marquee",
                                            "shockwave-flash", "<center>"))
    table_layout = len(soup.find_all("table")) >= 5 and len(soup.find_all("div")) < 10

    if latest: evidence.append(f"最新年表記 {latest}")
    if lm_year: evidence.append(f"Last-Modified {lm_year}")
    if no_viewport: evidence.append("スマホ非対応(viewportなし)")
    if not_https: evidence.append("httpのみ")
    if legacy_markup: evidence.append("古いタグ(Flash/frame/font等)")
    if table_layout: evidence.append("テーブルレイアウト")

    threshold = today.year - old_years
    # Last-Modified は動的サーバだと常に「今日」になるため、年表記が無い場合のみ使う
    newest = latest or lm_year or 0
    is_old = (newest and newest <= threshold) or \
             (no_viewport and (not_https or legacy_markup or table_layout)) or \
             (no_viewport and newest and newest <= threshold + 3)
    if not lead.site_status:
        lead.site_status = "古いHP(推定)" if is_old else "新しいHP"
    lead.site_evidence = " / ".join(filter(None, [lead.site_evidence] + evidence))

    # 連絡先の収集
    pages = [(resp.url, soup, html)]
    links = []
    for a in soup.find_all("a", href=True):
        href, text = a["href"], a.get_text(" ", strip=True)
        if href.startswith("mailto:"):
            lead.emails += [e for e in clean_emails(href[7:].split("?")[0]) if e not in lead.emails]
            continue
        full = urljoin(resp.url, href)
        if urlparse(full).netloc != urlparse(resp.url).netloc:
            continue
        if any(h in (href + text).lower() for h in CONTACT_HINTS) and full not in links:
            links.append(full)
    for link in links[:5]:
        r2, h2 = fetch(link, session)
        if h2:
            pages.append((r2.url, BeautifulSoup(h2, "html.parser"), h2))
        time.sleep(0.5)

    for page_url, s, h in pages:
        for e in clean_emails(h):
            if e not in lead.emails:
                lead.emails.append(e)
        for form in s.find_all("form"):
            fields = form.find_all(["input", "textarea"])
            if len(fields) >= 3 and form.find("textarea"):
                if not lead.contact_form:
                    lead.contact_form = page_url
                if form.find("input", attrs={"type": "file"}):
                    lead.form_file_upload = True
                    lead.contact_form = page_url


def decide_contact(lead: Lead):
    if lead.emails:
        lead.contact_method = "メール"
    elif lead.contact_form and lead.form_file_upload:
        lead.contact_method = "フォーム(添付可)"
    elif lead.contact_form:
        lead.contact_method = "フォーム(添付不可・URL送付で対応)"
    else:
        lead.contact_method = "要手動確認"


# ---------------------------------------------------------------------------
# 出力
# ---------------------------------------------------------------------------
COLUMNS = [
    ("area", "エリア"), ("name", "会社名"), ("category", "業種(Google)"), ("keyword", "検索語"),
    ("rating", "評価"), ("reviews", "クチコミ数"), ("site_status", "HP状況"),
    ("site_evidence", "HP判定根拠"), ("website", "HP URL"), ("contact_method", "連絡手段"),
    ("emails", "メール"), ("contact_form", "問い合わせフォーム"), ("phone", "電話"),
    ("address", "住所"), ("maps_url", "Googleマップ"),
]


def row(lead: Lead):
    d = asdict(lead)
    d["emails"] = ", ".join(lead.emails)
    return [d[k] for k, _ in COLUMNS]


def write_outputs(main: list[Lead], manual: list[Lead], out_dir: Path, stamp: str):
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = out_dir / f"leads_{stamp}.csv"
    with csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow([h for _, h in COLUMNS])
        for l in main:
            w.writerow(row(l))
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill
        wb = Workbook()
        for title, items in (("営業リスト(メール・フォーム可)", main), ("要手動確認", manual)):
            ws = wb.active if title.startswith("営業") else wb.create_sheet()
            ws.title = title
            ws.append([h for _, h in COLUMNS])
            for c in ws[1]:
                c.font = Font(bold=True, color="FFFFFF")
                c.fill = PatternFill("solid", fgColor="305496")
            for l in items:
                ws.append(row(l))
            ws.freeze_panes = "B2"
            ws.auto_filter.ref = ws.dimensions
            for col, width in zip("ABCDEFGHIJKLMNO", (10, 28, 16, 12, 6, 9, 14, 40, 35, 18, 30, 35, 14, 40, 40)):
                ws.column_dimensions[col].width = width
        xlsx_path = out_dir / f"leads_{stamp}.xlsx"
        wb.save(xlsx_path)
    except ImportError:
        xlsx_path = None
    return csv_path, xlsx_path


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--api-key", default=os.environ.get("GOOGLE_MAPS_API_KEY"))
    ap.add_argument("--min-rating", type=float, default=5.0)
    ap.add_argument("--min-reviews", type=int, default=5)
    ap.add_argument("--max-reviews", type=int, default=20)
    ap.add_argument("--old-years", type=int, default=10, help="何年以上前のHPを『古い』とみなすか")
    ap.add_argument("--include-modern-sites", action="store_true", help="新しいHPを持つ会社も残す")
    ap.add_argument("--out", default=str(Path(__file__).parent / "output"))
    args = ap.parse_args()
    if not args.api_key:
        sys.exit("GOOGLE_MAPS_API_KEY が未設定です（Places API (New) を有効化したキーが必要）")

    today = dt.date.today()
    session = requests.Session()
    session.headers["User-Agent"] = UA

    seen: dict[str, Lead] = {}
    n_req = 0
    for area, (lat, lng, radius) in AREAS.items():
        for kw in KEYWORDS:
            q = f"{kw} {area.replace('周辺', '')}"
            try:
                for p in search_places(args.api_key, q, lat, lng, radius):
                    pid = p.get("id")
                    if not pid or pid in seen or p.get("businessStatus", "OPERATIONAL") != "OPERATIONAL":
                        continue
                    rating, cnt = p.get("rating", 0) or 0, p.get("userRatingCount", 0) or 0
                    if rating < args.min_rating - 0.001 or not (args.min_reviews <= cnt <= args.max_reviews):
                        continue
                    addr = p.get("formattedAddress", "")
                    if not any(k in addr for k in ("中野区", "新宿区", "豊島区", "練馬区", "杉並区")):
                        continue
                    seen[pid] = Lead(
                        area=area, keyword=kw, name=p.get("displayName", {}).get("text", ""),
                        address=addr, phone=p.get("nationalPhoneNumber", ""), rating=rating,
                        reviews=cnt, category=(p.get("primaryTypeDisplayName") or {}).get("text", ""),
                        maps_url=p.get("googleMapsUri", ""), website=p.get("websiteUri", ""), place_id=pid)
            except RuntimeError as e:
                print(f"[WARN] {q}: {e}", file=sys.stderr)
            n_req += 1
            print(f"  検索 {n_req:3d}: {q:<24} 候補累計 {len(seen)}", file=sys.stderr)

    print(f"評価・件数条件を満たす候補: {len(seen)} 件。HP を調査中…", file=sys.stderr)
    main_list, manual = [], []
    for lead in seen.values():
        analyze_site(lead, session, args.old_years, today)
        if lead.site_status == "新しいHP" and not args.include_modern_sites:
            continue
        decide_contact(lead)
        (manual if lead.contact_method == "要手動確認" else main_list).append(lead)

    order = {"メール": 0, "フォーム(添付可)": 1}
    main_list.sort(key=lambda l: (order.get(l.contact_method, 2), l.area, -l.reviews))
    stamp = today.strftime("%Y%m%d")
    csv_path, xlsx_path = write_outputs(main_list, manual, Path(args.out), stamp)
    print(f"\n営業リスト: {len(main_list)} 件 / 要手動確認(HPなし等で連絡先不明): {len(manual)} 件")
    print(f"CSV : {csv_path}")
    if xlsx_path:
        print(f"Excel: {xlsx_path}")


if __name__ == "__main__":
    main()

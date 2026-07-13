#!/usr/bin/env python3
"""Compile the bilingual GIR methodology Markdown into browser-ready chapter JSON.

The runtime serves prebuilt JSON and does not depend on Markdown libraries.  This
script is retained so the documentation can be regenerated when the source
methodology changes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
    from markdown_it import MarkdownIt
except ImportError as exc:  # pragma: no cover - developer guidance
    raise SystemExit(
        "Regeneration requires markdown-it-py and beautifulsoup4. "
        "The committed JSON files remain runtime-ready without these packages."
    ) from exc

ROOT = Path(__file__).resolve().parents[1]
STATIC_ROOT = ROOT / "giip" / "static" / "methodology"
CONTENT_ROOT = STATIC_ROOT / "content"
MANIFEST_PATH = STATIC_ROOT / "manifest.json"

CYRILLIC = str.maketrans(
    {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
        "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
        "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
        "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }
)

ROLE_RULES: dict[str, list[tuple[str, ...]]] = {
    "document": [("статус документа",), ("document purpose",), ("document passport",), ("reading guide",)],
    "summary": [("резюме проекта",), ("executive summary",)],
    "scope": [("цели, задачи",), ("project scope",)],
    "framework": [("методологическая рамка",), ("typology of analytical products",)],
    "pipeline": [("архитектура и жизненный цикл",), ("etl, provenance",)],
    "data": [("состав и объём данных",), ("information base",)],
    "sources": [("источники, происхождение",), ("governance, authorship",)],
    "database": [("структура базы данных",), ("logical layers",)],
    "algorithms": [("общие алгоритмы",), ("common computational rules",)],
    "passports": [("паспорта индексных",), ("index passports",)],
    "htei": [("авторский индекс htei",), ("htei v6",)],
    "training": [("модель конкурентоспособности",), ("training-system competitiveness",)],
    "evidence": [("национальная и корпоративная",), ("additional evidence layers",)],
    "api": [("api и экспорт",), ("api and integration",)],
    "technology": [("техническая архитектура",)],
    "quality": [("контроль качества",), ("quality assurance",)],
    "limitations": [("ограничения",), ("main limitations",)],
    "audit": [("выявленные несогласованности",), ("implementation discrepancy",)],
    "editorial": [("проект новой страницы",), ("recommended architecture of the website",)],
    "conclusion": [("заключение",), ("conclusion",)],
    "appendix": [("приложение",), ("appendix",)],
}

GROUP_META = {
    "start": {"ru": "Начало", "en": "Start here"},
    "research": {"ru": "Исследовательская методика", "en": "Research method"},
    "models": {"ru": "Индексы и авторские модели", "en": "Indices and models"},
    "infrastructure": {"ru": "Данные и инфраструктура", "en": "Data and infrastructure"},
    "assurance": {"ru": "Проверка и ограничения", "en": "Assurance and limitations"},
    "reference": {"ru": "Технические приложения", "en": "Technical appendices"},
}

ROLE_GROUP = {
    "document": "start", "summary": "start", "scope": "start",
    "framework": "research", "pipeline": "research", "algorithms": "research",
    "passports": "models", "htei": "models", "training": "models",
    "data": "infrastructure", "sources": "infrastructure", "database": "infrastructure",
    "evidence": "infrastructure", "api": "infrastructure", "technology": "infrastructure",
    "quality": "assurance", "limitations": "assurance", "audit": "assurance",
    "conclusion": "assurance", "editorial": "reference", "appendix": "reference",
}

QUICK_ROUTES = {
    "ru": [
        {"key": "orientation", "title": "Понять проект за 10 минут", "description": "Резюме, типология показателей и сквозной конвейер данных.", "roles": ["summary", "framework", "pipeline"], "minutes": "8–12"},
        {"key": "scientific", "title": "Провести научную экспертизу", "description": "Алгоритмы, паспорта индексов, HTEI и модель подготовки кадров.", "roles": ["algorithms", "passports", "htei", "training"], "minutes": "35–55"},
        {"key": "evidence", "title": "Проверить доказательную базу", "description": "Источники, база данных, provenance, API и правила воспроизводимости.", "roles": ["sources", "database", "api", "quality"], "minutes": "30–50"},
        {"key": "limits", "title": "Разобрать ограничения", "description": "Границы интерпретации, несопоставимость выпусков, прокси и ложная точность рангов.", "roles": ["limitations", "audit"], "minutes": "15–25"},
    ],
    "en": [
        {"key": "orientation", "title": "Understand GIR in 10 minutes", "description": "Executive summary, analytical typology and end-to-end data pipeline.", "roles": ["summary", "framework", "pipeline"], "minutes": "8–12"},
        {"key": "scientific", "title": "Review the scientific method", "description": "Common rules, index passports, HTEI and the training-system model.", "roles": ["algorithms", "passports", "htei", "training"], "minutes": "25–40"},
        {"key": "evidence", "title": "Audit the evidence chain", "description": "Source archive, provenance, API, licensing and release controls.", "roles": ["data", "pipeline", "api", "quality"], "minutes": "20–35"},
        {"key": "limits", "title": "Read the interpretation limits", "description": "Comparability, lags, proxies, uncertainty and governance boundaries.", "roles": ["limitations", "audit"], "minutes": "10–20"},
    ],
}


@dataclass
class Heading:
    line: int
    level: int
    title: str


def clean_title(value: str) -> str:
    value = re.sub(r"[*_`]+", "", value)
    value = re.sub(r"\s+#+\s*$", "", value)
    return re.sub(r"\s+", " ", value).strip()


def slugify(value: str) -> str:
    title = clean_title(value).lower()
    number = re.match(r"^(?:§\s*)?(\d+(?:\.\d+)*)[.\s]", title)
    if number:
        return "section-" + number.group(1).replace(".", "-")
    appendix = re.match(r"^(?:приложение|appendix)\s+([a-zа-я0-9]+)", title)
    if appendix:
        return "appendix-" + appendix.group(1).translate(CYRILLIC)
    normalized = unicodedata.normalize("NFKD", title.translate(CYRILLIC))
    ascii_value = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value).strip("-")
    return slug[:96] or "section"


def unique_slug(base: str, used: set[str]) -> str:
    candidate = base
    counter = 2
    while candidate in used:
        candidate = f"{base}-{counter}"
        counter += 1
    used.add(candidate)
    return candidate


def role_for(title: str) -> str:
    low = title.lower()
    for role, rules in ROLE_RULES.items():
        for required in rules:
            if all(token in low for token in required):
                return role
    return "appendix" if low.startswith(("приложение", "appendix")) else "research"


def semantic_key(title: str, role: str) -> str:
    number = re.match(r"^(\d+)(?:\.|\s)", clean_title(title))
    if number:
        return f"chapter-{number.group(1)}"
    appendix = re.match(r"^(?:Приложение|Appendix)\s+([A-ZА-Я0-9]+)", clean_title(title), re.I)
    if appendix:
        return f"appendix-{appendix.group(1).lower().translate(CYRILLIC)}"
    aliases = {
        "document": "document-status", "summary": "summary", "scope": "scope",
        "framework": "framework", "pipeline": "pipeline", "data": "data",
        "sources": "sources", "database": "database", "algorithms": "algorithms",
        "passports": "passports", "htei": "htei", "training": "training",
        "evidence": "evidence", "api": "api", "technology": "technology",
        "quality": "quality", "limitations": "limitations", "audit": "audit",
        "editorial": "editorial", "conclusion": "conclusion", "appendix": slugify(title),
    }
    return aliases.get(role, slugify(title))


def parse_headings(lines: list[str]) -> list[Heading]:
    headings: list[Heading] = []
    for index, line in enumerate(lines):
        match = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if match:
            headings.append(Heading(index, len(match.group(1)), clean_title(match.group(2))))
    return headings


def major_headings(lines: list[str], lang: str) -> list[Heading]:
    headings = parse_headings(lines)
    if not headings:
        raise ValueError("No headings found")
    document_title = headings[0]
    if lang == "ru":
        majors: list[Heading] = []
        in_appendices = False
        for heading in headings[1:]:
            low = heading.title.lower()
            if heading.level == 1 and low == "содержание":
                continue
            if heading.level == 1 and low == "приложения":
                in_appendices = True
                continue
            if not in_appendices and heading.level == 1:
                majors.append(heading)
            elif in_appendices and heading.level == 2 and low.startswith("приложение"):
                majors.append(heading)
        return [document_title, *majors]
    return [document_title, *[heading for heading in headings[1:] if heading.level == 2]]


def normalize_heading_levels(markdown: str, major_level: int) -> str:
    output: list[str] = []
    shift = 2 - major_level
    for line in markdown.splitlines():
        match = re.match(r"^(#{1,6})(\s+.+)$", line)
        if match:
            level = max(2, min(6, len(match.group(1)) + shift))
            output.append("#" * level + match.group(2))
        else:
            output.append(line)
    return "\n".join(output)


def build_renderer() -> MarkdownIt:
    renderer = MarkdownIt(
        "commonmark",
        {"html": False, "linkify": True, "typographer": True, "breaks": False},
    )
    renderer.enable("table")
    return renderer


def transform_html(html: str, lang: str, used_ids: set[str]) -> tuple[str, list[dict[str, Any]], list[str]]:
    soup = BeautifulSoup(html, "html.parser")
    headings: list[dict[str, Any]] = []
    figures: list[str] = []

    for heading in soup.find_all(re.compile(r"^h[2-6]$")):
        title = heading.get_text(" ", strip=True)
        anchor = unique_slug(slugify(title), used_ids)
        heading["id"] = anchor
        heading["tabindex"] = "-1"
        headings.append({"id": anchor, "title": title, "level": int(heading.name[1])})
        permalink = soup.new_tag("a", href=f"?section={anchor}#methodology")
        permalink["class"] = "method-heading-link"
        permalink["aria-label"] = ("Ссылка на раздел" if lang == "ru" else "Link to section") + f": {title}"
        permalink.string = "#"
        heading.append(permalink)

    for table in list(soup.find_all("table")):
        wrapper = soup.new_tag("div")
        wrapper["class"] = "method-table-scroll"
        table.wrap(wrapper)
        table["class"] = "method-table"
        if table.find("thead"):
            table["data-has-header"] = "true"

    for blockquote in soup.find_all("blockquote"):
        text = blockquote.get_text(" ", strip=True).lower()
        klass = "method-callout"
        if any(token in text for token in ("главное", "ключевой", "main rule", "key methodological")):
            klass += " method-callout-key"
        elif any(token in text for token in ("огранич", "warning", "не следует", "do not")):
            klass += " method-callout-warning"
        blockquote["class"] = klass

    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        if href.startswith(("http://", "https://")):
            link["target"] = "_blank"
            link["rel"] = "noopener noreferrer"
        elif href.startswith("#"):
            link["data-method-anchor"] = href[1:]

    for img in list(soup.find_all("img")):
        src = img.get("src", "")
        filename = Path(src).name
        if not re.fullmatch(r"\d{2}_[a-z0-9_]+\.png", filename):
            continue
        figures.append(filename)
        alt = img.get("alt", "")
        figure = soup.new_tag("figure")
        figure["class"] = "method-figure"
        button = soup.new_tag("button", type="button")
        button["class"] = "method-figure-open"
        button["data-method-figure"] = filename
        button["aria-label"] = ("Увеличить схему" if lang == "ru" else "Enlarge figure") + (f": {alt}" if alt else "")
        new_img = soup.new_tag("img")
        new_img["src"] = f"/static/methodology/figures/{lang}-light/{filename}"
        new_img["data-method-figure-image"] = filename
        new_img["alt"] = alt
        new_img["loading"] = "lazy"
        new_img["decoding"] = "async"
        new_img["width"] = "1672"
        new_img["height"] = "941"
        button.append(new_img)
        figure.append(button)
        caption = soup.new_tag("figcaption")
        caption.string = alt
        figure.append(caption)
        parent = img.parent
        if parent and parent.name == "p" and len(parent.find_all(recursive=False)) == 1:
            parent.replace_with(figure)
        else:
            img.replace_with(figure)

    for figure in soup.find_all("figure", class_="method-figure"):
        sibling = figure.find_next_sibling()
        if sibling and sibling.name == "p":
            text = sibling.get_text(" ", strip=True)
            if re.match(r"^(Рисунок|Figure)\s+\d+", text, re.I):
                sibling.decompose()

    for pre in soup.find_all("pre"):
        pre["class"] = "method-code-block"
    for code in soup.find_all("code"):
        if code.parent and code.parent.name != "pre":
            code["class"] = "method-inline-code"

    for paragraph in soup.find_all("p"):
        if paragraph.find("img") or paragraph.find("figure"):
            continue
        paragraph["class"] = "method-paragraph"

    return str(soup), headings, sorted(set(figures))


def first_paragraph(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for paragraph in soup.find_all("p"):
        text = paragraph.get_text(" ", strip=True)
        if len(text) >= 40:
            return text[:300] + ("…" if len(text) > 300 else "")
    return ""


def word_count(text: str) -> int:
    return len(re.findall(r"[\wА-Яа-яЁё]+", text, re.UNICODE))


def reading_minutes(words: int, lang: str) -> int:
    speed = 180 if lang == "ru" else 220
    return max(1, round(words / speed))


def build_search_entries(chapter: dict[str, Any], html: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    entries: list[dict[str, Any]] = []
    current_heading = chapter["title"]
    current_anchor = chapter["id"]
    buffer: list[str] = []

    def flush() -> None:
        nonlocal buffer
        text = " ".join(buffer).strip()
        if text:
            entries.append(
                {
                    "chapter_key": chapter["key"],
                    "chapter_id": chapter["id"],
                    "anchor": current_anchor,
                    "title": current_heading,
                    "text": text[:950],
                }
            )
        buffer = []

    for node in soup.find_all(["h2", "h3", "h4", "h5", "p", "li", "td", "th"]):
        if node.name.startswith("h"):
            flush()
            current_heading = node.get_text(" ", strip=True).rstrip("#").strip()
            current_anchor = node.get("id", chapter["id"])
        else:
            text = node.get_text(" ", strip=True)
            if text:
                buffer.append(text)
    flush()
    return entries


def compile_language(lang: str, source: Path, figure_manifest: dict[str, Any]) -> dict[str, Any]:
    raw = source.read_text(encoding="utf-8")
    lines = raw.splitlines()
    majors = major_headings(lines, lang)
    title_heading = majors[0]
    boundaries = majors[1:]
    renderer = build_renderer()
    chapters: list[dict[str, Any]] = []
    search: list[dict[str, Any]] = []
    used_ids: set[str] = set()
    used_keys: set[str] = set()

    for index, heading in enumerate(boundaries):
        next_line = boundaries[index + 1].line if index + 1 < len(boundaries) else len(lines)
        segment = "\n".join(lines[heading.line:next_line]).strip()
        if not segment:
            continue
        normalized = normalize_heading_levels(segment, heading.level)
        rendered = renderer.render(normalized)
        transformed, child_headings, figures = transform_html(rendered, lang, used_ids)
        role = role_for(heading.title)
        key = unique_slug(semantic_key(heading.title, role), used_keys)
        chapter_id = child_headings[0]["id"] if child_headings else unique_slug(slugify(heading.title), used_ids)
        plain_text = BeautifulSoup(transformed, "html.parser").get_text(" ", strip=True)
        words = word_count(plain_text)
        operational_snapshot = bool(re.search(
            r"customer_final_release|final_release_candidate|release_ready|playwright|release[ -]?gate|"
            r"релизн(?:ый|ого|ом) статус|готовност[ьи] к релизу",
            plain_text,
            flags=re.IGNORECASE,
        ))
        chapter = {
            "id": chapter_id,
            "key": key,
            "title": heading.title,
            "role": role,
            "group": ROLE_GROUP.get(role, "research"),
            "summary": first_paragraph(transformed),
            "reading_minutes": reading_minutes(words, lang),
            "word_count": words,
            "technical": role in {"audit", "editorial", "technology", "appendix"},
            "operational_snapshot": operational_snapshot,
            "headings": child_headings,
            "figures": figures,
            "html": transformed,
        }
        chapters.append(chapter)
        search.extend(build_search_entries(chapter, transformed))

    roles: dict[str, str] = {}
    for chapter in chapters:
        roles.setdefault(chapter["role"], chapter["key"])
    routes = []
    for route in QUICK_ROUTES[lang]:
        chapter_keys = [roles[role] for role in route["roles"] if role in roles]
        routes.append({**route, "chapter_keys": chapter_keys})

    figures = []
    for item in figure_manifest.get("figure_index", []):
        figures.append(
            {
                "order": item["order"],
                "file": item["file"],
                "title": item[f"title_{lang}"],
                "paths": {theme: f"/static/methodology/{item['paths'][f'{lang}-{theme}']}" for theme in ("light", "dark")},
            }
        )

    total_words = sum(chapter["word_count"] for chapter in chapters)
    groups = [
        {
            "id": group_id,
            "label": labels[lang],
            "chapter_keys": [chapter["key"] for chapter in chapters if chapter["group"] == group_id],
        }
        for group_id, labels in GROUP_META.items()
    ]
    default_key = roles.get("summary") or roles.get("document") or chapters[0]["key"]
    source_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return {
        "schema_version": "gir-methodology-wiki-v1",
        "lang": lang,
        "title": clean_title(title_heading.title),
        "subtitle": "Полное описание данных, индексов, расчётов и процедур проверки" if lang == "ru" else "Data, indices, calculations and verification procedures",
        "edition": "12 июля 2026" if lang == "ru" else "12 July 2026",
        "source_markdown": f"/static/methodology/content/methodology.{lang}.md",
        "source_sha256": source_hash,
        "docx_download": "/static/methodology/downloads/GIR_methodology_full_ru_2026.docx" if lang == "ru" else None,
        "word_count": total_words,
        "reading_minutes": reading_minutes(total_words, lang),
        "chapter_count": len(chapters),
        "default_chapter_key": default_key,
        "roles": roles,
        "groups": groups,
        "quick_routes": routes,
        "figures": figures,
        "chapters": chapters,
        "search": search,
    }


def validate_payload(payload: dict[str, Any]) -> None:
    assert payload["schema_version"] == "gir-methodology-wiki-v1"
    assert payload["chapter_count"] == len(payload["chapters"])
    assert payload["chapter_count"] >= 12
    assert len(payload["figures"]) == 9
    keys = [chapter["key"] for chapter in payload["chapters"]]
    assert len(keys) == len(set(keys)), "Chapter keys must be unique"
    ids = [chapter["id"] for chapter in payload["chapters"]]
    assert len(ids) == len(set(ids)), "Chapter IDs must be unique"
    for required_role in ("summary", "framework", "passports", "htei", "training", "quality", "limitations"):
        assert required_role in payload["roles"], f"Missing role: {required_role}"
    for chapter in payload["chapters"]:
        assert "<script" not in chapter["html"].lower()
        assert chapter["reading_minutes"] >= 1


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Validate without rewriting files")
    args = parser.parse_args()
    figure_manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    for lang in ("ru", "en"):
        source = CONTENT_ROOT / f"methodology.{lang}.md"
        payload = compile_language(lang, source, figure_manifest)
        validate_payload(payload)
        destination = CONTENT_ROOT / f"methodology.{lang}.json"
        serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        if args.check:
            existing = json.loads(destination.read_text(encoding="utf-8"))
            validate_payload(existing)
            if existing["source_sha256"] != payload["source_sha256"]:
                raise SystemExit(f"{destination} is stale")
        else:
            destination.write_text(serialized, encoding="utf-8")
        print(
            json.dumps(
                {
                    "lang": lang,
                    "chapters": payload["chapter_count"],
                    "words": payload["word_count"],
                    "minutes": payload["reading_minutes"],
                    "search_entries": len(payload["search"]),
                    "bytes": len(serialized.encode("utf-8")),
                },
                ensure_ascii=False,
            )
        )


if __name__ == "__main__":
    main()

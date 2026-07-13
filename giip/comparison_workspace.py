from __future__ import annotations

import csv
import io
import math
import statistics
from collections import defaultdict
from typing import Any, Iterable

from .db import row, rows

INDEX_ORDER = ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"]
MIN_CORRELATION_N = 15
MAX_SELECTED = 8
DEFAULT_SELECTED = ["RUS", "CHN", "USA", "DEU", "KOR", "IND"]

GROUPS: dict[str, dict[str, Any]] = {
    "ALL": {
        "label_ru": "Все страны", "label_en": "All countries",
        "description_ru": "Все страны, представленные хотя бы в одном текущем индексном модуле.",
        "description_en": "All countries represented in at least one current index module.",
        "iso3": None,
    },
    "RUSSIA_CORE": {
        "label_ru": "Технологические сопоставления России", "label_en": "Russia technology peers",
        "description_ru": "Россия и крупные технологические системы с различными моделями кадрового и инновационного развития.",
        "description_en": "Russia and major technology systems with different workforce and innovation models.",
        "iso3": {"RUS", "CHN", "IND", "DEU", "KOR", "SGP", "USA"},
    },
    "TECH_BENCHMARKS": {
        "label_ru": "Технологические лидеры", "label_en": "Technology benchmarks",
        "description_ru": "Международные ориентиры технологического, кадрового и инновационного развития.",
        "description_en": "International benchmarks for technology, workforce and innovation development.",
        "iso3": {"USA", "CHN", "DEU", "KOR", "SGP", "JPN", "FIN", "SWE", "GBR"},
    },
    "BRICS": {
        "label_ru": "БРИКС", "label_en": "BRICS",
        "description_ru": "Базовая пятёрка БРИКС.", "description_en": "The original five BRICS economies.",
        "iso3": {"BRA", "RUS", "IND", "CHN", "ZAF"},
    },
    "G20": {
        "label_ru": "G20", "label_en": "G20",
        "description_ru": "Крупнейшие развитые и развивающиеся экономики мира.",
        "description_en": "The world's major advanced and emerging economies.",
        "iso3": {"ARG", "AUS", "BRA", "CAN", "CHN", "FRA", "DEU", "IND", "IDN", "ITA", "JPN", "KOR", "MEX", "RUS", "SAU", "ZAF", "TUR", "GBR", "USA"},
    },
    "OECD": {
        "label_ru": "ОЭСР", "label_en": "OECD",
        "description_ru": "Страны ОЭСР, представленные в базе платформы.",
        "description_en": "OECD members represented in the platform database.",
        "iso3": {"AUS", "AUT", "BEL", "CAN", "CHL", "COL", "CRI", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ISR", "ITA", "JPN", "KOR", "LVA", "LTU", "LUX", "MEX", "NLD", "NZL", "NOR", "POL", "PRT", "SVK", "SVN", "ESP", "SWE", "CHE", "TUR", "GBR", "USA"},
    },
    "TOP10_HTEI": {
        "label_ru": "Топ-10 HTEI", "label_en": "HTEI top 10",
        "description_ru": "Десять лидеров текущего сопоставимого режима HTEI.",
        "description_en": "The ten leaders in the current comparable HTEI mode.",
        "iso3": "dynamic",
    },
}


def _exists(conn, table: str) -> bool:
    return bool(row(conn, "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=?", (table,)))


def _metadata(conn) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for table in ("index_definitions", "indices"):
        if _exists(conn, table):
            for item in rows(conn, f"SELECT * FROM {table}"):
                merged[item["code"]] = item
    return [merged[code] for code in INDEX_ORDER if code in merged]


def _percentile(rank: int | None, universe: int | None, stored: float | None) -> float | None:
    if stored is not None:
        return max(0.0, min(100.0, float(stored)))
    if rank is None or not universe:
        return None
    return max(0.0, min(100.0, (universe - int(rank) + 1) / universe * 100.0))


def _freshness(source_year: int | None, requested_year: int, average_lag: float | None = None) -> tuple[str, float | None]:
    if average_lag is not None:
        lag = max(0.0, float(average_lag))
    elif source_year is not None:
        lag = float(max(0, requested_year - int(source_year)))
    else:
        return "missing", None
    return ("current" if lag <= 1 else "recent" if lag <= 2 else "stale"), lag


def _latest_cells(conn, requested_year: int) -> dict[str, dict[str, dict[str, Any]]]:
    placeholders = ",".join("?" for _ in INDEX_ORDER)
    observations = rows(conn, f"""
        SELECT s.* FROM index_scores s
        JOIN (
          SELECT index_code,iso3,MAX(year) value_year
          FROM index_scores WHERE year<=? AND index_code IN ({placeholders})
          GROUP BY index_code,iso3
        ) latest ON latest.index_code=s.index_code AND latest.iso3=s.iso3 AND latest.value_year=s.year
    """, (requested_year, *INDEX_ORDER))
    universe = {(r["index_code"], int(r["year"])): int(r["n"]) for r in rows(
        conn, f"SELECT index_code,year,COUNT(*) n FROM index_scores WHERE index_code IN ({placeholders}) GROUP BY index_code,year", tuple(INDEX_ORDER)
    )}
    result: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for item in observations:
        value_year = int(item["year"])
        source_year = int(item.get("source_data_year") or value_year)
        fresh, lag = _freshness(source_year, requested_year)
        count = universe.get((item["index_code"], value_year))
        result[item["iso3"]][item["index_code"]] = {
            "index_code": item["index_code"], "score": float(item["score"]),
            "rank": int(item["rank"]) if item.get("rank") is not None else None,
            "percentile": _percentile(item.get("rank"), count, item.get("percentile")),
            "universe_count": count, "value_year": value_year, "source_data_year": source_year,
            "source_year_min": source_year, "source_year_max": source_year, "year_lag": lag,
            "freshness": fresh, "data_quality": float(item.get("data_quality") or 0),
            "value_id": item.get("value_id"), "source_id": item.get("source_id"),
            "formula_version": item.get("formula_version"), "quality_flag": item.get("quality_flag"),
            "ranking_mode": "asof", "methodology_break": False,
        }
    return result


def _inject_htei_v6(conn, cells: dict[str, dict[str, dict[str, Any]]], requested_year: int, mode: str) -> tuple[str, int | None]:
    allowed = {"proxy_extended", "common_support", "direct_core"}
    mode = mode if mode in allowed else "proxy_extended"
    if requested_year < 2026 or not _exists(conn, "htei_v6_profiles"):
        return "legacy_asof", None
    release = row(conn, "SELECT MAX(release_year) release_year FROM htei_v6_profiles WHERE mode=? AND release_year<=?", (mode, requested_year))
    release_year = int(release["release_year"]) if release and release.get("release_year") is not None else None
    if release_year is None:
        return "legacy_asof", None
    profiles = rows(conn, "SELECT * FROM htei_v6_profiles WHERE mode=? AND release_year=? AND eligible_for_ranking=1 ORDER BY rank", (mode, release_year))
    if not profiles:
        return "legacy_asof", None
    for country_cells in cells.values():
        country_cells.pop("HTEI", None)
    universe = len(profiles)
    for item in profiles:
        fresh, lag = _freshness(item.get("newest_source_year"), requested_year, item.get("average_lag"))
        cells[item["iso3"]]["HTEI"] = {
            "index_code": "HTEI", "score": float(item["substantive_score"]),
            "rank": int(item["rank"]) if item.get("rank") is not None else None,
            "percentile": _percentile(item.get("rank"), universe, item.get("percentile")),
            "universe_count": universe, "value_year": int(item["release_year"]),
            "source_data_year": item.get("newest_source_year"), "source_year_min": item.get("oldest_source_year"),
            "source_year_max": item.get("newest_source_year"), "year_lag": lag, "freshness": fresh,
            "data_quality": float(item.get("confidence_score") or 0), "value_id": item.get("profile_id"),
            "source_id": "HTEI_FINAL_V6", "formula_version": item.get("formula_version"),
            "quality_flag": item.get("coverage_class"), "ranking_mode": mode, "methodology_break": True,
            "score_low": item.get("score_low"), "score_high": item.get("score_high"),
            "rank_low": item.get("rank_low"), "rank_high": item.get("rank_high"),
            "available_components": item.get("available_components"), "available_weight": item.get("available_weight"),
        }
    return mode, release_year


def _mean(values: Iterable[float | None]) -> float | None:
    clean = [float(v) for v in values if v is not None and math.isfinite(float(v))]
    return statistics.fmean(clean) if clean else None


def _median(values: Iterable[float | None]) -> float | None:
    clean = [float(v) for v in values if v is not None and math.isfinite(float(v))]
    return statistics.median(clean) if clean else None


def _profiles(conn, requested_year: int, htei_mode: str):
    metadata = _metadata(conn)
    cells = _latest_cells(conn, requested_year)
    effective_mode, release_year = _inject_htei_v6(conn, cells, requested_year, htei_mode)
    result = []
    for country in rows(conn, "SELECT iso3,iso2,name_ru,name_en,region,income_group,population_m,flag FROM countries ORDER BY name_en"):
        index_cells = {code: cells.get(country["iso3"], {}).get(code) for code in INDEX_ORDER}
        available = [c for c in index_cells.values() if c and c.get("percentile") is not None]
        source_years = [int(c["source_year_min"]) for c in available if c.get("source_year_min") is not None]
        result.append({**country, "indices": index_cells, "coverage_count": len(available),
            "coverage_rate": len(available) / len(INDEX_ORDER), "mean_percentile": _mean(c.get("percentile") for c in available),
            "median_percentile": _median(c.get("percentile") for c in available),
            "oldest_source_year": min(source_years) if source_years else None,
            "stale_count": sum(1 for c in available if c.get("freshness") == "stale")})
    return metadata, result, effective_mode, release_year


def _filter(profiles, group: str, region: str | None, income: str | None, q: str | None):
    code = (group or "G20").upper()
    definition = GROUPS.get(code, GROUPS["G20"])
    allowed = definition["iso3"]
    if allowed == "dynamic":
        ranked = sorted([p for p in profiles if p["indices"].get("HTEI") and p["indices"]["HTEI"].get("rank")], key=lambda p: p["indices"]["HTEI"]["rank"])
        allowed = {p["iso3"] for p in ranked[:10]}
    filtered = profiles if allowed is None else [p for p in profiles if p["iso3"] in allowed]
    if region and region.lower() != "all": filtered = [p for p in filtered if (p.get("region") or "").lower() == region.lower()]
    if income and income.lower() != "all": filtered = [p for p in filtered if (p.get("income_group") or "").lower() == income.lower()]
    if q:
        needle = q.strip().lower()
        filtered = [p for p in filtered if needle in f"{p['iso3']} {p['name_ru']} {p['name_en']}".lower()]
    public = {k: v for k, v in definition.items() if k != "iso3"}
    return filtered, {"code": code, **public}


def _rankdata(values: list[float]) -> list[float]:
    ordered = sorted(enumerate(values), key=lambda pair: pair[1]); ranks = [0.0] * len(values); i = 0
    while i < len(ordered):
        j = i + 1
        while j < len(ordered) and ordered[j][1] == ordered[i][1]: j += 1
        rank_value = (i + 1 + j) / 2
        for k in range(i, j): ranks[ordered[k][0]] = rank_value
        i = j
    return ranks


def _spearman(pairs: list[tuple[float, float]]) -> float | None:
    if len(pairs) < 2: return None
    xs, ys = _rankdata([p[0] for p in pairs]), _rankdata([p[1] for p in pairs])
    mx, my = statistics.fmean(xs), statistics.fmean(ys)
    dx, dy = [v-mx for v in xs], [v-my for v in ys]
    den = math.sqrt(sum(v*v for v in dx) * sum(v*v for v in dy))
    return sum(a*b for a,b in zip(dx,dy)) / den if den else None


def _summaries(metadata, profiles):
    result=[]
    for index in metadata:
        code=index["code"]; values=[(p,p["indices"].get(code)) for p in profiles]; values=[(p,c) for p,c in values if c and c.get("percentile") is not None]
        top=max(values,key=lambda item:item[1]["percentile"]) if values else None
        years=[int(c["value_year"]) for _,c in values if c.get("value_year") is not None]
        result.append({"code":code,"available_count":len(values),"missing_count":max(0,len(profiles)-len(values)),
            "coverage_rate":len(values)/len(profiles) if profiles else 0,"median_percentile":_median(c["percentile"] for _,c in values),
            "mean_percentile":_mean(c["percentile"] for _,c in values),"median_score":_median(c["score"] for _,c in values),
            "value_year_min":min(years) if years else None,"value_year_max":max(years) if years else None,
            "stale_count":sum(1 for _,c in values if c.get("freshness")=="stale"),
            "top_country":{"iso3":top[0]["iso3"],"name_ru":top[0]["name_ru"],"name_en":top[0]["name_en"],"percentile":top[1]["percentile"],"rank":top[1]["rank"]} if top else None})
    return result


def _selected(all_profiles, selected: str | None, group_profiles):
    by_iso={p["iso3"]:p for p in all_profiles}; requested=list(dict.fromkeys([v.strip().upper() for v in (selected or "").split(",") if v.strip()]))[:MAX_SELECTED]
    if not requested: requested=DEFAULT_SELECTED
    result=[by_iso[iso] for iso in requested if iso in by_iso]
    return result or group_profiles[:min(6,len(group_profiles))]


def _insights(selected, summaries):
    peer={s["code"]:s["median_percentile"] for s in summaries}; out=[]
    for p in selected:
        cells=[c for c in p["indices"].values() if c and c.get("percentile") is not None]
        gaps=[{"index_code":c["index_code"],"gap":c["percentile"]-peer[c["index_code"]],"percentile":c["percentile"],"peer_median":peer[c["index_code"]]} for c in cells if peer.get(c["index_code"]) is not None]
        out.append({"iso3":p["iso3"],"mean_percentile":p["mean_percentile"],"coverage_count":p["coverage_count"],
            "strongest":max(cells,key=lambda c:c["percentile"]) if cells else None,"weakest":min(cells,key=lambda c:c["percentile"]) if cells else None,
            "largest_positive_gap":max(gaps,key=lambda x:x["gap"]) if gaps else None,"largest_negative_gap":min(gaps,key=lambda x:x["gap"]) if gaps else None})
    return out


def _correlations(metadata, profiles):
    cells=[]; strongest=None; weakest=None
    for left in metadata:
        for right in metadata:
            pairs=[]
            for p in profiles:
                a,b=p["indices"].get(left["code"]),p["indices"].get(right["code"])
                if a and b and a.get("score") is not None and b.get("score") is not None: pairs.append((float(a["score"]),float(b["score"])))
            coefficient=1.0 if left["code"]==right["code"] and pairs else _spearman(pairs)
            publish=coefficient is not None and len(pairs)>=MIN_CORRELATION_N
            item={"x":left["code"],"y":right["code"],"coefficient":coefficient if publish or left["code"]==right["code"] else None,"n":len(pairs),"minimum_n":MIN_CORRELATION_N}
            cells.append(item)
            if left["code"]<right["code"] and publish:
                if strongest is None or coefficient>strongest["coefficient"]: strongest=item
                if weakest is None or coefficient<weakest["coefficient"]: weakest=item
    return {"cells":cells,"strongest_pair":strongest,"weakest_pair":weakest,"method":"spearman_pairwise"}


def _scatter(profiles, x_index: str, y_index: str, selected_iso3: set[str]):
    points=[]; raw_pairs=[]
    for p in profiles:
        x,y=p["indices"].get(x_index),p["indices"].get(y_index)
        if not x or not y or x.get("percentile") is None or y.get("percentile") is None: continue
        raw_pairs.append((float(x["score"]),float(y["score"])))
        points.append({"iso3":p["iso3"],"name_ru":p["name_ru"],"name_en":p["name_en"],"region":p.get("region"),"selected":p["iso3"] in selected_iso3,
            "x":float(x["percentile"]),"y":float(y["percentile"]),"x_rank":x.get("rank"),"y_rank":y.get("rank"),"x_score":x.get("score"),"y_score":y.get("score"),
            "x_year":x.get("value_year"),"y_year":y.get("value_year"),"x_source_year":x.get("source_data_year"),"y_source_year":y.get("source_data_year")})
    mx,my=_median(p["x"] for p in points),_median(p["y"] for p in points); quadrants={"high_high":0,"high_low":0,"low_high":0,"low_low":0}
    if mx is not None and my is not None:
        for p in points:
            key="high_high" if p["x"]>=mx and p["y"]>=my else "high_low" if p["x"]>=mx else "low_high" if p["y"]>=my else "low_low"; quadrants[key]+=1
    return {"x_index":x_index,"y_index":y_index,"points":points,"n":len(points),"correlation":_spearman(raw_pairs) if len(raw_pairs)>=MIN_CORRELATION_N else None,
        "minimum_n":MIN_CORRELATION_N,"median_x":mx,"median_y":my,"quadrants":quadrants,"scale":"percentile_0_100"}


def _trend(conn, selected, requested_year: int, code: str, htei_mode: str):
    iso=[p["iso3"] for p in selected]
    if not iso: return {"index_code":code,"series":[],"years":[],"warnings_ru":[],"warnings_en":[]}
    ph=",".join("?" for _ in iso)
    raw=rows(conn,f"SELECT s.*,c.name_ru,c.name_en FROM index_scores s JOIN countries c ON c.iso3=s.iso3 WHERE s.index_code=? AND s.year<=? AND s.iso3 IN ({ph}) ORDER BY s.iso3,s.year",(code,requested_year,*iso))
    universe={(int(r["year"])):int(r["n"]) for r in rows(conn,"SELECT year,COUNT(*) n FROM index_scores WHERE index_code=? GROUP BY year",(code,))}
    series: dict[str,list[dict[str,Any]]]=defaultdict(list)
    for item in raw:
        if code=="HTEI" and int(item["year"])>=2026 and "asof" in str(item.get("formula_version") or "").lower(): continue
        count=universe.get(int(item["year"])); series[item["iso3"]].append({"year":int(item["year"]),"rank":int(item["rank"]),"score":float(item["score"]),
            "percentile":_percentile(item.get("rank"),count,item.get("percentile")),"universe_count":count,"source_data_year":item.get("source_data_year") or item["year"],
            "formula_version":item.get("formula_version"),"value_id":item.get("value_id"),"segment":"historical","comparable_to_previous":True})
    wr=[];we=[]
    if code=="HTEI" and requested_year>=2026:
        for p in selected:
            current=p["indices"].get("HTEI")
            if current and current.get("ranking_mode")==htei_mode:
                series[p["iso3"]].append({"year":int(current["value_year"]),"rank":current.get("rank"),"score":current.get("score"),"percentile":current.get("percentile"),
                    "universe_count":current.get("universe_count"),"source_data_year":current.get("source_data_year"),"formula_version":current.get("formula_version"),
                    "value_id":current.get("value_id"),"segment":"current_v6","comparable_to_previous":False})
        wr.append("Точка HTEI 2026 рассчитана по текущей методологии v6 и показана отдельно; пунктир не означает полной сопоставимости с историческим рядом.")
        we.append("The 2026 HTEI point uses the current v6 methodology and is shown separately; the dashed connector does not imply full comparability with the historical series.")
    if code=="HCI_PLUS":
        wr.append("HCI+ представлен одной текущей редакцией 2026 года; исторический HCI не объединяется с ним в непрерывный ряд.")
        we.append("HCI+ currently has one 2026 edition; historical HCI is not merged into a continuous series.")
    output=[]
    for p in selected: output.append({"iso3":p["iso3"],"name_ru":p["name_ru"],"name_en":p["name_en"],"points":sorted(series.get(p["iso3"],[]),key=lambda x:x["year"])})
    return {"index_code":code,"series":output,"years":sorted({point["year"] for s in output for point in s["points"]}),"warnings_ru":wr,"warnings_en":we,"rank_direction":"lower_is_better"}


def comparison_workspace_payload(conn, requested_year: int, group: str="G20", region: str|None=None, income_group: str|None=None, q: str|None=None,
                                 selected: str|None=None, scatter_x: str="HTEI", scatter_y: str="GII", trend_index: str="HTEI", htei_mode: str="proxy_extended") -> dict[str,Any]:
    metadata,all_profiles,effective_mode,htei_release=_profiles(conn,requested_year,htei_mode); codes={m["code"] for m in metadata}
    scatter_x=scatter_x.upper() if scatter_x.upper() in codes else "HTEI"; scatter_y=scatter_y.upper() if scatter_y.upper() in codes else "GII"
    if scatter_x==scatter_y: scatter_y=next(c for c in INDEX_ORDER if c in codes and c!=scatter_x)
    trend_index=trend_index.upper() if trend_index.upper() in codes else "HTEI"
    group_profiles,group_meta=_filter(all_profiles,group,region,income_group,q); selected_profiles=_selected(all_profiles,selected,group_profiles); summaries=_summaries(metadata,group_profiles)
    selected_set={p["iso3"] for p in selected_profiles}; total=len(group_profiles)*len(metadata); available=sum(p["coverage_count"] for p in group_profiles)
    group_profiles=sorted(group_profiles,key=lambda p:(p["mean_percentile"] is None,-(p["mean_percentile"] or 0),p["name_en"]))
    groups=[]
    for code,definition in GROUPS.items():
        allowed=definition["iso3"]
        count=min(10,sum(1 for p in all_profiles if p["indices"].get("HTEI"))) if allowed=="dynamic" else sum(p["coverage_count"]>0 for p in all_profiles) if allowed is None else sum(p["iso3"] in allowed and p["coverage_count"]>0 for p in all_profiles)
        groups.append({"code":code,"label_ru":definition["label_ru"],"label_en":definition["label_en"],"description_ru":definition["description_ru"],"description_en":definition["description_en"],"country_count":count})
    return {"schema_version":"comparison-workspace-v1","requested_year":requested_year,"indices":metadata,"countries":group_profiles,
        "all_countries":[{k:p.get(k) for k in ("iso3","iso2","name_ru","name_en","region","income_group","flag")} for p in all_profiles if p["coverage_count"]>0],
        "selected_countries":selected_profiles,"group":group_meta,"groups":groups,"filters":{"region":region or "all","income_group":income_group or "all","q":q or ""},
        "regions":sorted({p["region"] for p in all_profiles if p.get("region")}),"income_groups":sorted({p["income_group"] for p in all_profiles if p.get("income_group")}),
        "summary":{"country_count":len(group_profiles),"index_count":len(metadata),"available_cells":available,"total_cells":total,"coverage_rate":available/total if total else 0,
            "complete_profiles":sum(p["coverage_count"]==len(metadata) for p in group_profiles),"stale_cells":sum(p["stale_count"] for p in group_profiles),
            "diagnostic_mean_note_ru":"Средний процентиль используется только как навигационная сводка профиля и не является новым официальным индексом.",
            "diagnostic_mean_note_en":"The mean percentile is used only as a navigational profile summary and is not a new official index."},
        "index_summaries":summaries,"country_insights":_insights(selected_profiles,summaries),"correlations":_correlations(metadata,group_profiles),
        "scatter":_scatter(group_profiles,scatter_x,scatter_y,selected_set),"trend":_trend(conn,selected_profiles,requested_year,trend_index,effective_mode),
        "htei":{"mode":effective_mode,"release_year":htei_release,"available_modes":["proxy_extended","common_support","direct_core"],
            "label_ru":{"proxy_extended":"Расширенный сопоставимый рейтинг","common_support":"Основной международный рейтинг","direct_core":"Строгий слой прямых данных","legacy_asof":"Исторический ASOF-слой"}.get(effective_mode,effective_mode),
            "label_en":{"proxy_extended":"Extended comparable ranking","common_support":"Primary international ranking","direct_core":"Strict direct-data layer","legacy_asof":"Historical ASOF layer"}.get(effective_mode,effective_mode)},
        "methodology":{"comparison_scale":"percentile_0_100","correlation_method":"Spearman pairwise correlation of overlapping country scores","minimum_correlation_n":MIN_CORRELATION_N,"missingness":"pairwise_complete",
            "notes_ru":["Межиндексное сравнение выполняется по процентильной позиции, потому что исходные шкалы различаются.","Каждая ячейка сохраняет исходный score, место, размер рейтинговой вселенной и фактический год данных.","Корреляция рассчитывается попарно только по странам с обоими показателями; коэффициенты при n<15 не публикуются.","Средний процентиль профиля является диагностической навигацией, а не новым составным индексом."],
            "notes_en":["Cross-index comparisons use percentile positions because original scales differ.","Each cell retains its original score, rank, ranking-universe size and actual data year.","Correlations are pairwise and use countries with both measures; coefficients with n<15 are withheld.","The profile mean percentile is navigational diagnostics, not a new composite index."]}}


def comparison_workspace_csv(payload: dict[str,Any], lang: str="ru") -> str:
    out=io.StringIO(); writer=csv.writer(out,lineterminator="\n"); columns=["iso3","country","region","income_group","coverage_count","mean_percentile"]
    for index in payload["indices"]:
        code=index["code"]; columns += [f"{code}_percentile",f"{code}_rank",f"{code}_universe",f"{code}_score",f"{code}_value_year",f"{code}_source_data_year",f"{code}_data_quality",f"{code}_value_id"]
    writer.writerow(columns)
    for country in payload["countries"]:
        values=[country["iso3"],country["name_ru"] if lang=="ru" else country["name_en"],country.get("region"),country.get("income_group"),country.get("coverage_count"),country.get("mean_percentile")]
        for index in payload["indices"]:
            cell=country["indices"].get(index["code"]) or {}; values += [cell.get("percentile"),cell.get("rank"),cell.get("universe_count"),cell.get("score"),cell.get("value_year"),cell.get("source_data_year"),cell.get("data_quality"),cell.get("value_id")]
        writer.writerow(values)
    return out.getvalue()

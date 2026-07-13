from __future__ import annotations

import csv
import json
import math
import re
import sqlite3
from collections import defaultdict
from io import StringIO
from statistics import mean, median, quantiles
from typing import Any, Iterable

from .db import row, rows

BLOCK_ORDER = [
    "institutional_environment",
    "educational_infrastructure",
    "corporate_strategies",
    "international_cooperation",
]

DEFAULT_BLOCK_WEIGHTS = {
    "institutional_environment": 0.25,
    "educational_infrastructure": 0.30,
    "corporate_strategies": 0.25,
    "international_cooperation": 0.20,
}

BLOCK_META: dict[str, dict[str, str]] = {
    "institutional_environment": {
        "name_ru": "Институциональная среда",
        "name_en": "Institutional environment",
        "description_ru": "Способность институтов, цифровой связности и среды для талантов переводить кадровые дефициты в согласованный образовательный и технологический заказ.",
        "description_en": "The capacity of institutions, digital connectivity and the talent environment to translate workforce gaps into coordinated education and technology demand.",
    },
    "educational_infrastructure": {
        "name_ru": "Образовательная инфраструктура",
        "name_en": "Educational infrastructure",
        "description_ru": "Масштаб и качество образовательного потока: результаты обучения, выпуск STEM и присутствие инженерно-технологических университетов.",
        "description_en": "The scale and quality of the education pipeline: learning outcomes, STEM graduates and the presence of engineering and technology universities.",
    },
    "corporate_strategies": {
        "name_ru": "Корпоративные стратегии",
        "name_en": "Corporate strategies",
        "description_ru": "Способность бизнеса формировать технологический спрос, участвовать в НИОКР и превращать компетенции в измеримые технологические результаты.",
        "description_en": "The capacity of business to create technology demand, participate in R&D and convert skills into measurable technology outcomes.",
    },
    "international_cooperation": {
        "name_ru": "Международное сотрудничество",
        "name_en": "International cooperation",
        "description_ru": "Включённость системы подготовки кадров в международные научные, образовательные и технологические сети и способность привлекать таланты.",
        "description_en": "The integration of the training system into international research, education and technology networks and its ability to attract talent.",
    },
}

BRICS5 = {"BRA", "RUS", "IND", "CHN", "ZAF"}
G20 = {
    "ARG", "AUS", "BRA", "CAN", "CHN", "FRA", "DEU", "IND", "IDN", "ITA",
    "JPN", "KOR", "MEX", "RUS", "SAU", "ZAF", "TUR", "GBR", "USA",
}
OECD = {
    "AUS", "AUT", "BEL", "CAN", "CHL", "COL", "CRI", "CZE", "DNK", "EST",
    "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ISR", "ITA", "JPN",
    "KOR", "LVA", "LTU", "LUX", "MEX", "NLD", "NZL", "NOR", "POL", "PRT",
    "SVK", "SVN", "ESP", "SWE", "CHE", "TUR", "GBR", "USA",
}
TECHNOLOGY_PEERS = {"RUS", "CHN", "IND", "DEU", "KOR", "SGP", "USA", "JPN", "FIN", "SWE"}

GROUP_DEFINITIONS: list[dict[str, Any]] = [
    {
        "code": "TECHNOLOGY_PEERS",
        "label_ru": "Технологические сопоставления",
        "label_en": "Technology peers",
        "description_ru": "Крупные и малые экономики с выраженной технологической специализацией; не является официальной международной группировкой.",
        "description_en": "Large and small economies with a strong technology specialisation; this is an analytical, not an official, grouping.",
        "iso3": TECHNOLOGY_PEERS,
    },
    {
        "code": "BRICS5",
        "label_ru": "БРИКС-5",
        "label_en": "BRICS-5",
        "description_ru": "Исходная пятёрка БРИКС, используемая как стабильная аналитическая группа.",
        "description_en": "The original five BRICS economies, retained as a stable analytical group.",
        "iso3": BRICS5,
    },
    {
        "code": "G20",
        "label_ru": "G20",
        "label_en": "G20",
        "description_ru": "Экономики — участники G20, представленные в международной выборке модели.",
        "description_en": "G20 economies represented in the model's international universe.",
        "iso3": G20,
    },
    {
        "code": "OECD",
        "label_ru": "ОЭСР",
        "label_en": "OECD",
        "description_ru": "Страны ОЭСР, представленные в международной выборке модели.",
        "description_en": "OECD members represented in the model's international universe.",
        "iso3": OECD,
    },
]

SOURCE_PUBLIC_META: dict[str, dict[str, str]] = {
    "ITU_IDI": {
        "name_ru": "Международный союз электросвязи — индекс развития ИКТ",
        "name_en": "International Telecommunication Union — ICT Development Index",
    },
    "OECD_HTEI": {
        "name_ru": "ОЭСР — НИОКР и технологическая активность бизнеса",
        "name_en": "OECD — R&D and business technology activity",
    },
    "PORTULANS_GTCI": {
        "name_ru": "Portulans Institute / INSEAD — конкурентоспособность талантов",
        "name_en": "Portulans Institute / INSEAD — talent competitiveness",
    },
    "QS_ET": {
        "name_ru": "QS — инженерия и технологии",
        "name_en": "QS — Engineering & Technology",
    },
    "WIPO_GII": {
        "name_ru": "ВОИС — Глобальный инновационный индекс",
        "name_en": "WIPO — Global Innovation Index",
    },
    "WORLD_BANK_HCI": {
        "name_ru": "Всемирный банк — человеческий капитал",
        "name_en": "World Bank — human capital",
    },
    "UIS_HTEI": {
        "name_ru": "Институт статистики ЮНЕСКО — выпускники STEM",
        "name_en": "UNESCO Institute for Statistics — STEM graduates",
    },
    "WORLD_BANK_HTEI": {
        "name_ru": "Всемирный банк — технологические и кадровые показатели",
        "name_en": "World Bank — technology and workforce indicators",
    },
    "ILOSTAT_HTEI": {
        "name_ru": "МОТ / ILOSTAT — занятость и профессии",
        "name_en": "ILO / ILOSTAT — employment and occupations",
    },
}

UNIT_LABELS: dict[str, tuple[str, str]] = {
    "percent_of_total_employment": ("% занятых", "% of total employment"),
    "rd_personnel_per_million_population": ("человек на 1 млн населения", "people per million population"),
    "percent_of_tertiary_graduates": ("% выпускников высшего образования", "% of tertiary graduates"),
    "business_rd_percent_of_gerd": ("% внутренних затрат на НИОКР", "% of gross domestic R&D expenditure"),
    "equal_weight_mean_of_individually_minmax_normalized_indicators_0_100": ("балл 0–100", "score, 0–100"),
    "score_0_100": ("балл 0–100", "score, 0–100"),
    "country_score_0_100": ("страновой балл 0–100", "country score, 0–100"),
}

POLICY_PUBLIC_RU_REPLACEMENTS: tuple[tuple[str, str], ...] = (
    ("Eurostat high-tech/KIS", "классификациями Евростата высокотехнологичных и наукоёмких видов деятельности"),
    ("high-tech/KIS", "высокотехнологичных и наукоёмких видов деятельности"),
    ("high-tech occupations", "технологические профессии"),
    ("crosswalk", "таблица соответствия классификаций"),
    ("industrial PhD", "индустриальная аспирантура"),
    ("R&D personnel", "персонал исследований и разработок"),
    ("R&D-центры", "центры исследований и разработок"),
    ("STEM pipeline", "образовательный поток STEM"),
    ("outcome-мониторинг", "мониторинг завершения обучения и трудоустройства"),
    ("bridge courses", "переходные курсы"),
    ("ICT services exports", "экспорт ИКТ-услуг"),
    ("high-tech exports", "экспорт высокотехнологичной продукции"),
    ("R&D headcount", "численность персонала НИОКР"),
    ("disclosed workforce plans", "опубликованные кадровые планы"),
    ("numeric scoring", "числовая оценка"),
    ("proxy", "косвенный показатель"),
    ("mobility balance", "баланс академической мобильности"),
    ("co-publications", "совместные публикации"),
    ("joint R&D projects", "совместные проекты НИОКР"),
    ("research impact", "научное влияние"),
    ("international collaboration", "международное сотрудничество"),
    ("employer reputation", "репутация среди работодателей"),
    ("employer engagement", "взаимодействие с работодателями"),
    ("research citations", "цитируемость исследований"),
    ("top-100/top-250/top-500", "первые 100, 250 и 500 позиций"),
    ("Среднее top-10", "Среднее значение десяти стран-лидеров"),
    ("сопоставимого HTEI", "сопоставимого Индекса технологической занятости (HTEI)"),
    ("top-10", "десять стран-лидеров"),
    ("TRAINING_MODEL", "модель конкурентоспособности системы подготовки кадров"),
    ("QS_ET", "рейтинг QS по инженерным и технологическим направлениям"),
    ("top-250/top-100", "первые 250 и первые 100 позиций"),
    ("top-500", "первые 500 позиций"),
    ("top-250", "первые 250 позиций"),
    ("top-100", "первые 100 позиций"),
    ("R&D", "НИОКР"),
    ("data engineering", "инженерия данных"),
)

POLICY_PUBLIC_EN_REPLACEMENTS: tuple[tuple[str, str], ...] = (
    ("crosswalk", "classification mapping"),
    ("industrial PhD", "industry-based doctoral"),
    ("R&D personnel", "research and development personnel"),
    ("R&D headcount", "research and development staffing"),
    ("disclosed workforce plans", "published workforce plans"),
    ("numeric scoring", "quantitative scoring"),
    ("proxy", "indirect measure"),
)

POLICY_PUBLIC_FIELDS: tuple[str, ...] = (
    "title", "problem", "indicator", "measure", "actor", "target_kpi",
    "benchmark", "expected_effect", "risk", "resources", "monitoring",
)


def _public_policy_copy(item: dict[str, Any]) -> None:
    """Translate release-facing jargon without mutating the scientific database."""
    for prefix in POLICY_PUBLIC_FIELDS:
        ru_key = f"{prefix}_ru"
        en_key = f"{prefix}_en"
        ru_value = str(item.get(ru_key) or "")
        en_value = str(item.get(en_key) or "")
        for source, replacement in POLICY_PUBLIC_RU_REPLACEMENTS:
            ru_value = ru_value.replace(source, replacement)
        for source, replacement in POLICY_PUBLIC_EN_REPLACEMENTS:
            en_value = en_value.replace(source, replacement)
        item[ru_key] = ru_value
        item[en_key] = en_value


POLICY_STRANDS: dict[str, dict[str, Any]] = {
    "measurement": {
        "name_ru": "Измерение рынка труда и кадрового спроса",
        "name_en": "Labour-market measurement and workforce demand",
        "description_ru": "Единые классификации, регулярное наблюдение занятости, технологических профессий и корпоративного спроса.",
        "description_en": "Shared classifications and recurrent measurement of employment, technology occupations and corporate demand.",
        "item_ids": {"RUS-HTEI-01", "RUS-HTEI-02", "RUS-HTEI-06"},
        "linked_block": "institutional_environment",
    },
    "pipeline": {
        "name_ru": "Кадровое ядро и образовательный поток",
        "name_en": "R&D workforce and education pipeline",
        "description_ru": "Укрепление кадров НИОКР, STEM-подготовки и перехода выпускников в технологическую занятость.",
        "description_en": "Strengthening R&D personnel, STEM education and the transition of graduates into technology employment.",
        "item_ids": {"RUS-HTEI-03", "RUS-HTEI-04"},
        "linked_block": "educational_infrastructure",
    },
    "outcomes": {
        "name_ru": "Технологические результаты",
        "name_en": "Technology outcomes",
        "description_ru": "Связь кадровой политики с патентами, экспортом, ИКТ-услугами и внедрением исследований и разработок.",
        "description_en": "Connecting workforce policy to patents, exports, ICT services and deployed research and development.",
        "item_ids": {"RUS-HTEI-05"},
        "linked_block": "corporate_strategies",
    },
    "cooperation": {
        "name_ru": "Международная кооперация и университетское позиционирование",
        "name_en": "International cooperation and university positioning",
        "description_ru": "Совместные программы и лаборатории, мобильность, международная видимость и устойчивые партнёрские сети.",
        "description_en": "Joint programmes and laboratories, mobility, international visibility and durable partnership networks.",
        "item_ids": {"RUS-SYSTEM-07", "RUS-QS-08"},
        "linked_block": "international_cooperation",
    },
}

POLICY_BLOCK_LINKS = {
    "RUS-HTEI-01": "institutional_environment",
    "RUS-HTEI-02": "institutional_environment",
    "RUS-HTEI-03": "educational_infrastructure",
    "RUS-HTEI-04": "educational_infrastructure",
    "RUS-HTEI-05": "corporate_strategies",
    "RUS-HTEI-06": "corporate_strategies",
    "RUS-SYSTEM-07": "international_cooperation",
    "RUS-QS-08": "international_cooperation",
}

# Release-facing Russian copy keeps technical classifications available while
# translating process jargon into complete, grammatically correct language.
POLICY_RU_OVERRIDES: dict[str, dict[str, str]] = {
    "RUS-HTEI-01": {
        "indicator_ru": "Доля занятых в информационно-коммуникационных, профессиональных, научных и технических видах деятельности",
        "measure_ru": "Создать межведомственную систему мониторинга занятости по классификаторам видов экономической деятельности и занятий (ОКВЭД/ОКЗ) с квартальной сверкой Росстата, отраслевых ведомств и крупнейших работодателей; утвердить открытую российскую таблицу соответствия классификациям Евростата для высокотехнологичных и наукоёмких видов деятельности.",
        "target_kpi_ru": "Ежегодно увеличивать долю занятых в согласованном перечне высокотехнологичных и наукоёмких видов деятельности и распространить полноценный отраслевой мониторинг на все субъекты Российской Федерации.",
        "risk_ru": "Несогласованность классификаторов и двойной учёт; необходимы единая открытая таблица соответствия и регламент версионного пересчёта.",
        "resources_ru": "Федеральный проектный офис, интеграция ведомственных данных и регулярное обследование работодателей.",
        "monitoring_ru": "Квартальный мониторинг Росстата и ежегодный публичный отчёт по HTEI и регионам.",
    },
    "RUS-HTEI-02": {
        "indicator_ru": "Доля специалистов и технических специалистов в общей занятости",
        "measure_ru": "Утвердить таблицу соответствия технологических профессий на основе международных классификаций ISCO, ESCO/O*NET и российского ОКЗ; ежегодно обновлять перечень с участием советов по профессиональным квалификациям и технологических компаний.",
        "target_kpi_ru": "Охватить единым версионируемым классификатором не менее 90% вакансий и программ подготовки по приоритетным технологическим направлениям.",
        "risk_ru": "Быстрое изменение профессий; классификатор должен хранить версии, дату актуальности и явные связи с навыками.",
        "resources_ru": "Экспертные рабочие группы, инженерия данных и открытая машиночитаемая таксономия.",
        "monitoring_ru": "Раз в полгода публиковать новую версию таблицы соответствия и долю сопоставленных вакансий, программ и занятых.",
    },
    "RUS-HTEI-03": {
        "indicator_ru": "Персонал исследований и разработок на 1 млн населения",
        "problem_ru": "Численность исследователей и технических специалистов НИОКР относительно населения остаётся ниже уровня технологических лидеров; часть кадрового состава стареет, а переход между академией и индустрией ограничен.",
        "measure_ru": "Расширить программы индустриальной аспирантуры, совместные лаборатории университетов и компаний, долгосрочные позиции для молодых исследователей и маршруты мобильности между академической и корпоративной средой.",
        "target_kpi_ru": "Увеличить численность персонала НИОКР на миллион населения и долю исследователей до 39 лет; обеспечить измеримый рост корпоративного софинансирования.",
        "risk_ru": "Формальные партнёрства без реальных задач; необходим независимый аудит проектных портфелей и совместных результатов.",
        "resources_ru": "Грантовое и корпоративное софинансирование, инфраструктура совместных лабораторий и программы мобильности.",
        "monitoring_ru": "Ежегодно публиковать численность персонала НИОКР, возрастную структуру, охват индустриальной аспирантурой, совместные патенты и внедрения.",
    },
    "RUS-HTEI-04": {
        "title_ru": "Обновить данные и укрепить подготовку по естественно-научным, инженерным и математическим направлениям",
        "indicator_ru": "Доля выпускников естественно-научных, инженерных и математических направлений",
        "problem_ru": "Последнее международно сопоставимое значение образовательного потока STEM для России существенно отстаёт от года выпуска модели, а количество выпускников само по себе не гарантирует соответствия навыков отраслевому спросу.",
        "measure_ru": "Обновить официальную статистику по направлениям подготовки, внедрить мониторинг завершения обучения и трудоустройства, усилить математику, программирование и инженерное проектирование в переходных курсах.",
        "target_kpi_ru": "Ежегодно публиковать показатели образовательного потока STEM с лагом не более двух лет и повышать завершение программ и трудоустройство по профилю.",
        "risk_ru": "Масштабирование без контроля качества; необходимы независимые оценки навыков и данные о траекториях выпускников.",
        "resources_ru": "Обновление статистической системы, переходные курсы, наставничество и цифровой мониторинг выпускников.",
        "monitoring_ru": "Ежегодно публиковать выпуск, завершение обучения, трудоустройство, оценку навыков и региональную мобильность.",
    },
    "RUS-HTEI-05": {
        "indicator_ru": "Сводный показатель технологических результатов экономики",
        "measure_ru": "Финансировать университетско-корпоративные консорциумы по измеримым результатам: патенты, экспорт ИКТ-услуг, экспорт высокотехнологичной продукции, лицензирование и внедрение НИОКР.",
        "target_kpi_ru": "Обеспечить рост технологических результатов по каждому раскрытому исходному показателю и установить отдельные целевые значения коммерциализации и экспорта.",
        "risk_ru": "Значительный временной лаг и влияние внешней конъюнктуры; краткосрочные и долгосрочные показатели необходимо оценивать раздельно.",
        "resources_ru": "Консорциумные гранты, инфраструктура трансфера технологий, экспортная и патентная поддержка.",
        "monitoring_ru": "Ежегодно анализировать экспорт высокотехнологичной продукции, экспорт ИКТ-услуг, патенты и внедрённые разработки.",
    },
    "RUS-HTEI-06": {
        "indicator_ru": "Доля бизнеса во внутренних затратах на исследования и разработки",
        "problem_ru": "Доля бизнеса в финансировании НИОКР является только косвенной оценкой корпоративной активности и не раскрывает планы найма, дефицит навыков и кадровые стратегии.",
        "measure_ru": "Ввести сначала добровольный, затем стандартизированный формат раскрытия численности персонала НИОКР, технологического найма, обучения и планов развития компетенций; связать его с официальной отчётностью и отраслевыми обследованиями.",
        "target_kpi_ru": "Включить в проверяемый реестр не менее 50 крупнейших технологических работодателей и обеспечить покрытие не менее 70% занятости выбранных отраслей.",
        "expected_effect_ru": "Переход от косвенной оценки к прямому измерению корпоративных стратегий и спроса на технологические кадры.",
        "risk_ru": "Выборочное раскрытие и смещение выборки; числовая оценка допустима только при достаточном и проверяемом покрытии.",
        "resources_ru": "Единый цифровой формат, юридическая экспертиза и защищённая передача агрегированных данных.",
        "monitoring_ru": "Ежегодно публиковать охват компаний, численность персонала НИОКР, вакансии и найм, обучение и раскрытые кадровые планы.",
    },
    "RUS-SYSTEM-07": {
        "indicator_ru": "Блок «Международное сотрудничество» модели подготовки кадров",
        "measure_ru": "Развивать совместные инженерные программы, сетевые лаборатории и взаимное признание учебных модулей с технологически сильными университетами дружественных стран.",
        "target_kpi_ru": "Увеличивать число совместных программ, лабораторий, публикаций и выпускников, занятых в международных проектах.",
        "risk_ru": "Геополитические ограничения и несбалансированная мобильность; требуется диверсификация партнёров.",
        "resources_ru": "Консорциумные соглашения, совместное финансирование и цифровые механизмы академической мобильности.",
        "monitoring_ru": "Ежегодно публиковать число совместных программ, баланс академической мобильности, совместные публикации и проекты НИОКР.",
    },
    "RUS-QS-08": {
        "indicator_ru": "Положение российских университетов в рейтинге QS по инженерным и технологическим направлениям",
        "problem_ru": "Ограниченное присутствие российских университетов в верхних диапазонах рейтинга QS по инженерным и технологическим направлениям снижает международную видимость кадровой и исследовательской базы.",
        "measure_ru": "Сформировать адресные планы повышения научного влияния, международного сотрудничества, репутации среди работодателей и качества раскрываемых данных для университетов с потенциалом входа в первые 250 и первые 100 позиций.",
        "target_kpi_ru": "Увеличить число российских университетов среди первых 500, 250 и 100 позиций без ухудшения академической добросовестности и качества данных.",
        "expected_effect_ru": "Повышение международной узнаваемости и расширение партнёрских связей инженерно-технологических программ.",
        "risk_ru": "Риск подмены качества управлением метриками; планы должны опираться на реальные исследования и образовательные результаты.",
        "resources_ru": "Поддержка исследований, международных проектов, библиометрической инфраструктуры и взаимодействия с работодателями.",
        "monitoring_ru": "Ежегодно публиковать число университетов среди первых 100, 250 и 500 позиций, медианное место, цитируемость исследований и международное сотрудничество.",
    },
}

# Curated translations intentionally mirror the current Russian release copy.
# The database contains reviewed English text for the first four measures but
# several later rows were shifted during an older editorial merge.  The public
# API corrects the bilingual representation without mutating scientific data.
POLICY_EN_OVERRIDES: dict[str, dict[str, str]] = {
    "RUS-HTEI-01": {
        "title_en": "Expand measurable employment in high-technology sectors",
        "problem_en": "Sector employment measurement is fragmented and insufficiently linked to priority technology industries.",
        "measure_en": "Create an inter-agency monitoring system aligned across OKVED and occupation classifications, with quarterly reconciliation between Rosstat, sector ministries and major employers, and publish a Russian crosswalk to Eurostat high-tech and knowledge-intensive sectors.",
        "actor_en": "Rosstat; Ministry of Industry and Trade; Ministry of Digital Development; Ministry of Science and Higher Education; regional governments",
        "target_kpi_en": "Increase the share of employment covered by the agreed high-tech and knowledge-intensive sector list each year and extend sector monitoring to every Russian region.",
        "expected_effect_en": "More accurate workforce-demand measurement and faster employment growth in knowledge-intensive sectors.",
        "risk_en": "Classification mismatches and double counting; a single open crosswalk and a versioned recalculation protocol are required.",
        "resources_en": "A federal programme office, integration of administrative data and recurrent employer surveys.",
        "monitoring_en": "Quarterly Rosstat monitoring and an annual public HTEI and regional workforce report.",
    },
    "RUS-HTEI-02": {
        "title_en": "Establish an evidence-based list of technology occupations",
        "problem_en": "Broad professional and technician groups do not isolate genuinely high-technology occupations or priority skill shortages.",
        "measure_en": "Approve a technology-occupation crosswalk based on ISCO, ESCO/O*NET and the Russian occupation classification, and update it annually with sector skills councils and technology companies.",
        "actor_en": "Ministry of Labour and Social Protection; Ministry of Science and Higher Education; sector skills councils; universities; employers",
        "target_kpi_en": "Map at least 90% of vacancies and training programmes in priority technology fields to a single versioned classification.",
        "expected_effect_en": "Comparable education commissioning, employment structures and observed workforce demand.",
        "risk_en": "Rapid occupational change; the classification must retain versions and explicit links to skills.",
        "resources_en": "Expert working groups, data engineering and an open machine-readable taxonomy.",
        "monitoring_en": "Publish the crosswalk version every six months and report the share of mapped vacancies, programmes and workers.",
    },
    "RUS-HTEI-03": {
        "title_en": "Expand the core R&D workforce",
        "problem_en": "R&D personnel density remains below technology leaders, while parts of the research workforce are ageing and links to corporate technology programmes remain weak.",
        "measure_en": "Expand industrial PhD tracks, joint university-company laboratories, long-term early-career research positions and mobility between academia and industry.",
        "actor_en": "Ministry of Science and Higher Education; Russian Science Foundation; universities; public and private R&D centres",
        "target_kpi_en": "Increase R&D personnel per million people and the share of researchers under 39, with measurable growth in corporate co-financing.",
        "expected_effect_en": "A stronger R&D workforce and a shorter path from researcher training to technology deployment.",
        "risk_en": "Formal partnerships without substantive projects; joint portfolios and outcomes require independent review.",
        "resources_en": "Competitive grants, corporate co-financing, joint laboratory infrastructure and mobility programmes.",
        "monitoring_en": "Annual reporting on R&D personnel, age structure, industrial PhD tracks, joint patents and deployment outcomes.",
    },
    "RUS-HTEI-04": {
        "title_en": "Refresh and strengthen the STEM education pipeline",
        "problem_en": "Russia's latest internationally comparable STEM-pipeline observation is substantially older than the release year, while graduate volume alone does not guarantee alignment with industry skill demand.",
        "measure_en": "Refresh official field-of-education statistics, introduce outcome tracking for completion and employment, and strengthen mathematics, programming and engineering design in transition courses.",
        "actor_en": "Ministry of Science and Higher Education; Federal Service for Supervision in Education and Science; Rosstat; universities; schools; industry partners",
        "target_kpi_en": "Publish the STEM pipeline annually with no more than a two-year lag and improve programme completion and field-related employment.",
        "expected_effect_en": "A sustained supply of graduates with applicable technology skills.",
        "risk_en": "Expansion without quality control; independent skill assessment and graduate-pathway data are required.",
        "resources_en": "A modernised statistical system, bridge courses, mentoring and digital graduate tracking.",
        "monitoring_en": "Annual reporting on graduation, completion, employment, skill assessment and regional mobility.",
    },
    "RUS-HTEI-05": {
        "title_en": "Connect workforce policy to technology outcomes",
        "problem_en": "Growth in trained personnel does not always translate into patents, high-technology goods and services exports or deployed research and development.",
        "measure_en": "Fund university-company consortia against measurable outcomes: patents, ICT services exports, high-technology exports, licensing and deployed R&D.",
        "actor_en": "Ministry of Science and Higher Education; Ministry of Industry and Trade; Ministry of Digital Development; Rospatent; development institutions; export centres",
        "target_kpi_en": "Improve each disclosed technology-output indicator and maintain separate commercialisation and export targets.",
        "expected_effect_en": "Conversion of workforce and research capacity into measurable technology output.",
        "risk_en": "Long time lags and external market conditions; short- and long-term KPIs must be interpreted separately.",
        "resources_en": "Consortium grants, technology-transfer infrastructure, export support and patent support.",
        "monitoring_en": "Annual review of high-technology exports, ICT services, patents and deployed R&D results.",
    },
    "RUS-HTEI-06": {
        "title_en": "Create a quantitative corporate technology-workforce demand layer",
        "problem_en": "Business R&D share is only a proxy for corporate technology activity and does not reveal hiring plans, skill shortages or workforce strategies.",
        "measure_en": "Introduce a voluntary and then standardised disclosure format for R&D personnel, technology hiring, training and skills plans, linked to official reporting and sector surveys.",
        "actor_en": "Ministry of Economic Development; Ministry of Industry and Trade; Ministry of Digital Development; Bank of Russia; stock exchanges; major employers",
        "target_kpi_en": "Include at least 50 major technology employers in an auditable register and cover at least 70% of employment in the selected industries.",
        "expected_effect_en": "A transition from an indirect proxy to direct measurement of corporate workforce strategy and technology-skill demand.",
        "risk_en": "Selective disclosure and sample bias; numeric scoring is permissible only after coverage and audit thresholds are met.",
        "resources_en": "A shared digital format, legal review and a secure channel for aggregated data submission.",
        "monitoring_en": "Annual reporting on company coverage, R&D headcount, vacancies and hiring, training and disclosed workforce plans.",
    },
    "RUS-SYSTEM-07": {
        "title_en": "Strengthen international cooperation in the training system",
        "problem_en": "International cooperation, academic mobility and joint technology programmes are not fully converted into durable workforce and research links.",
        "measure_en": "Develop joint engineering programmes, network laboratories and mutual recognition of modules with technology-strong universities in partner countries.",
        "actor_en": "Ministry of Science and Higher Education; universities; Russian Science Foundation; international consortia",
        "target_kpi_en": "Increase joint programmes, laboratories, publications and graduate employment in international projects.",
        "expected_effect_en": "A stronger international-cooperation block in the national training-system competitiveness model.",
        "risk_en": "Geopolitical constraints and unbalanced mobility; partner portfolios must be diversified.",
        "resources_en": "Consortium agreements, co-financing and digital academic mobility infrastructure.",
        "monitoring_en": "Annual reporting on joint programmes, mobility balance, co-publications and joint R&D projects.",
    },
    "RUS-QS-08": {
        "title_en": "Improve the international visibility of engineering and technology programmes",
        "problem_en": "The limited presence of Russian universities in the upper bands of QS Engineering & Technology constrains the international visibility of the country's training and research base.",
        "measure_en": "Prepare institution-specific plans for research impact, international collaboration, employer reputation and transparent data disclosure for universities with potential to enter the top 250 and top 100.",
        "actor_en": "Ministry of Science and Higher Education; universities; industry partners",
        "target_kpi_en": "Increase the number of Russian universities in the top 500, top 250 and top 100 without compromising academic integrity or data quality.",
        "expected_effect_en": "Greater international recognition and a stronger flow of partners into engineering and technology programmes.",
        "risk_en": "Metric management can displace genuine quality; plans must be based on real research and education outcomes.",
        "resources_en": "Support for research, international projects, bibliometric infrastructure and employer engagement.",
        "monitoring_en": "Annual reporting on top-100, top-250 and top-500 presence, median rank, research citations and international collaboration.",
    },
}


def _json(value: Any, default: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value or "")
    except (TypeError, json.JSONDecodeError):
        return default


def _effective_training_year(conn: sqlite3.Connection, requested_year: int, iso3: str | None = None) -> int | None:
    params: list[Any] = [requested_year]
    clause = ""
    if iso3:
        clause = " AND iso3=?"
        params.append(iso3.upper())
    candidates = rows(
        conn,
        f"SELECT DISTINCT year FROM training_model_scores WHERE year<=?{clause} ORDER BY year DESC",
        tuple(params),
    )
    if not candidates:
        params = []
        clause = ""
        if iso3:
            clause = " WHERE iso3=?"
            params.append(iso3.upper())
        candidates = rows(conn, f"SELECT DISTINCT year FROM training_model_scores{clause} ORDER BY year DESC", tuple(params))
    return int(candidates[0]["year"]) if candidates else None


def _percentile(values: list[float], probability: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    position = (len(ordered) - 1) * probability
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return float(ordered[lower])
    return float(ordered[lower] + (ordered[upper] - ordered[lower]) * (position - lower))


def _rank(values: dict[str, float], iso3: str) -> tuple[int | None, float | None]:
    if iso3 not in values:
        return None, None
    ordered = sorted(values.items(), key=lambda item: (-item[1], item[0]))
    position = next(index for index, item in enumerate(ordered, start=1) if item[0] == iso3)
    universe = len(ordered)
    percentile = (1.0 - (position - 1) / universe) * 100 if universe else None
    return position, percentile


def _mean(values: Iterable[float]) -> float | None:
    clean = [float(value) for value in values if value is not None]
    return mean(clean) if clean else None


def _block_scores(component_rows: list[dict[str, Any]]) -> dict[str, dict[str, float]]:
    grouped: dict[str, dict[str, list[dict[str, Any]]]] = defaultdict(lambda: defaultdict(list))
    for item in component_rows:
        grouped[item["iso3"]][item["block_code"]].append(item)
    result: dict[str, dict[str, float]] = {}
    for iso3, block_map in grouped.items():
        result[iso3] = {}
        for block_code, items in block_map.items():
            total_component_weight = sum(float(item.get("weight") or 0) for item in items)
            if total_component_weight <= 0:
                continue
            result[iso3][block_code] = sum(float(item.get("weighted_contribution") or 0) for item in items) / total_component_weight
    return result


def _component_benchmarks(
    all_components: list[dict[str, Any]],
    group_members: dict[str, set[str]],
) -> dict[str, dict[str, dict[str, Any]]]:
    values_by_ref: dict[str, dict[str, float]] = defaultdict(dict)
    for item in all_components:
        values_by_ref[item["component_ref"]][item["iso3"]] = float(item["normalized_score"])
    output: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for ref, values in values_by_ref.items():
        ordered = sorted(values.items(), key=lambda item: (-item[1], item[0]))
        for group_code, members in group_members.items():
            selected = [values[iso] for iso in members if iso in values]
            output[ref][group_code] = {
                "score": _mean(selected),
                "country_count": len(selected),
            }
        output[ref]["ALL"] = {
            "score": _mean(values.values()),
            "country_count": len(values),
            "median": median(values.values()) if values else None,
            "upper_quartile": _percentile(list(values.values()), 0.75),
            "top_decile_mean": _mean([value for _, value in ordered[: max(1, math.ceil(len(ordered) * 0.10))]]),
        }
    return output


def _benchmark_groups(
    ranking: list[dict[str, Any]],
    block_scores: dict[str, dict[str, float]],
    selected_iso3: str,
) -> list[dict[str, Any]]:
    score_by_iso = {item["iso3"]: item for item in ranking}
    ranked_iso = [item["iso3"] for item in sorted(ranking, key=lambda item: (item["rank"], item["iso3"]))]
    top10 = set(ranked_iso[:10])
    top_quartile = set(ranked_iso[: max(1, math.ceil(len(ranked_iso) / 4))])
    definitions = [
        *GROUP_DEFINITIONS,
        {
            "code": "TOP_QUARTILE",
            "label_ru": "Верхний квартиль",
            "label_en": "Top quartile",
            "description_ru": "Страны верхней четверти официального рейтинга текущего года.",
            "description_en": "Countries in the upper quarter of the official current-year ranking.",
            "iso3": top_quartile,
        },
        {
            "code": "TOP10",
            "label_ru": "Топ-10 модели",
            "label_en": "Model top 10",
            "description_ru": "Десять стран с наиболее высокой итоговой оценкой модели.",
            "description_en": "The ten countries with the highest overall model score.",
            "iso3": top10,
        },
    ]
    output: list[dict[str, Any]] = []
    for definition in definitions:
        members = sorted(iso for iso in definition["iso3"] if iso != selected_iso3 and iso in score_by_iso)
        output.append({
            "code": definition["code"],
            "label_ru": definition["label_ru"],
            "label_en": definition["label_en"],
            "description_ru": definition["description_ru"],
            "description_en": definition["description_en"],
            "country_count": len(members),
            "iso3": members,
            "score_mean": _mean(score_by_iso[iso]["score"] for iso in members),
            "score_median": median([float(score_by_iso[iso]["score"]) for iso in members]) if members else None,
            "blocks": {
                block_code: _mean(
                    block_scores[iso][block_code]
                    for iso in members
                    if iso in block_scores and block_code in block_scores[iso]
                )
                for block_code in BLOCK_ORDER
            },
        })
    return output


def _source_cards(conn: sqlite3.Connection, components: list[dict[str, Any]]) -> list[dict[str, Any]]:
    source_ids = sorted({item.get("source_id") for item in components if item.get("source_id")})
    if not source_ids:
        return []
    placeholders = ",".join("?" for _ in source_ids)
    registry = rows(
        conn,
        f"""SELECT source_id,source_name,owner,source_url,url,license_or_terms,license_note,
                   latest_snapshot_id,retrieved_at,release_year,source_role
            FROM source_registry WHERE source_id IN ({placeholders}) ORDER BY source_id""",
        tuple(source_ids),
    )
    by_id = {item["source_id"]: item for item in registry}
    output = []
    for source_id in source_ids:
        public = SOURCE_PUBLIC_META.get(source_id, {})
        source = by_id.get(source_id, {})
        used = [item for item in components if item.get("source_id") == source_id]
        output.append({
            **source,
            "source_id": source_id,
            "name_ru": public.get("name_ru") or source.get("source_name") or source_id,
            "name_en": public.get("name_en") or source.get("source_name") or source_id,
            "source_url": source.get("source_url") or source.get("url"),
            "component_count": len(used),
            "component_refs": sorted({item["component_ref"] for item in used}),
            "oldest_source_year": min((int(item["source_data_year"]) for item in used if item.get("source_data_year") is not None), default=None),
            "newest_source_year": max((int(item["source_data_year"]) for item in used if item.get("source_data_year") is not None), default=None),
        })
    return output


def training_workspace_payload(conn: sqlite3.Connection, iso3: str, requested_year: int) -> dict[str, Any]:
    iso3 = iso3.upper()
    country = row(conn, "SELECT * FROM countries WHERE iso3=?", (iso3,))
    if not country:
        raise KeyError(iso3)
    value_year = _effective_training_year(conn, requested_year, iso3)
    if value_year is None:
        return {
            "available": False,
            "country": country,
            "requested_year": requested_year,
            "value_year": None,
            "title_ru": "Конкурентоспособность системы подготовки технологических кадров",
            "title_en": "Competitiveness of the technology workforce training system",
        }

    score = row(
        conn,
        """SELECT t.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
           FROM training_model_scores t JOIN countries c ON c.iso3=t.iso3
           WHERE t.iso3=? AND t.year=?""",
        (iso3, value_year),
    )
    if not score:
        return {
            "available": False,
            "country": country,
            "requested_year": requested_year,
            "value_year": value_year,
            "title_ru": "Конкурентоспособность системы подготовки технологических кадров",
            "title_en": "Competitiveness of the technology workforce training system",
        }

    provenance = _json(score.get("provenance_json"), {})
    weights = {
        code: float(provenance.get("block_weights", {}).get(code, DEFAULT_BLOCK_WEIGHTS[code]))
        for code in BLOCK_ORDER
    }
    quality_factor = 0.9 + 0.1 * float(score.get("data_quality") or 0)
    available_block_weight = float(score.get("available_block_weight") or 0)

    ranking = rows(
        conn,
        """SELECT t.value_id,t.iso3,t.year,t.score,t.rank,t.percentile,t.data_quality,
                  t.available_block_weight,t.quality_flag,t.source_group_coverage,
                  c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
           FROM training_model_scores t JOIN countries c ON c.iso3=t.iso3
           WHERE t.year=? ORDER BY t.rank,c.name_en""",
        (value_year,),
    )
    selected_components = rows(
        conn,
        """SELECT tm.*,cv.unit,cv.source_url,cv.retrieved_at,cv.raw_snapshot_path,
                  cv.raw_snapshot_sha256,cv.transform_id,cv.transformation_run_id,
                  sr.source_name,sr.owner AS source_owner,sr.license_or_terms
           FROM training_model_components tm
           LEFT JOIN component_values cv ON cv.value_id=tm.source_value_id
           LEFT JOIN source_registry sr ON sr.source_id=tm.source_id
           WHERE tm.iso3=? AND tm.year=?
           ORDER BY CASE tm.block_code
             WHEN 'institutional_environment' THEN 1
             WHEN 'educational_infrastructure' THEN 2
             WHEN 'corporate_strategies' THEN 3
             WHEN 'international_cooperation' THEN 4 ELSE 99 END,
             tm.weight DESC,tm.component_ref""",
        (iso3, value_year),
    )
    all_components = rows(
        conn,
        """SELECT iso3,block_code,component_ref,normalized_score,weight,weighted_contribution
           FROM training_model_components WHERE year=?""",
        (value_year,),
    )
    block_scores = _block_scores(all_components)
    benchmark_groups = _benchmark_groups(ranking, block_scores, iso3)
    benchmark_by_code = {item["code"]: item for item in benchmark_groups}
    group_members = {item["code"]: set(item["iso3"]) for item in benchmark_groups}
    component_benchmarks = _component_benchmarks(all_components, group_members)

    ranking_by_iso = {item["iso3"]: item for item in ranking}
    for item in ranking:
        item["blocks"] = block_scores.get(item["iso3"], {})
        item["source_group_coverage"] = _json(item.get("source_group_coverage"), [])

    source_years: list[int] = []
    blocks: list[dict[str, Any]] = []
    for block_code in BLOCK_ORDER:
        components = [item for item in selected_components if item["block_code"] == block_code]
        if not components:
            continue
        block_weight = weights[block_code]
        component_weight_sum = sum(float(item.get("weight") or 0) for item in components)
        block_score = sum(float(item.get("weighted_contribution") or 0) for item in components) / component_weight_sum
        contribution = (
            block_score * block_weight / available_block_weight * quality_factor
            if available_block_weight > 0 else None
        )
        values = {
            country_code: values[block_code]
            for country_code, values in block_scores.items()
            if block_code in values
        }
        block_rank, block_percentile = _rank(values, iso3)
        ordered = sorted(values.items(), key=lambda item: (-item[1], item[0]))
        top_decile_count = max(1, math.ceil(len(ordered) * 0.10))
        global_values = list(values.values())
        meta = BLOCK_META[block_code]
        for component in components:
            component["data_lag"] = max(0, requested_year - int(component["source_data_year"])) if component.get("source_data_year") else None
            component["benchmarks"] = component_benchmarks.get(component["component_ref"], {})
            values_for_component = {
                item["iso3"]: float(item["normalized_score"])
                for item in all_components
                if item["component_ref"] == component["component_ref"]
            }
            component_rank, component_percentile = _rank(values_for_component, iso3)
            component["rank"] = component_rank
            component["percentile"] = component_percentile
            component["universe_count"] = len(values_for_component)
            component["unit_label_ru"], component["unit_label_en"] = UNIT_LABELS.get(component.get("unit") or "", (component.get("unit") or "", component.get("unit") or ""))
            if component.get("source_data_year") is not None:
                source_years.append(int(component["source_data_year"]))
        strongest = max(components, key=lambda item: float(item["normalized_score"]))
        weakest = min(components, key=lambda item: float(item["normalized_score"]))
        blocks.append({
            "code": block_code,
            **meta,
            "score": block_score,
            "weight": block_weight,
            "available_component_weight": component_weight_sum,
            "component_coverage": min(1.0, component_weight_sum / block_weight) if block_weight else None,
            "contribution": contribution,
            "rank": block_rank,
            "percentile": block_percentile,
            "universe_count": len(values),
            "median": median(global_values),
            "upper_quartile": _percentile(global_values, 0.75),
            "top_decile_mean": _mean(value for _, value in ordered[:top_decile_count]),
            "strongest_component": {
                "component_ref": strongest["component_ref"],
                "name_ru": strongest["component_name_ru"],
                "name_en": strongest["component_name_en"],
                "score": strongest["normalized_score"],
            },
            "weakest_component": {
                "component_ref": weakest["component_ref"],
                "name_ru": weakest["component_name_ru"],
                "name_en": weakest["component_name_en"],
                "score": weakest["normalized_score"],
            },
            "components": components,
        })

    series = rows(
        conn,
        """SELECT value_id,iso3,year,requested_year,score,rank,percentile,data_quality,
                  available_block_weight,source_group_coverage
           FROM training_model_scores WHERE iso3=? ORDER BY year""",
        (iso3,),
    )
    all_series_components = rows(
        conn,
        """SELECT iso3,year,block_code,weight,weighted_contribution
           FROM training_model_components WHERE iso3=? ORDER BY year,block_code""",
        (iso3,),
    )
    series_grouped: dict[int, dict[str, list[dict[str, Any]]]] = defaultdict(lambda: defaultdict(list))
    for item in all_series_components:
        series_grouped[int(item["year"])][item["block_code"]].append(item)
    block_series = []
    for year, year_blocks in sorted(series_grouped.items()):
        payload: dict[str, Any] = {"year": year}
        for block_code, items in year_blocks.items():
            total_weight = sum(float(item["weight"]) for item in items)
            payload[block_code] = sum(float(item["weighted_contribution"]) for item in items) / total_weight if total_weight else None
        block_series.append(payload)

    audit = row(
        conn,
        """SELECT audit_id,model_code,release_year,methodology_version,run_count,countries,
                  mean_spearman,min_spearman,mean_absolute_rank_change,max_rank_change,
                  sensitivity_passed,results_json,created_at
           FROM methodology_audit_runs WHERE model_code='TRAINING_MODEL_V2'
           ORDER BY release_year DESC LIMIT 1""",
    )
    if audit:
        audit["results"] = _json(audit.get("results_json"), {})

    strongest_block = max(blocks, key=lambda item: float(item["score"])) if blocks else None
    weakest_block = min(blocks, key=lambda item: float(item["score"])) if blocks else None
    previous = series[-2] if len(series) >= 2 else None
    first = series[0] if series else None

    return {
        "available": True,
        "schema_version": "training-workspace-v1",
        "title_ru": "Конкурентоспособность системы подготовки технологических кадров",
        "title_en": "Competitiveness of the technology workforce training system",
        "subtitle_ru": "Четырёхблочная модель показывает, насколько национальная система способна формировать, удерживать и превращать технологические компетенции в экономический результат.",
        "subtitle_en": "The four-block model shows how effectively a national system can develop, retain and convert technology skills into economic outcomes.",
        "country": country,
        "requested_year": requested_year,
        "value_year": value_year,
        "score": score,
        "summary": {
            "universe_count": len(ranking),
            "block_count": len(blocks),
            "component_count": len(selected_components),
            "source_count": len({item.get("source_id") for item in selected_components if item.get("source_id")}),
            "oldest_source_year": min(source_years) if source_years else None,
            "newest_source_year": max(source_years) if source_years else None,
            "score_change_1y": float(score["score"]) - float(previous["score"]) if previous else None,
            "rank_change_1y": int(previous["rank"]) - int(score["rank"]) if previous else None,
            "score_change_full_period": float(score["score"]) - float(first["score"]) if first and first["year"] != score["year"] else None,
            "rank_change_full_period": int(first["rank"]) - int(score["rank"]) if first and first["year"] != score["year"] else None,
            "strongest_block": strongest_block,
            "weakest_block": weakest_block,
            "quality_factor": quality_factor,
            "substantive_score_before_quality": float(score["score"]) / quality_factor if quality_factor else None,
        },
        "blocks": blocks,
        "series": series,
        "block_series": block_series,
        "ranking": ranking,
        "benchmark_groups": benchmark_groups,
        "default_benchmark": "TECHNOLOGY_PEERS",
        "sources": _source_cards(conn, selected_components),
        "source_group_coverage": _json(score.get("source_group_coverage"), []),
        "formula": {
            "formula_version": score.get("formula_version") or "training-system-competitiveness-v1",
            "weights": weights,
            "quality_factor": quality_factor,
            "available_block_weight": available_block_weight,
            "minimum_blocks": 3,
            "effective_minimum_weight": 0.70,
            "expression_ru": "взвешенное среднее доступных блоков × (0,9 + 0,1 × качество данных)",
            "expression_en": "weighted mean of available blocks × (0.9 + 0.1 × data quality)",
            "component_rule_ru": "Внутри блока используются доступные компоненты; при покрытии менее 50% блок исключается.",
            "component_rule_en": "Available components are used within a block; the block is excluded when component coverage is below 50%.",
        },
        "audit": audit,
        "methodology_document": "docs/TRAINING_MODEL_METHODOLOGY_V2.md",
        "official_result_notice_ru": "Итоговое место публикуется по официальной рейтинговой вселенной текущего года; размеры сравнительных вселенных отдельных блоков могут отличаться из-за доступности компонентов.",
        "official_result_notice_en": "The overall rank uses the official current-year ranking universe; block-specific comparison universes may differ because component availability varies.",
    }


def _parse_horizon(value: str | None) -> tuple[int | None, int | None]:
    years = [int(item) for item in re.findall(r"20\d{2}", value or "")]
    return (min(years), max(years)) if years else (None, None)


def _split_actors(value: str | None) -> list[str]:
    return [item.strip() for item in re.split(r"[;\n]+", value or "") if item.strip()]


def _policy_strand(item_id: str) -> str:
    return next((code for code, meta in POLICY_STRANDS.items() if item_id in meta["item_ids"]), "measurement")


def _policy_priority(item: dict[str, Any], linked_block: dict[str, Any] | None) -> dict[str, Any]:
    """Return an interpretable diagnostic priority without mixing incompatible units.

    The measurable gap is expressed as a percentage of the benchmark and capped at
    100.  This avoids treating, for example, a gap of several thousand R&D workers
    per million as intrinsically more important than a percentage-point gap.  The
    result is a transparent portfolio triage signal, not an approved policy order.
    """
    relative_gap = 0.0
    benchmark_match = re.search(r"([0-9]+(?:[.,][0-9]+)?)\s*$", item.get("benchmark_ru") or "")
    if benchmark_match and item.get("current_value") is not None:
        target = float(benchmark_match.group(1).replace(",", "."))
        current = float(item["current_value"])
        if target > 0:
            relative_gap = min(100.0, max(0.0, (target - current) / target * 100.0))
    block_pressure = max(0.0, min(100.0, 100.0 - float(linked_block["score"]))) if linked_block else 50.0
    start, end = _parse_horizon(item.get("horizon"))
    duration = max(1, (end or 2030) - (start or 2026) + 1)
    urgency = min(100.0, 100.0 / duration)
    score = relative_gap * 0.45 + block_pressure * 0.45 + urgency * 0.10
    if score >= 52:
        level = "critical"
    elif score >= 38:
        level = "high"
    else:
        level = "structural"
    return {
        "score": score,
        "level": level,
        "relative_gap_percent": relative_gap,
        "block_pressure": block_pressure,
        "horizon_years": duration,
        "basis_ru": "Диагностический приоритет учитывает относительный разрыв до ориентира, слабость связанного блока модели и горизонт меры; это не утверждённая государственная очередность.",
        "basis_en": "The diagnostic priority combines the relative benchmark gap, weakness of the linked model block and measure horizon; it is not an approved government sequence.",
    }


def policy_center_payload(conn: sqlite3.Connection, requested_year: int = 2026) -> dict[str, Any]:
    country = row(conn, "SELECT * FROM countries WHERE iso3='RUS'")
    training = training_workspace_payload(conn, "RUS", requested_year)
    block_by_code = {item["code"]: item for item in training.get("blocks", [])}
    items = rows(conn, "SELECT * FROM policy_brief_items WHERE iso3='RUS' ORDER BY priority")

    qs_score = row(
        conn,
        """SELECT * FROM index_scores WHERE iso3='RUS' AND index_code='QS_ET' AND year<=?
           ORDER BY year DESC LIMIT 1""",
        (requested_year,),
    )
    qs_summary = row(
        conn,
        """SELECT COUNT(*) AS institutions,MIN(rank) AS best_rank,
                  SUM(CASE WHEN rank<=100 THEN 1 ELSE 0 END) AS top100,
                  SUM(CASE WHEN rank<=250 THEN 1 ELSE 0 END) AS top250,
                  SUM(CASE WHEN rank<=500 THEN 1 ELSE 0 END) AS top500
           FROM qs_institution_rankings WHERE iso3='RUS' AND year=?""",
        (qs_score["year"],),
    ) if qs_score else None

    htei = row(
        conn,
        """SELECT p.profile_id AS value_id,p.release_year,p.mode,p.substantive_score AS score,p.rank,
                  p.percentile,p.confidence_score,p.coverage_class,p.oldest_source_year,
                  p.newest_source_year,p.average_lag,
                  (SELECT COUNT(*) FROM htei_v6_profiles u
                   WHERE u.release_year=p.release_year AND u.mode=p.mode AND u.eligible_for_ranking=1) AS universe_count
           FROM htei_v6_profiles p WHERE p.iso3='RUS' AND p.release_year=? AND p.mode='proxy_extended'""",
        (requested_year,),
    )
    if not htei:
        htei = row(
            conn,
            """SELECT p.profile_id AS value_id,p.release_year,p.mode,p.substantive_score AS score,p.rank,
                      p.percentile,p.confidence_score,p.coverage_class,p.oldest_source_year,
                      p.newest_source_year,p.average_lag,
                      (SELECT COUNT(*) FROM htei_v6_profiles u
                       WHERE u.release_year=p.release_year AND u.mode=p.mode AND u.eligible_for_ranking=1) AS universe_count
               FROM htei_v6_profiles p WHERE p.iso3='RUS' AND p.mode='proxy_extended'
               ORDER BY p.release_year DESC LIMIT 1""",
        )

    actor_items_ru: dict[str, set[str]] = defaultdict(set)
    actor_items_en: dict[str, set[str]] = defaultdict(set)
    source_years: list[int] = []
    start_years: list[int] = []
    end_years: list[int] = []
    for item in items:
        item.update(POLICY_EN_OVERRIDES.get(item["item_id"], {}))
        item.update(POLICY_RU_OVERRIDES.get(item["item_id"], {}))
        _public_policy_copy(item)
        strand_code = _policy_strand(item["item_id"])
        block_code = POLICY_BLOCK_LINKS.get(item["item_id"])
        linked_block = block_by_code.get(block_code)
        item["strand_code"] = strand_code
        item["linked_block_code"] = block_code
        item["linked_block"] = {
            "code": linked_block["code"],
            "name_ru": linked_block["name_ru"],
            "name_en": linked_block["name_en"],
            "score": linked_block["score"],
            "rank": linked_block["rank"],
            "universe_count": linked_block["universe_count"],
        } if linked_block else None
        start_year, end_year = _parse_horizon(item.get("horizon"))
        item["start_year"] = start_year
        item["end_year"] = end_year
        if start_year:
            start_years.append(start_year)
        if end_year:
            end_years.append(end_year)
        if item.get("source_data_year"):
            source_years.append(int(item["source_data_year"]))
        item["actors_ru"] = _split_actors(item.get("actor_ru"))
        item["actors_en"] = _split_actors(item.get("actor_en"))
        for actor in item["actors_ru"]:
            actor_items_ru[actor].add(item["item_id"])
        for actor in item["actors_en"]:
            actor_items_en[actor].add(item["item_id"])
        unit_ru, unit_en = UNIT_LABELS.get(item.get("unit") or "", (item.get("unit") or "", item.get("unit") or ""))
        item["unit_label_ru"] = unit_ru
        item["unit_label_en"] = unit_en

        if item["item_id"] == "RUS-SYSTEM-07" and linked_block:
            item.update({
                "current_value": linked_block["score"],
                "unit": "score_0_100",
                "unit_label_ru": UNIT_LABELS["score_0_100"][0],
                "unit_label_en": UNIT_LABELS["score_0_100"][1],
                "source_data_year": training.get("value_year"),
                "source_id": "TRAINING_MODEL",
                "evidence_value_id": training.get("score", {}).get("value_id"),
                "benchmark_ru": f"Верхний квартиль блока: {linked_block['upper_quartile']:.1f}",
                "benchmark_en": f"Block upper quartile: {linked_block['upper_quartile']:.1f}",
                "evidence_note_ru": "Значение получено как оценка блока международного сотрудничества в четырёхблочной модели.",
                "evidence_note_en": "The value is the international-cooperation block score in the four-block model.",
            })
        elif item["item_id"] == "RUS-QS-08" and qs_score:
            item.update({
                "current_value": qs_score["score"],
                "unit": "country_score_0_100",
                "unit_label_ru": UNIT_LABELS["country_score_0_100"][0],
                "unit_label_en": UNIT_LABELS["country_score_0_100"][1],
                "source_data_year": qs_score["source_data_year"],
                "source_id": "QS_ET",
                "evidence_value_id": qs_score["value_id"],
                "benchmark_ru": "Верхний квартиль странового рейтинга QS по инженерным и технологическим направлениям",
                "benchmark_en": "Upper quartile of the QS Engineering & Technology country ranking",
                "evidence_note_ru": "Страновой балл агрегирует позиции российских университетов; карточка также показывает число вузов и лучший ранг.",
                "evidence_note_en": "The country score aggregates Russian university positions; the card also reports institution count and best rank.",
                "evidence_context": qs_summary,
            })
        else:
            item["evidence_note_ru"] = "Наблюдаемое значение связано с воспроизводимым компонентом HTEI."
            item["evidence_note_en"] = "The observed value is linked to a reproducible HTEI component."
        item["evidence_status"] = "linked" if item.get("evidence_value_id") else "system_level"
        item["diagnostic_priority"] = _policy_priority(item, linked_block)

    strands = []
    for code, meta in POLICY_STRANDS.items():
        strand_items = [item for item in items if item["strand_code"] == code]
        linked_block = block_by_code.get(meta["linked_block"])
        strands.append({
            "code": code,
            "name_ru": meta["name_ru"],
            "name_en": meta["name_en"],
            "description_ru": meta["description_ru"],
            "description_en": meta["description_en"],
            "measure_count": len(strand_items),
            "item_ids": [item["item_id"] for item in strand_items],
            "linked_block": {
                "code": linked_block["code"],
                "name_ru": linked_block["name_ru"],
                "name_en": linked_block["name_en"],
                "score": linked_block["score"],
            } if linked_block else None,
        })

    actors = []
    all_actor_keys = sorted(set(actor_items_ru) | set(actor_items_en))
    # Russian and English actor lists are not guaranteed to have identical tokenisation;
    # publish two parallel collections and let the UI choose the current locale.
    actors_ru = [
        {"name": name, "measure_count": len(item_ids), "item_ids": sorted(item_ids)}
        for name, item_ids in actor_items_ru.items()
    ]
    actors_en = [
        {"name": name, "measure_count": len(item_ids), "item_ids": sorted(item_ids)}
        for name, item_ids in actor_items_en.items()
    ]
    actors_ru.sort(key=lambda item: (-item["measure_count"], item["name"]))
    actors_en.sort(key=lambda item: (-item["measure_count"], item["name"]))
    actors = {"ru": actors_ru, "en": actors_en, "combined_keys": all_actor_keys}

    start = min(start_years) if start_years else 2026
    end = max(end_years) if end_years else 2030
    years = list(range(start, end + 1))
    evidence_linked = sum(1 for item in items if item.get("evidence_value_id"))

    return {
        "schema_version": "policy-center-v1",
        "iso3": "RUS",
        "country": country,
        "title_ru": "Национальная программа развития технологических кадров России",
        "title_en": "Russia technology workforce development programme",
        "subtitle_ru": "Восемь взаимосвязанных мер переводят результаты Индекса технологической занятости (HTEI) и модели подготовки кадров в измеримую программу действий на 2026–2030 годы.",
        "subtitle_en": "Eight linked actions translate HTEI and training-system evidence into a measurable programme for 2026–2030.",
        "summary": {
            "measure_count": len(items),
            "strand_count": len(strands),
            "actor_count_ru": len(actors_ru),
            "actor_count_en": len(actors_en),
            "evidence_linked_count": evidence_linked,
            "system_level_count": len(items) - evidence_linked,
            "start_year": start,
            "end_year": end,
            "oldest_evidence_year": min(source_years) if source_years else None,
            "newest_evidence_year": max(source_years) if source_years else None,
            "editorial_statuses": sorted({item.get("editorial_status") for item in items if item.get("editorial_status")}),
        },
        "diagnosis": {
            "training_model": {
                "score": training.get("score", {}).get("score"),
                "rank": training.get("score", {}).get("rank"),
                "percentile": training.get("score", {}).get("percentile"),
                "universe_count": training.get("summary", {}).get("universe_count"),
                "value_id": training.get("score", {}).get("value_id"),
                "strongest_block": training.get("summary", {}).get("strongest_block"),
                "weakest_block": training.get("summary", {}).get("weakest_block"),
            },
            "htei": htei,
            "qs": {**(qs_score or {}), "summary": qs_summary},
        },
        "strands": strands,
        "roadmap": {
            "years": years,
            "items": [
                {
                    "item_id": item["item_id"],
                    "priority": item["priority"],
                    "title_ru": item["title_ru"],
                    "title_en": item["title_en"],
                    "horizon": item["horizon"],
                    "start_year": item["start_year"],
                    "end_year": item["end_year"],
                    "strand_code": item["strand_code"],
                }
                for item in items
            ],
            "notice_ru": "Дорожная карта является аналитической рамкой, выведенной из горизонтов рекомендаций, а не утверждённым государственным планом.",
            "notice_en": "The roadmap is an analytical framework derived from recommendation horizons, not an approved government plan.",
        },
        "actors": actors,
        "items": items,
        "methodology_version": "policy-brief-v2-structured-stage4",
        "updated_at": max((item.get("updated_at") or "" for item in items), default=""),
    }


def training_ranking_csv(payload: dict[str, Any], lang: str = "ru") -> str:
    output = StringIO()
    fieldnames = [
        "rank", "iso3", "country", "score", "percentile", "data_quality",
        *BLOCK_ORDER,
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for item in payload.get("ranking", []):
        writer.writerow({
            "rank": item.get("rank"),
            "iso3": item.get("iso3"),
            "country": item.get("name_ru") if lang == "ru" else item.get("name_en"),
            "score": item.get("score"),
            "percentile": item.get("percentile"),
            "data_quality": item.get("data_quality"),
            **{code: item.get("blocks", {}).get(code) for code in BLOCK_ORDER},
        })
    return output.getvalue()


def policy_items_csv(payload: dict[str, Any], lang: str = "ru") -> str:
    output = StringIO()
    fieldnames = [
        "priority", "item_id", "strand", "linked_block", "title", "problem", "indicator",
        "current_value", "unit", "source_data_year", "source_id", "benchmark", "measure",
        "actors", "horizon", "target_kpi", "expected_effect", "risk", "resources", "monitoring",
        "evidence_value_id",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    strands = {item["code"]: item for item in payload.get("strands", [])}
    for item in payload.get("items", []):
        strand = strands.get(item.get("strand_code"), {})
        writer.writerow({
            "priority": item.get("priority"),
            "item_id": item.get("item_id"),
            "strand": strand.get("name_ru") if lang == "ru" else strand.get("name_en"),
            "linked_block": item.get("linked_block", {}).get("name_ru") if lang == "ru" else item.get("linked_block", {}).get("name_en"),
            "title": item.get("title_ru") if lang == "ru" else item.get("title_en"),
            "problem": item.get("problem_ru") if lang == "ru" else item.get("problem_en"),
            "indicator": item.get("indicator_ru") if lang == "ru" else item.get("indicator_en"),
            "current_value": item.get("current_value"),
            "unit": item.get("unit_label_ru") if lang == "ru" else item.get("unit_label_en"),
            "source_data_year": item.get("source_data_year"),
            "source_id": item.get("source_id"),
            "benchmark": item.get("benchmark_ru") if lang == "ru" else item.get("benchmark_en"),
            "measure": item.get("measure_ru") if lang == "ru" else item.get("measure_en"),
            "actors": item.get("actor_ru") if lang == "ru" else item.get("actor_en"),
            "horizon": item.get("horizon"),
            "target_kpi": item.get("target_kpi_ru") if lang == "ru" else item.get("target_kpi_en"),
            "expected_effect": item.get("expected_effect_ru") if lang == "ru" else item.get("expected_effect_en"),
            "risk": item.get("risk_ru") if lang == "ru" else item.get("risk_en"),
            "resources": item.get("resources_ru") if lang == "ru" else item.get("resources_en"),
            "monitoring": item.get("monitoring_ru") if lang == "ru" else item.get("monitoring_en"),
            "evidence_value_id": item.get("evidence_value_id"),
        })
    return output.getvalue()

# Международная сопоставимость отраслей и профессий HTEI

HTEI v6 различает прямые high-tech/STEM ряды и широкие глобальные прокси. Таблицы `HTEI_INDUSTRY_CROSSWALK_V1.csv` и `HTEI_OCCUPATION_CROSSWALK_V1.csv` являются нормативным приложением к методике.

Eurostat/NACE ряды high-tech manufacturing и high-tech knowledge-intensive services имеют уровень `direct`/`direct_group`. Глобальные ILOSTAT/ISIC section J+M и ISCO major groups 2+3 имеют уровень `broad_proxy`. В интерфейсе и provenance их запрещено называть точной долей высокотехнологичных отраслей или исключительно технологических профессий.

При появлении сопоставимых данных на уровне ISIC/NACE 2-digit и ISCO 2-/3-digit прямые ряды имеют приоритет над широкими прокси при условии достаточной свежести. Версия crosswalk должна храниться вместе с формулой и проходить независимую экспертизу.

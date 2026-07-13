# Контракт интеграции GIR frontend с GIIP final-release-v6

## Неприкосновенные свойства текущего интерфейса

Codex обязан сохранить актуальный GIR-дизайн:

- RU/EN;
- светлую и тёмную темы;
- responsive desktop/tablet/mobile;
- флаги стран;
- интерактивную карту мира;
- анимации, если они не мешают доступности;
- текущую боковую навигацию и визуальные токены;
- исходные формулировки ТЗ МГИМО в русской версии.

Запрещено откатывать frontend на прежний dashboard или заменять текущую дизайн-систему шаблонным AI UI.

## Актуальные индексные модули

```text
HDI
HCI_PLUS
GTCI
GII
IDI
QS_ET
HTEI
```

Исторический `HCI` не является второй основной вкладкой. Он отображается только в ретроспективной части HCI+.

## HCI / HCI+

Endpoint:

```http
GET /api/human-capital/combined/{iso3}
```

Обязательно показать:

- HCI 2010–2020: синяя пунктирная линия, круглые маркеры;
- HCI+ 2026: зелёный ромб;
- предупреждение о методологическом разрыве;
- отсутствие HCI+ как честный pending state до официальной загрузки;
- URL и provenance официального brief после загрузки.

Нельзя соединять HCI и HCI+ одной сплошной линией или называть визуальное масштабирование официальным пересчётом.

## HTEI v6

Endpoints:

```http
GET /api/htei/v6/profile/{iso3}?mode=direct_core
GET /api/htei/v6/profile/{iso3}?mode=common_support
GET /api/htei/v6/profile/{iso3}?mode=proxy_extended
GET /api/htei/v6/profile/{iso3}?mode=asof_diagnostic
GET /api/htei/v6/ranking?mode=common_support&limit=50&offset=0
```

Режимы:

| Mode | Пользовательское назначение |
|---|---|
| `direct_core` | наиболее строгий слой прямых данных |
| `common_support` | основной сопоставимый рейтинг |
| `proxy_extended` | расширенный policy benchmarking с proxy labels |
| `asof_diagnostic` | диагностический профиль без места |

Обязательные поля UI:

- substantive score;
- rank только для ranked modes;
- score/rank interval;
- confidence;
- coverage class;
- freshness class;
- oldest/newest source year;
- фактический год каждого компонента;
- source group;
- proxy status;
- methodology status;
- provenance drawer.

ASOF никогда не должен содержать rank pill, номер места или формулировку «рейтинг 2026».

## Таблицы рейтингов

- серверная пагинация;
- page size 25/50/100;
- поиск;
- сортировка;
- фильтры региона и income group;
- sticky header;
- click по стране → профиль;
- экспорт CSV/XLSX там, где он реализован API;
- отсутствие длинного DOM на 200 строк без виртуализации/пагинации.

## Статусы индексов

Frontend должен различать:

```text
official score
official score + platform diagnostic decomposition
historical official edition
platform-derived country aggregation
author composite index
```

HTEI нельзя маркировать как официальный международный индекс. QS country score нельзя маркировать как официальный страновой рейтинг QS.

## ТЗ МГИМО / Приёмка

Страница содержит ровно четыре пары:

```text
2.1 → 3.1.2
2.2 → 3.2.1
2.3 → 3.3.1
2.4 → 3.4.1
```

Дополнительные требования продукта имеют собственные идентификаторы `DATA-*`, `UX-*`, `QA-*`, `REL-*` и не выдаются за пункты исходного ТЗ.

## Playwright

Каждый изменённый экран проверяется в восьми проектах:

```text
desktop-ru-dark
desktop-ru-light
desktop-en-dark
desktop-en-light
mobile-ru
mobile-en
tablet-ru
tablet-en
```

Visual baselines обновляются только после ручного просмотра каждого нового изображения.

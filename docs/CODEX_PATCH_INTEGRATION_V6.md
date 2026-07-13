# Codex App: интеграция патча GIIP final-release-v6

## Цель

Наложить patch `giip_v06_hci_plus_final_release_patch_003623.zip` на проект `global_index_platform_scientific_candidate_20260711-003623`, сохранить актуальный GIR-дизайн и довести платформу до автоматического статуса `customer_final_release` исключительно на реальных официальных данных.

Codex не имеет права завершить задачу, пока строгий release gate не пройден или пока не зафиксирован объективно недоступный официальный источник с доказательствами предпринятых попыток. Synthetic, seed, demo, generated и placeholder country data запрещены.

## 1. Подготовка ветки

```bash
git status
git checkout -b release/final-v6-hci-plus
git add -A && git commit -m "checkpoint before GIIP final-v6 patch"
```

Сохранить актуальные скриншоты GIR-интерфейса до изменения.

## 2. Проверка архива и применение

```bash
sha256sum giip_v06_hci_plus_final_release_patch_003623.zip
unzip -o giip_v06_hci_plus_final_release_patch_003623.zip -d .
bash APPLY_PATCH.sh
```

Не применять архив к иной базе без отдельного descendant audit. Инсталлятор проверяет `EXTERNAL_AUDIT_MANIFEST.json`.

После применения должны пройти:

```bash
python -m pytest -q
python scripts/validate_no_generated_data.py --strict
python scripts/validate_i18n_labels.py --strict
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
python scripts/validate_final_release_candidate.py
```

## 3. HCI+ 2026

Загрузить только официальные World Bank country briefs:

```bash
python scripts/fetch_hci_plus_2026.py --minimum-countries 150
```

Если структура страницы или PDF изменилась:

1. исследовать официальный HTML/PDF;
2. обновить parser без снижения порога;
3. сохранить HTML/PDF snapshots, URL и SHA-256;
4. добавить regression fixture из официального документа;
5. повторить загрузку;
6. не подменять отсутствующие значения HCI, WDI или вычисленными данными.

HCI+ становится основной актуальной карточкой. HCI 2010–2020 остаётся исторической серией и выводится пунктиром/кругами перед зелёным ромбом HCI+ 2026.

## 4. Национальная статистика

Исследовать и подключить минимум четыре официальные национальные статистические службы четырёх стран. Требования:

```text
HTTPS;
точный official_host;
минимум 20 числовых строк;
минимум 4 страны;
минимум 4 независимых официальных домена;
год, единица, показатель, URL, raw snapshot, SHA-256, provenance;
никаких World Bank/Eurostat mirror как замены национальной службе.
```

Заполнить:

```text
configs/national_statistics_sources.release.json
```

и выполнить:

```bash
python scripts/fetch_national_statistics_metrics.py \
  --config configs/national_statistics_sources.release.json
```

Если API отсутствует, допустим официальный CSV/JSON download. Парсинг PDF разрешён только при наличии устойчивой табличной структуры и автоматических quality checks.

## 5. Корпоративная отчётность

Использовать официальный SEC EDGAR Company Facts:

```bash
export SEC_USER_AGENT='MGIMO GIIP responsible.person@example.org'
python scripts/fetch_sec_corporate_metrics.py
```

Release threshold:

```text
не менее 20 официальных facts;
не менее 5 компаний;
не менее 3 стран;
raw snapshots и SHA-256;
никаких выдуманных tags/values.
```

Если отдельный XBRL tag отсутствует, искать допустимый официальный эквивалент и документировать mapping. Не заполнять пропуск нулём и не создавать estimate.

## 6. Финализация данных

После всех официальных загрузок:

```bash
python scripts/finalize_online_release_v6.py
python scripts/generate_scientific_validation_report.py
python scripts/generate_release_docs.py
```

Проверить:

```bash
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
python scripts/validate_i18n_labels.py --strict
```

## 7. Проверка интерфейса

Сохранить текущую дизайн-систему и выполнить требования `docs/FRONTEND_V6_INTEGRATION_CONTRACT.md`.

```bash
cd playwright
npm ci
npx playwright install
npx playwright test --grep-invert "visual snapshot"
npx playwright test tests/visual.spec.ts --update-snapshots
```

Просмотреть вручную все новые baselines. Проверить:

- RU/EN;
- light/dark;
- desktop/tablet/mobile;
- HCI/HCI+ methodology break;
- HTEI v6 modes;
- ASOF без ranks;
- длинные названия стран;
- missing/pending/error states;
- clickable maps;
- отсутствие horizontal overflow.

После подтверждения:

```bash
npx playwright test
cd ..
python scripts/record_playwright_v6_evidence.py
```

## 8. Финальный gate

```bash
bash scripts/release_gate.sh
```

Definition of done:

```json
{
  "release_ready": true,
  "readiness_level": "customer_final_release",
  "blockers": []
}
```

Только после этого:

1. изменить version `1.0.0-rc6` → `1.0.0`;
2. повторить полный Playwright run и evidence recording;
3. повторить `bash scripts/release_gate.sh`;
4. построить customer package:

```bash
python scripts/build_external_audit_package.py
```

## 9. Запрещено

- снижать coverage thresholds;
- помечать blocker как warning;
- отключать тесты или strict validators;
- использовать старые Playwright evidence;
- создавать фиктивные строки national/corporate/HCI+;
- возвращать HCI вместо HCI+;
- пересматривать веса HTEI, закреплённые утверждённым отчётом по НИР;
- требовать два новых внешних заключения как release blocker;
- откатывать GIR-дизайн.

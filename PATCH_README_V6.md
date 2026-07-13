# GIIP / GIR final-release-v6 patch

## Назначение

Патч переводит сборку `global_index_platform_scientific_candidate_20260711-003623.zip` на научно-методическую и эксплуатационную схему `GIIP-final-release-v6`, сохраняя актуальный GIR-интерфейс.

Он устраняет автоматизируемые замечания внешней рецензии:

- HTEI разделён на Direct Core, Common Support, Proxy Extended и неранжируемый ASOF Diagnostic;
- Common Support использует один и тот же набор компонентов для всех стран;
- confidence/freshness не изменяют содержательный score и rank;
- статистический аудит выполняется непосредственно для формулы HTEI v6;
- HCI+ 2026 становится основным актуальным модулем, исторический HCI остаётся ретроспективной серией;
- восстанавливается воспроизводимость каждого зарегистрированного snapshot;
- русская и английская версии policy brief содержательно разведены;
- матрица приёмки воспроизводит ровно четыре результата исходного ТЗ;
- добавлены customer-facing инструкции и production-hardening;
- прежние Playwright evidence аннулируются и должны быть пересозданы после онлайн-загрузок.

## Применение

Распаковать ZIP-патч в корень целевого проекта с заменой файлов, затем выполнить:

```bash
bash APPLY_PATCH.sh
```

Windows PowerShell:

```powershell
.\APPLY_PATCH.ps1
```

Инсталлятор:

1. проверяет точную базовую сборку;
2. проверяет SHA-256 payload;
3. создаёт резервную копию SQLite;
4. выполняет v5 staging refresh и v6 deterministic finalization;
5. создаёт HTEI v6, HCI+ metadata, bilingual policy brief и reproducibility artifacts;
6. удаляет устаревшие v5 patch/evidence files;
7. перегенерирует документацию;
8. запускает Python/API/формульные/provenance/i18n проверки.

## Что намеренно остаётся Codex App

После офлайн-установки версия остаётся `1.0.0-rc6`. Codex должен получить из официальных интернет-источников:

- HCI+ 2026 минимум для 150 стран;
- не менее 20 числовых строк четырёх национальных статистических служб четырёх стран;
- не менее 20 корпоративных facts пяти компаний трёх стран через SEC EDGAR;
- свежий полный Playwright v6 report и проверенные visual baselines.

После загрузок:

```bash
python scripts/finalize_online_release_v6.py
cd playwright
npm ci
npx playwright install
npx playwright test
cd ..
python scripts/record_playwright_v6_evidence.py
bash scripts/release_gate.sh
```

Финальная сдача разрешена только при:

```json
{
  "release_ready": true,
  "readiness_level": "customer_final_release",
  "blockers": []
}
```

Запрещено снижать пороги, отключать тесты, использовать synthetic/generated/placeholder country data или выдавать исторический HCI за HCI+.

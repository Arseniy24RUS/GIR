import { test, expect } from '@playwright/test';

test('country API has provenance, historical years and as-of indices', async ({ request }) => {
  const res = await request.get('/api/country/RUS/profile?year=2026');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  const codes = json.indices.map((item: any) => item.index_code);
  expect(codes).toEqual(expect.arrayContaining(['HDI', 'HCI_PLUS', 'GTCI', 'GII', 'IDI', 'QS_ET', 'HTEI']));
  const hdi = json.indices.find((item: any) => item.index_code === 'HDI');
  expect(hdi.value_year).toBe(2023);
  expect(hdi.provenance.raw_snapshot_sha256).toHaveLength(64);
  const qs = json.indices.find((item: any) => item.index_code === 'QS_ET');
  expect(qs.available).toBe(true);
  expect(qs.value_year).toBe(2026);
  expect(qs.provenance.source_id).toBe('QS_ET');
  const prov = await request.get(`/api/provenance/value/${hdi.value_id}`);
  expect(prov.ok()).toBeTruthy();
  expect(await prov.json()).toMatchObject({ source_id: 'UNDP_HDR', formula_version: 'official-hdi-timeseries-2025' });
});

test('index APIs expose ranking, components, formulas and sources', async ({ request }) => {
  await expect((await request.get('/api/source-registry')).ok()).toBeTruthy();
  const ranking = await request.get('/api/index/HTEI/ranking?year=2026');
  expect(ranking.ok()).toBeTruthy();
  const rankingJson = await ranking.json();
  expect(rankingJson.value_year).toBeLessThanOrEqual(2026);
  expect(rankingJson.ranking.length).toBeGreaterThan(40);
  const components = await request.get('/api/index/HTEI/components?iso3=RUS&year=2026');
  expect(components.ok()).toBeTruthy();
  expect((await components.json())[0].raw_snapshot_sha256).toHaveLength(64);
  const formula = await request.get('/api/index/HTEI/formula');
  expect(formula.ok()).toBeTruthy();
  expect((await formula.json()).formula_version).toBe('htei-v6-common-support-2026');
});

test('QS refresh and registry expose official endpoint snapshots', async ({ request }) => {
  const refresh = await request.post('/api/refresh/QS_ET');
  expect(refresh.ok()).toBeTruthy();
  const payload = await refresh.json();
  expect(payload.status).toBe('implemented_official_web_endpoint');

  const registry = await request.get('/api/source-registry');
  const qs = (await registry.json()).find((item: any) => item.source_id === 'QS_ET');
  expect(qs.automation_status).toBe('implemented_official_web_endpoint');
  expect(qs.latest_snapshot_id).toContain('QS_ET:2026');

  const ranking = await request.get('/api/index/QS_ET/ranking?year=2025');
  const rankingJson = await ranking.json();
  expect(rankingJson.value_year).toBe(2025);
  expect(rankingJson.ranking.length).toBeGreaterThan(40);
});


test('command center, matrix and training-system model endpoints are release-ready', async ({ request }) => {
  const cc = await request.get('/api/country/RUS/command-center?year=2026');
  expect(cc.ok()).toBeTruthy();
  const ccJson = await cc.json();
  expect(ccJson.quick_levers.length).toBeGreaterThan(0);
  expect(ccJson.tz_summary.ru.join(' ')).toContain('Формирование системы индикаторов для мониторинга развития технологических кадров');

  const matrix = await request.get('/api/cross-matrix?year=2026&q=Russia');
  expect(matrix.ok()).toBeTruthy();
  const matrixJson = await matrix.json();
  expect(matrixJson.countries.length).toBeGreaterThan(0);
  expect(matrixJson.countries[0].indices.HTEI).toBeTruthy();

  const gtci = await request.get('/api/index/GTCI/explainer?country=RUS&year=2026');
  expect(gtci.ok()).toBeTruthy();
  const gtciJson = await gtci.json();
  expect(gtciJson.country_diagnostics.components.length).toBe(6);

  const model = await request.get('/api/htei/model?iso3=RUS&year=2026');
  expect(model.ok()).toBeTruthy();
  const legacyModel = await model.json();
  expect(legacyModel.tz_exact_ru.model).toContain('Разработка модели оценки конкурентоспособности национальных систем подготовки кадров');
  expect(legacyModel.formula_version).toBe('training-system-competitiveness-v1');

  const training = await request.get('/api/training-competitiveness?country=RUS&year=2026');
  expect(training.ok()).toBeTruthy();
  const trainingJson = await training.json();
  expect(trainingJson.blocks.length).toBeGreaterThanOrEqual(3);
  expect(trainingJson.score.rank).toBeGreaterThan(0);

  const trainingRanking = await request.get('/api/training-competitiveness/ranking?year=2026');
  expect(trainingRanking.ok()).toBeTruthy();
  expect((await trainingRanking.json()).ranking.length).toBeGreaterThan(20);
});

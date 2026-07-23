# GIR Scientific Documentation

**Complete methodology for the 44-module index and ranking portfolio, data architecture, calculations, interfaces and assurance procedures**

T24 edition — 20 July 2026

> **Status.** This document describes the implemented full FastAPI edition of GIR. It separates official scores, official multidimensional systems, statistical series, GIR models and derived country aggregations.

## Document status and reading rules

This documentation is both a scientific reference and an operational map of the installed platform. It is not a marketing summary and it does not transfer authorship of official indices to GIR. Every module is documented in terms of construct, unit of observation, edition, scale, direction, official or derived status, formula, uncertainty, provenance, licensing and update procedure.

GIR is deliberately not a single meta-index. The platform preserves incompatible scales and universes, and uses favourable international percentiles only as a navigation device for comparison.

## 1. Executive summary

GIR is an interdisciplinary infrastructure for comparative country analysis. The installed portfolio contains 44 analytical modules organised into eight thematic groups. The local internal offline academic release has numeric releases for all 44 modules and 0 source-gated portfolio modules; source-gated may remain only for secondary dataset layers that require mapping or package registration.

The public user path runs from the landing page to the country profile, country comparison, specialist index workspace, Data Explorer, source observation and provenance. The operator path runs from release discovery through staging, scientific validation, publication and rollback.

## 2. Project scope and original deliverables

The original research task concerns high-technology labour resources and evidence-based recommendations for Russia. GIR preserves four mandatory deliverables: an integrated database, an indicator system including HTEI, a training-system competitiveness model, and practical recommendations. The expanded portfolio supplies institutional, digital, economic, social, environmental and security context without replacing these deliverables.

The unit of analysis may be a country, economy, education system, polity, university, computing system, index component or primary-source row. The unit type is stored explicitly and must be respected by every comparison.

## 3. Methodological ontology

GIR distinguishes five product classes: official composites; official multidimensional systems without an overall score; official statistical series; GIR composite models; and GIR country aggregations of official micro-records. The class determines whether ranking, averaging, time-series construction and cross-index percentiles are legitimate.

An official source value, an official component, a GIR diagnostic transformation and a GIR composite result are different entities. The user interface and provenance layer label them separately.

## 4. Data architecture and lifecycle

Every published value passes through source registration, immutable snapshotting, parsing, harmonisation, transformation or import, scientific gates and publication. Raw files are never silently overwritten. Each derived object receives a stable identifier and is linked to a transformation run.

The Data Lifecycle Center manages 62 sources. Updates are executed in isolated staging copies; the live SQLite database and published file trees change only after integrity, foreign-key, formula, provenance, generated-data and product-loss checks.

## 5. Scale and completeness of the installed build

The installed database contains 238 application tables. The portfolio contains 44 modules across 8 groups, of which 44 have numeric releases and 0 are source-gated at portfolio level. The source registry contains 62 entries and the formula registry contains 43 records.

The number of implemented pages is not the same as the number of installed releases. Source-gated states remain visible for secondary dataset layers and acquisition workflows; portfolio modules in this local internal release have installed numeric data and never expose fabricated observations.

## 6. Sources, licences and distribution rights

Each source record identifies the authority, official URL, release, retrieval date, access mode, update frequency and latest snapshot. The licence registry separately records storage, transformation, raw redistribution, derived-result publication, attribution and evidence location.

A publicly accessible web page is not automatically permission for scraping or redistribution. Restricted sources use authorised packages and explicit rights gates. A raw file may remain private while an authorised derived country layer is published.

## 7. Database structure and identifiers

The common tables indices, index_scores, components and component_values are used only when their data model is appropriate. Complex products such as WGI, V-Dem, university rankings, PISA and environmental panels keep specialised tables rather than being forced into a lossy universal schema.

The central identifiers are source_id, snapshot_id, transformation_id, value_id, formula_version and quality_flag. Together they allow a user-visible cell to be traced back to its source release and processing rule.

## 8. Common computational rules

Min–max normalisation is applied only inside an explicitly defined universe and only when the module methodology permits it. An official score is never overwritten merely to create a common 0–100 display scale.

Weighted aggregation re-normalises weights only in modes whose methodology permits incomplete support. Missing observations are null; source-gated and no-country-data are separate states. Ranking direction is module-specific, and uncertainty is displayed rather than converted into a hidden score penalty.

## 9. Cross-country and cross-index comparison

Raw values remain primary. Cross-module navigation uses a favourable percentile derived from the module-specific rank direction. This permits visual comparison without pretending that PISA points, HDI scores, V-Dem estimates, TOP500 performance and disaster risk share a common physical unit.

Ranks exist only relative to a stated universe. Peer groups, official universes and methodological support sets are distinct. Tied values, rank bands, asynchronous years and methodology breaks are represented explicitly. Spearman correlation is computed only on jointly available observations and is never interpreted as causality.

## 8.1. Min–max normalisation

$$z_{c,i}=100\cdot\frac{x_{c,i}-\min(x_i)}{\max(x_i)-\min(x_i)}$$

For a negatively directed indicator, the numerator is reversed. The comparison universe and the direction are recorded as part of the formula or workspace contract.

## 8.2. Weighted aggregation under partial support

$$S_c=\sum_{i\in A_c}\widetilde{w}_{i,c}z_{c,i},\qquad \widetilde{w}_{i,c}=\frac{w_i}{\sum_{j\in A_c}w_j}$$

Re-normalisation is not a general default. It is enabled only for modes whose definition explicitly permits partial support.

## 8.3. Favourable international percentile

$$P_{c,i}=100\left(1-\frac{r_{c,i}-1}{N_i-1}\right)$$

For inverse scales, only the navigational percentile is reversed. The official score and official ranking semantics remain unchanged.

## 10. Atlas of 44 index and ranking modules

The atlas is the normative entry point to the portfolio methodology. It documents measurement object, product class, release state, formula status, GIR implementation, interpretation limits, source and update path for every module.

### 10.1. Global benchmarks

Cross-cutting benchmarks for human development, human capital, talent, innovation, digital connectivity and technology employment.

#### 10.1.1. Human Development Index (HDI)

**What it measures.** Official UN index combining health, education and living standards.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed (5,940 records in the module's primary storage layer). The primary publisher is UNDP.

**Formula or aggregation.**

$$\mathrm{HDI}=\sqrt[3]{I_{health}\,I_{education}\,I_{income}}$$

**GIR implementation.** The analytical route is `/#index-HDI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The official UNDP HDI is the geometric mean of health, education and income indices using fixed goalposts and a logarithmic income transformation. Platform min-max components are not an official HDI recomputation.

**Updating and reproducibility.** Acquisition uses official downloadable CSV. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://hdr.undp.org/data-center/human-development-index.

#### 10.1.2. Human Capital Index Plus (HCI_PLUS)

**What it measures.** The World Bank's current 2026 human-capital index covering health, education and employment over the working life.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed (158 records in the module's primary storage layer). The primary publisher is World Bank.

**Formula or aggregation.**

$$\mathrm{HCI}^{+}=H+E+L$$

**GIR implementation.** The analytical route is `/#index-HCI_PLUS`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** HCI+ is the current primary edition; historical HCI 2020 is shown separately because of the methodology break.

**Updating and reproducibility.** Acquisition uses official country-brief PDFs. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.worldbank.org/en/publication/human-capital.

#### 10.1.3. Global Talent Competitiveness Index (GTCI)

**What it measures.** Official index of country competitiveness in enabling, attracting, growing and retaining talent.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed (135 records in the module's primary storage layer). The primary publisher is INSEAD / Portulans Institute.

**Formula or aggregation.** Official GTCI 2025 score is extracted from the ranking table; six diagnostic pillars are derived from official pillar ranks in the Rankings by Pillar table.

**GIR implementation.** The analytical route is `/#index-GTCI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The platform does not present transformed pillar ranks as official GTCI component scores.

**Updating and reproducibility.** Acquisition uses official PDF report extraction. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.insead.edu/global-talent-competitiveness-index.

#### 10.1.4. Global Innovation Index (GII)

**What it measures.** Official assessment of innovation ecosystem inputs and outputs.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed (536 records in the module's primary storage layer). The primary publisher is WIPO.

**Formula or aggregation.** Official WIPO GII score and seven pillar scores from the GII 2025 database.

**GIR implementation.** The analytical route is `/#index-GII`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The platform does not recompute the official GII and does not treat equal visual-block weights as the official WIPO formula.

**Updating and reproducibility.** Acquisition uses official downloadable XLSX. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.wipo.int/global_innovation_index/en/.

#### 10.1.5. ICT Development Index (IDI)

**What it measures.** Official ICT development and meaningful connectivity index.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed (503 records in the module's primary storage layer). The primary publisher is ITU.

**Formula or aggregation.** Official ITU IDI score and pillar scores from the IDI 2025 dataset.

**GIR implementation.** The analytical route is `/#index-IDI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The actual IDI year and edition are displayed next to the value.

**Updating and reproducibility.** Acquisition uses official downloadable XLSX. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.itu.int/itu-d/reports/statistics/idi2025/.

#### 10.1.6. High-Tech Employment Index (HTEI)

**What it measures.** High-Tech Employment Index for monitoring technological workforce development, computed from official international data series.

**Product status and installed release.** The module is classified as **GIR composite model**. A numeric release is installed (1,980 records in the module's primary storage layer). The primary publisher is GIR.

**Formula or aggregation.**

$$\mathrm{HTEI}_{c}=\sum_{i\in A_c}\widetilde{w}_{i,c}z_{c,i}$$

**GIR implementation.** The analytical route is `/#index-HTEI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Common Support is the primary comparable ranking; Direct Core identifies direct-data profiles; ASOF profiles are not ranked.

**Updating and reproducibility.** Acquisition uses derived from archived official observations. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: #methodology.

### 10.2. Education and universities

School outcomes, engineering education and the international position of university systems.

#### 10.2.1. PISA School Knowledge (PISA_SKI)

**What it measures.** A transparent mean of official PISA mathematics, reading and science scores. It is not an official OECD composite index.

**Product status and installed release.** The module is classified as **GIR derived aggregation built from official observations**. A numeric release is installed (81 records in the module's primary storage layer). The primary publisher is OECD.

**Formula or aggregation.**

$$\mathrm{PISA\_SKI}_{c}=\frac{M_c+R_c+S_c}{3}$$

**GIR implementation.** The analytical route is `/#index-PISA_SKI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** This is not an official OECD composite. PISA estimates are sample-based for 15-year-old students; statistical uncertainty and sampling cautions must be considered separately.

**Updating and reproducibility.** Acquisition uses official public database, downloadable tables and SDMX API. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.oecd.org/en/about/programmes/pisa.html.

#### 10.2.2. QS Engineering & Technology (QS_ET)

**What it measures.** Country aggregation of QS Engineering & Technology ranking from archived official endpoint rows.

**Product status and installed release.** The module is classified as **GIR derived aggregation built from official observations**. A numeric release is installed (2,185 records in the module's primary storage layer). The primary publisher is QS.

**Formula or aggregation.**

$$\mathrm{QS\_GIR}_{c}=\sum_{k=1}^{K}w_k z_{c,k}$$

**GIR implementation.** The analytical route is `/#index-QS_ET`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** QS does not publish an official Engineering & Technology country ranking. The country score is a reproducible platform aggregation.

**Updating and reproducibility.** Acquisition uses official public JSON endpoint archive. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.topuniversities.com/subject-rankings/engineering-technology.

#### 10.2.3. THE Engineering (THE_ENG)

**What it measures.** A transparent GIR country aggregation of official THE Engineering institution results. It is not an official Times Higher Education country ranking.

**Product status and installed release.** The module is classified as **GIR derived aggregation built from official observations**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is Times Higher Education.

**Formula or aggregation.**

$$\mathrm{THE\_ENG}_{c}=0.25(RI_c+BR_c+MR_c+PP_c)$$

**GIR implementation.** The analytical route is `/#index-THE_ENG`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Not an official THE country ranking. No numerical values are published until an authorised official export has been loaded.

**Updating and reproducibility.** Acquisition uses authorised official CSV/XLSX export supplied by the user; automated website extraction disabled. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.timeshighereducation.com/world-university-rankings/2026/subject-ranking/engineering.

#### 10.2.4. ARWU Research Universities (ARWU)

**What it measures.** A transparent GIR country aggregation of the published ARWU institution ranking. It is not an official ShanghaiRanking country ranking.

**Product status and installed release.** The module is classified as **GIR derived aggregation built from official observations**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is ShanghaiRanking.

**Formula or aggregation.**

$$\mathrm{ARWU\_GIR}_{c}=0.25(RI_c+ED_c+BR_c+MR_c)$$

**GIR implementation.** The analytical route is `/#index-ARWU`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Not an official ShanghaiRanking country ranking. Numerical results are published only after a complete authorised ARWU export is loaded.

**Updating and reproducibility.** Acquisition uses user-supplied official Excel/CSV download, licensed ARWU Tracker export, or written-permission export; automated website extraction disabled. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.shanghairanking.com/rankings/arwu/2025.

### 10.3. Government and institutions

Governance quality, rule of law, corruption risks, press freedom and democracy.

#### 10.3.1. Corruption Perceptions Index (CPI)

**What it measures.** Perceived public-sector corruption as synthesised from expert and business assessments.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed (2,494 records in the module's primary storage layer). The primary publisher is Transparency International.

**Formula or aggregation.**

$$\mathrm{CPI}_{c}=\frac{1}{m_c}\sum_{s=1}^{m_c}z_{c,s}$$

**GIR implementation.** The analytical route is `/#index-CPI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** CPI is a perception-based measure rather than a direct count of corruption events. Small score changes should be interpreted in the context of source coverage and uncertainty.

**Updating and reproducibility.** Acquisition uses official_open_download. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.transparency.org/en/cpi.

#### 10.3.2. World Press Freedom Index (WPFI)

**What it measures.** The conditions under which journalists and media organisations can operate independently, safely and pluralistically.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed (900 records in the module's primary storage layer). The primary publisher is Reporters Without Borders.

**Formula or aggregation.** The module does not invent an undocumented overall formula. Published dimensions or statistical series are preserved separately until an authorised release and methodology contract are available.

**GIR implementation.** The analytical route is `/#index-WPFI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The official score and rank have a lower-is-better orientation in several releases. GIR retains the published direction and only reverses a separate favourable percentile for cross-module navigation.

**Updating and reproducibility.** Acquisition uses official_export_with_operator_authorisation. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://rsf.org/en/index.

#### 10.3.3. WJP Rule of Law Index (ROLI)

**What it measures.** The rule of law through constraints on government powers, absence of corruption, open government, fundamental rights, order and security, regulatory enforcement, civil justice and criminal justice.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed (1,484 records in the module's primary storage layer). The primary publisher is World Justice Project.

**Formula or aggregation.**

$$\mathrm{ROLI}_{c}=\frac{1}{8}\sum_{f=1}^{8}F_{c,f}$$

**GIR implementation.** The analytical route is `/#index-ROLI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Survey-based estimates and changes in country coverage mean that adjacent ranks should not be over-interpreted as exact distances.

**Updating and reproducibility.** Acquisition uses official_export_with_operator_authorisation. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://worldjusticeproject.org/rule-of-law-index.

#### 10.3.4. Worldwide Governance Indicators (WGI)

**What it measures.** Six official World Bank governance dimensions. WGI publishes no overall score or overall rank; GIR preserves each dimension separately, its uncertainty and the published source values.

**Product status and installed release.** The module is classified as **official multidimensional system or indicator family**. A numeric release is installed (32,403 records in the module's primary storage layer). The primary publisher is World Bank.

**Formula or aggregation.** WGI publishes six separate dimensions estimated with the revised unobserved-components model. GIR imports the official standardized estimate, absolute 0–100 score, standard errors, 90% intervals and available source means. No overall WGI score or cross-dimension weighting scheme is constructed.

**GIR implementation.** The analytical route is `/#index-WGI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** WGI are perception-based. Small differences must be interpreted with 90% confidence intervals; GIR-derived ranks are not an official World Bank ranking.

**Updating and reproducibility.** Acquisition uses official downloadable XLSX with source-by-dimension means. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.worldbank.org/en/publication/worldwide-governance-indicators.

#### 10.3.5. V-Dem Democracy Indices (VDEM)

**What it measures.** Five official V-Dem high-level democracy indices: electoral, liberal, participatory, deliberative and egalitarian. GIR preserves them separately with published uncertainty and constructs no overall average.

**Product status and installed release.** The module is classified as **official multidimensional system or indicator family**. A numeric release is installed (118,338 records in the module's primary storage layer). The primary publisher is V-Dem Institute.

**Formula or aggregation.** V-Dem publishes five separate high-level democracy indices. GIR imports each official score, lower and upper coding-uncertainty bounds, and standard deviation. No cross-index average or overall democracy rank is calculated.

**GIR implementation.** The analytical route is `/#index-VDEM`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** V-Dem scores are measurement-model estimates with uncertainty. GIR-derived ranks are not an official V-Dem ranking; dataset releases should not be mechanically spliced into one series.

**Updating and reproducibility.** Acquisition uses versioned CC BY-SA 4.0 RDA subset with deterministic GIR canonical CSV. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.v-dem.net/data/the-v-dem-dataset/.

### 10.4. Digitalisation, AI and compute

Network readiness, digital government, cybersecurity, AI preparedness, Internet quality and computing infrastructure.

#### 10.4.1. Network Readiness Index (NRI)

**What it measures.** Official international index of economies' readiness to use networked and digital technologies across Technology, People, Governance and Impact.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed (127 records in the module's primary storage layer). The primary publisher is Portulans Institute.

**Formula or aggregation.**

$$\mathrm{NRI}_{c}=\frac{T_c+P_c+G_c+I_c}{4}$$

**GIR implementation.** The analytical route is `/#index-NRI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The NRI 2025 edition was published on 4 February 2026. Underlying indicators use different observation years; year-to-year changes should be read with annual renormalization and data-composition changes in mind.

**Updating and reproducibility.** Acquisition uses official downloadable PDF. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://networkreadinessindex.org/.

#### 10.4.2. E-Government Development Index (EGDI)

**What it measures.** Official assessment of all 193 UN Member States' readiness, capacity and progress in using digital government to provide public services.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed (193 records in the module's primary storage layer). The primary publisher is United Nations.

**Formula or aggregation.**

$$\mathrm{EGDI}_{c}=\frac{OSI_c+TII_c+HCI_c}{3}$$

**GIR implementation.** The analytical route is `/#index-EGDI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** EGDI 2024 is a biennial edition. Components use official cross-country standardization and normalization; HCI source years vary, and TII data were obtained from ITU on 14 February 2024. Longitudinal comparison must account for methodology changes, including the new TII affordability component and HCI e-government literacy.

**Updating and reproducibility.** Acquisition uses official downloadable PDF and data center. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://publicadministration.un.org/egovkb/en-us/About/Overview/-E-Government-Development-Index.

#### 10.4.3. ITU Global Cybersecurity Index (GCI)

**What it measures.** National cybersecurity commitment across legal, technical, organisational, capacity-development and cooperation pillars.

**Product status and installed release.** The module is classified as **official_score**. A numeric release is installed (194 records in the module's primary storage layer). The primary publisher is ITU.

**Formula or aggregation.** GCI = LS + TS + OS + CDS + CS, where each official pillar is scored 0–20 and the total is 0–100. Each country is assigned to one of five official tiers from its overall score.

**GIR implementation.** The analytical route is `/#index-GCI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** GCI 2024 groups countries into five tiers and publishes no country ranks. A GIR score-sorted position is not an official ITU ranking. The methodology changed from the 2021 edition, so direct score comparisons require caution.

**Updating and reproducibility.** Acquisition uses official report plus public machine-readable Data360 mirror of the ITU dataset. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.itu.int/epublications/publication/global-cybersecurity-index-2024.

#### 10.4.4. Government AI Readiness Index (GARI)

**What it measures.** Government readiness to use artificial intelligence responsibly and effectively across government, technology sector, and data and infrastructure capacities.

**Product status and installed release.** The module is classified as **gir_recomputed_from_official_rounded_pillars**. A numeric release is installed (195 records in the module's primary storage layer). The primary publisher is Oxford Insights.

**Formula or aggregation.**

$$\mathrm{GARI}^{*}_{c}=0.10PC_c+0.25INFRA_c+0.15GOV_c+0.15PSA_c+0.25DEV_c+0.10RES_c$$

**GIR implementation.** The analytical route is `/#index-GARI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The corrected January 2026 report supersedes the December version with incorrect scores and rankings. Rank and pillars are official; the GIR overall score is recomputed from rounded pillars.

**Updating and reproducibility.** Acquisition uses official corrected PDF report and methodology. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://oxfordinsights.com/ai-readiness/ai-readiness-index/.

#### 10.4.5. IMF AI Preparedness Index (AIPI)

**What it measures.** Preparedness to adopt and benefit from artificial intelligence through digital infrastructure, innovation and economic integration, labour-market policies, and regulation and ethics.

**Product status and installed release.** The module is classified as **official_score_where_complete_no_official_rank**. A numeric release is installed (174 records in the module's primary storage layer). The primary publisher is IMF.

**Formula or aggregation.**

$$\mathrm{AIPI}_{c}=\frac{DI_c+IE_c+LMP_c+RE_c}{4}$$

**GIR implementation.** The analytical route is `/#index-AIPI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** AIPI is an indicative measure and IMF documentation says it should not be used for ranking purposes. GIR score order is navigation only. Nine economies lack an overall score because a component is unavailable; GIR does not impute it.

**Updating and reproducibility.** Acquisition uses IMF dataset delivered as a public World Bank Data360 CSV. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.imf.org/external/datamapper/AI_PI@AIPI/.

#### 10.4.6. Cloudflare Internet Quality Index (CF_IQI)

**What it measures.** Observed Internet quality, including speed, latency, consistency and related network-performance measurements.

**Product status and installed release.** The module is classified as **official multidimensional system or indicator family**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is Cloudflare Radar.

**Formula or aggregation.** No composite is calculated: p25, p50 and p75 are stored separately for BANDWIDTH, LATENCY and DNS.

**GIR implementation.** The analytical route is `/#index-CF_IQI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** IQI is not a single country ranking. The official API requires a token and data is licensed CC BY-NC 4.0. The Stage 12 public frontend defaults to a measurement-free source gate; observational mode activates only after an authorised local fetch.

**Updating and reproducibility.** Acquisition uses official REST API; free Cloudflare API token with Account > Radar > Read required. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://radar.cloudflare.com/quality.

#### 10.4.7. TOP500 Country Aggregation (TOP500)

**What it measures.** National presence and performance in the TOP500 and Green500 lists of high-performance computing systems.

**Product status and installed release.** The module is classified as **GIR derived aggregation built from official observations**. A numeric release is installed (500 records in the module's primary storage layer). The primary publisher is TOP500.

**Formula or aggregation.** There is no single score. A country profile is a vector of independent aggregates: ΣRmax, system count, ΣRpeak, world Rmax share, cores and Green500 metrics.

**GIR implementation.** The analytical route is `/#index-TOP500`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** TOP500 ranks systems, not countries. Every country order in GIR is derived and depends on the selected metric.

**Updating and reproducibility.** Acquisition uses official downloadable XLSX. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.top500.org/statistics/list/.

### 10.5. Economy and finance

Productive capacities, business conditions, economic complexity, globalisation, financial development and inclusion.

#### 10.5.1. UNCTAD Productive Capacities Index (UNCTAD_PCI)

**What it measures.** Official multidimensional index of productive capacity across eight categories.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is UNCTAD.

**Formula or aggregation.** The official PCI overall value and categories are imported from the UNCTAD release; GIR does not recompute the official index.

**GIR implementation.** The analytical route is `/#index-UNCTAD_PCI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Categories and the overall score retain the official scale. GIR ranks and percentiles are explicitly labelled derived views.

**Updating and reproducibility.** Acquisition uses official downloadable CSV. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://unctadstat.unctad.org/datacentre/reportInfo/US.PCI.

#### 10.5.2. Business Ready (BREADY)

**What it measures.** Official multidimensional business-environment assessment across ten topics and three pillars; no official aggregate economy score exists.

**Product status and installed release.** The module is classified as **official multidimensional benchmark**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is World Bank.

**Formula or aggregation.** Official topic and pillar scores are imported separately; no formula for a single aggregate economy score exists.

**GIR implementation.** The analytical route is `/#index-BREADY`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** GIR keeps the ten topics and three pillars separate and creates no synthetic aggregate index.

**Updating and reproducibility.** Acquisition uses official downloadable release bundle. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.worldbank.org/en/businessready.

#### 10.5.3. Economic Complexity Index (ECI)

**What it measures.** Official measure of export-basket complexity; GIR derives only explicitly labelled ranking views.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is Harvard Growth Lab.

**Formula or aggregation.** The official Economic Complexity Index value is imported from the Atlas of Economic Complexity.

**GIR implementation.** The analytical route is `/#index-ECI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The Hausmann–Hidalgo method is documented from the source; GIR does not reconstruct ECI from the trade matrix in this module.

**Updating and reproducibility.** Acquisition uses official GraphQL API or official data snapshot. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://atlas.hks.harvard.edu/rankings.

#### 10.5.4. KOF Globalisation Index (KOF_GLOBAL)

**What it measures.** Official index of economic, social and political globalisation with de-facto and de-jure dimensions.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is KOF Swiss Economic Institute.

**Formula or aggregation.** Official overall, dimensional and de-facto/de-jure values are imported from the KOF release.

**GIR implementation.** The analytical route is `/#index-KOF_GLOBAL`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Published overall and component values are used directly; GIR does not replace the official weighting system.

**Updating and reproducibility.** Acquisition uses official downloadable workbook. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://kof.ethz.ch/en/forecasts-and-indicators/indicators/kof-globalisation-index.html.

#### 10.5.5. IMF Financial Development Index (IMF_FDI)

**What it measures.** Official nine-index system covering the depth, access and efficiency of financial institutions and markets.

**Product status and installed release.** The module is classified as **official index**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is IMF.

**Formula or aggregation.** The nine official IMF indices are imported as separate series; GIR creates no additional synthetic aggregate.

**GIR implementation.** The analytical route is `/#index-IMF_FDI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Financial-institutions and financial-markets indices and their depth, access and efficiency dimensions remain separate; GIR adds no hidden aggregate.

**Updating and reproducibility.** Acquisition uses official SDMX API or official data export. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.imf.org/external/datamapper/FDI@FDI/.

#### 10.5.6. Global Findex (GLOBAL_FINDEX)

**What it measures.** Multidimensional database of digital and financial inclusion indicators; GIR creates no synthetic overall index.

**Product status and installed release.** The module is classified as **official multidimensional system or indicator family**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is World Bank.

**Formula or aggregation.** Official Global Findex indicators are imported individually; no aggregate-index formula exists.

**GIR implementation.** The analytical route is `/#index-GLOBAL_FINDEX`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Financial and digital inclusion indicators are analysed in their native units; GIR does not average them into one score.

**Updating and reproducibility.** Acquisition uses official downloadable CSV/XLSX. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.worldbank.org/en/publication/globalfindex.

### 10.6. Society and human development

Social progress, sustainable development, well-being, gender gaps and health-service coverage.

#### 10.6.1. Social Progress Index (SPI)

**What it measures.** Social outcomes independent of economic inputs, organised around basic human needs, foundations of well-being and opportunity.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is Social Progress Imperative.

**Formula or aggregation.** The module does not invent an undocumented overall formula. Published dimensions or statistical series are preserved separately until an authorised release and methodology contract are available.

**GIR implementation.** The analytical route is `/#index-SPI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The local internal offline academic release includes numeric observations. GIR retains the official hierarchy and will not substitute zeroes for missing country values.

**Updating and reproducibility.** Acquisition uses premium_authorized_export. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.socialprogress.org/social-progress-index.

#### 10.6.2. SDG Index (SDG)

**What it measures.** Progress toward the 17 Sustainable Development Goals through the official SDG Index framework.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is Sustainable Development Solutions Network.

**Formula or aggregation.** The module does not invent an undocumented overall formula. Published dimensions or statistical series are preserved separately until an authorised release and methodology contract are available.

**GIR implementation.** The analytical route is `/#index-SDG`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Goal-level aggregation and spillover treatment follow the published methodology. A composite result does not imply equal policy substitutability among goals.

**Updating and reproducibility.** Acquisition uses source-specific official channel. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://dashboards.sdgindex.org/.

#### 10.6.3. World Happiness Report (WHR)

**What it measures.** Self-reported life evaluation, commonly represented by the Cantril ladder and multi-year averages.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is Wellbeing Research Centre.

**Formula or aggregation.** The module does not invent an undocumented overall formula. Published dimensions or statistical series are preserved separately until an authorised release and methodology contract are available.

**GIR implementation.** The analytical route is `/#index-WHR`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The published happiness ranking is not a direct measure of mental health, affect or policy effectiveness. Confidence intervals and survey coverage matter.

**Updating and reproducibility.** Acquisition uses official_free_download. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://worldhappiness.report/.

#### 10.6.4. Global Gender Gap Index (GGGI)

**What it measures.** Relative gender gaps in economic participation, education, health and political empowerment.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is World Economic Forum.

**Formula or aggregation.** The module does not invent an undocumented overall formula. Published dimensions or statistical series are preserved separately until an authorised release and methodology contract are available.

**GIR implementation.** The analytical route is `/#index-GGGI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The index measures gaps rather than absolute development levels. A high score does not imply that outcomes are high for women and men in absolute terms.

**Updating and reproducibility.** Acquisition uses official_dashboard_or_authorized_export. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.weforum.org/publications/global-gender-gap-report-2025/.

#### 10.6.5. WHO UHC Service Coverage Index (UHC_SCI)

**What it measures.** Coverage of essential health services through tracer indicators of reproductive, maternal, newborn and child health, infectious diseases, non-communicable diseases, and service capacity.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is WHO.

**Formula or aggregation.**

$$\mathrm{UHC\_SCI}_{c}=\left(\prod_{i=1}^{14}x_{c,i}\right)^{1/14}$$

**GIR implementation.** The analytical route is `/#index-UHC_SCI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The index concerns service coverage, not financial protection or the full quality of care. Missing tracers and revisions must be documented.

**Updating and reproducibility.** Acquisition uses source-specific official channel. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.who.int/data/gho/data/themes/topics/service-coverage.

### 10.7. Environment and resilience

Environmental performance, climate vulnerability, energy transition and disaster risk.

#### 10.7.1. Environmental Performance Index (EPI)

**What it measures.** Environmental health, ecosystem vitality and climate-related policy outcomes through a hierarchical official framework.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed (11,151 records in the module's primary storage layer). The primary publisher is Yale / Columbia.

**Formula or aggregation.** The module does not invent an undocumented overall formula. Published dimensions or statistical series are preserved separately until an authorised release and methodology contract are available.

**GIR implementation.** The analytical route is `/#index-EPI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Cross-edition comparisons require care because indicators, targets and weights may change. GIR uses the official ten-year change measure rather than splicing incompatible editions.

**Updating and reproducibility.** Acquisition uses official downloadable XLSX; immutable bundled snapshot. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://epi.yale.edu/.

#### 10.7.2. ND-GAIN Country Index (ND_GAIN)

**What it measures.** Climate vulnerability and readiness to improve resilience through economic, governance and social capacity.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed (4,995 records in the module's primary storage layer). The primary publisher is University of Notre Dame.

**Formula or aggregation.**

$$\mathrm{NDGAIN}_{c}=R_c-V_c$$

**GIR implementation.** The analytical route is `/#index-ND_GAIN`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The historical 1995–2021 panel and the current release are kept as separate editions until comparability is explicitly validated.

**Updating and reproducibility.** Acquisition uses official downloadable archive; bundled technical report; deterministic importer. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://gain.nd.edu/our-work/country-index/.

#### 10.7.3. Energy Transition Index (ETI)

**What it measures.** Energy-system performance and readiness for a secure, sustainable and equitable transition.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed (360 records in the module's primary storage layer). The primary publisher is World Economic Forum / Accenture.

**Formula or aggregation.**

$$\mathrm{ETI}_{c}=0.60SP_c+0.40TR_c$$

**GIR implementation.** The analytical route is `/#index-ETI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The index does not predict transition speed. Its two main dimensions and underlying indicators should be examined separately.

**Updating and reproducibility.** Acquisition uses exact official headline table with checksums; authorised detailed-export importer. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.weforum.org/publications/energy-transition-index-2026/.

#### 10.7.4. WorldRiskIndex (WORLD_RISK_INDEX)

**What it measures.** Structural disaster risk as the geometric interaction of exposure and vulnerability, with vulnerability decomposed into susceptibility and deficits in coping and adaptive capacity.

**Product status and installed release.** The module is classified as **official international product**. A numeric release is installed (5,018 records in the module's primary storage layer). The primary publisher is Bündnis Entwicklung Hilft / IFHV.

**Formula or aggregation.**

$$W_c=\sqrt{E_cV_c},\qquad V_c=\sqrt[3]{S_cC_cA_c}$$

**GIR implementation.** The analytical route is `/#index-WORLD_RISK_INDEX`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** A higher official value means higher risk. GIR reverses only the favourable percentile used for navigation, never the official score.

**Updating and reproducibility.** Acquisition uses official checksummed XLSX/CSV files; immutable bundled snapshot. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://weltrisikobericht.de/worldriskreport/.

### 10.8. Security and international connectedness

Peace, militarisation, organised crime, military spending, global flows, logistics and liner-shipping connectivity.

#### 10.8.1. Global Peace Index (GPI)

**What it measures.** Official country ranking of peacefulness. A lower score means a more peaceful country.

**Product status and installed release.** The module is classified as **official**. A numeric release is installed (163 records in the module's primary storage layer). The primary publisher is Institute for Economics & Peace.

**Formula or aggregation.**

$$\mathrm{GPI}_{c}=\sum_{i=1}^{23}w_i x_{c,i}$$

**GIR implementation.** The analytical route is `/#index-GPI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** GIR does not recompute GPI; published IEP scores and ranks are displayed.

**Updating and reproducibility.** Acquisition uses official_pdf_report_with_verified_country_table_extract. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.visionofhumanity.org/maps/.

#### 10.8.2. Global Militarisation Index (GMI)

**What it measures.** Published GMI composite: a higher value means greater relative weight of the military apparatus in society. The active numeric layer comes from an explicitly labelled secondary snapshot.

**Product status and installed release.** The module is classified as **official value secondary snapshot**. A numeric release is installed (149 records in the module's primary storage layer). The primary publisher is BICC.

**Formula or aggregation.** Official BICC weighted composite of six indicators in three categories; GIR does not recompute it.

**GIR implementation.** The analytical route is `/#index-GMI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Do not treat the 2022 numeric release as GMI 2025 or infer ties from rounded scores.

**Updating and reproducibility.** Acquisition uses official_metadata_methodology_and_ranking_reference. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://gmi.bicc.de/.

#### 10.8.3. Global Organized Crime Index (GOCI)

**What it measures.** Two separate axes: criminality (higher is worse) and resilience to organized crime (higher is better). GIR's central table stores the official criminality score; the GIR rank is derived.

**Product status and installed release.** The module is classified as **official score derived rank**. A numeric release is installed (579 records in the module's primary storage layer). The primary publisher is Global Initiative Against Transnational Organized Crime.

**Formula or aggregation.** Criminality is the mean of markets and actors; markets, actors and resilience are simple means of their available official indicators. Criminality and resilience are not combined.

**GIR implementation.** The analytical route is `/#index-GOCI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Do not combine criminality and resilience into a synthetic score. Overall criminality in 2021 and 2023 is not directly comparable because the model expanded.

**Updating and reproducibility.** Acquisition uses official_open_data_excel_workbook. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://ocindex.net/.

#### 10.8.4. SIPRI Military Expenditure (SIPRI_MILEX)

**What it measures.** Comparable military-expenditure time series; a resource-input measure, not a direct military-capability index.

**Product status and installed release.** The module is classified as **official multidimensional system or indicator family**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is SIPRI.

**Formula or aggregation.** GIR preserves official SIPRI series; no composite index is created.

**GIR implementation.** The analytical route is `/#index-SIPRI_MILEX`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Military expenditure measures resource input, not military capability.

**Updating and reproducibility.** Acquisition uses metadata_only_until_operator_authorized_local_import. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.sipri.org/databases/milex.

#### 10.8.5. DHL Global Connectedness Index (DHL_GCI)

**What it measures.** A country's international connectedness across the depth and geographic breadth of trade, capital, information and people flows.

**Product status and installed release.** The module is classified as **official**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is DHL / NYU Stern.

**Formula or aggregation.**

$$\mathrm{GCI}_{c}=0.5\,Depth_c+0.5\,Breadth_c$$

**GIR implementation.** The analytical route is `/#index-DHL_GCI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Do not compare normalized scores from different report editions as one time series.

**Updating and reproducibility.** Acquisition uses metadata_only_until_operator_authorized_local_import. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://www.dhl.com/global-en/microsites/core/global-connectedness/report.html.

#### 10.8.6. World Bank Logistics Performance Indicators (WORLD_BANK_LPI)

**What it measures.** Two distinct logistics products: the historical survey-based LPI and the newer operational LPI 2.0 indicator family.

**Product status and installed release.** The module is classified as **official multidimensional system or indicator family**. A numeric release is installed (12,327 records in the module's primary storage layer). The primary publisher is World Bank.

**Formula or aggregation.** The module does not invent an undocumented overall formula. Published dimensions or statistical series are preserved separately until an authorised release and methodology contract are available.

**GIR implementation.** The analytical route is `/#index-WORLD_BANK_LPI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** The two generations are not one continuous series. LPI 2.0 is a family of operational indicators and has no invented overall GIR score.

**Updating and reproducibility.** Acquisition uses official_open_data_csv_snapshots. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://lpi.worldbank.org/.

#### 10.8.7. UNCTAD Liner Shipping Connectivity Index (UNCTAD_LSCI)

**What it measures.** Quarterly measure of an economy's integration into global container liner-shipping networks.

**Product status and installed release.** The module is classified as **official score; GIR-derived rank, percentile and changes**. A numeric release is installed for the local internal offline academic release. Raw/source files remain local and every displayed value remains provenance-linked; the interface never substitutes zeros or demonstration values. The primary publisher is UN Trade and Development.

**Formula or aggregation.** The official LSCI score is imported without recomputation; rank and changes are GIR-derived.

**GIR implementation.** The analytical route is `/#index-UNCTAD_LSCI`. Original units remain visible. A favourable percentile may be calculated for navigation when the construct has a defensible direction; this percentile never replaces the official value. The module stores source, edition, actual data year, quality status and value-level provenance.

**Interpretation limits.** Do not mix with the pre-revision scale or port-level PLSCI.

**Updating and reproducibility.** Acquisition uses official_open_bulk_csv_local_verified_import. The Data Lifecycle Center stages the release, validates structure and coverage, runs the source-specific importer, compares product and row deltas, and publishes only after scientific and technical gates. Official reference: https://unctadstat.unctad.org/insights/theme/111.

## 11. HTEI v6 — High-Tech Employment Index

HTEI is a GIR composite designed to diagnose the scale, structure and output environment of high-technology employment. It distinguishes direct-core, common-support, proxy-extended and latest-as-of diagnostic modes. These modes have different support universes and must not be merged into one ranking.

The score is the weighted sum of available normalised components under mode-specific support rules. Confidence, coverage, actual component years and score/rank intervals are separate evidence dimensions; they do not secretly alter the substantive score.

## 12. Training-system competitiveness model

The model evaluates institutional environment, educational infrastructure, corporate strategies and international cooperation. Its official GIR result is reproducible from four blocks and is connected to policy recommendations, actors, indicators and implementation horizons.

A deterministic sensitivity exercise varies block weights to show whether the country conclusion is robust. It is a diagnostic test rather than an alternative official ranking.

## 13. Country Portfolio v3

The country workspace summarises all 44 modules through eight thematic dimensions without creating a meta-index. It distinguishes published values, source-gated modules and releases with no observation for the selected country.

International positions are compared through favourable percentiles while raw values and units remain primary. Freshness, methodology breaks, strengths, attention areas, evidence gaps and Russia-specific recommendations are presented as separate layers.

## 14. Country comparison v2

The comparison workspace supports up to eight selected countries, portfolio matrices, international distributions, scatterplots, rank correlations, time series and data-quality views. URL state makes the analytical selection reproducible.

Thematic medians are descriptive navigation summaries only. The workspace explicitly states that GIR does not create a single ranking from the 44 modules.

## 15. Data Explorer v3

The portfolio level provides matrices, distributions, relationships, trends and long-form exports across the 44 modules. The detailed level exposes 60 research datasets and more than 409,000 published rows, including components and source observations.

Source-gated datasets return an explicit 409 status rather than empty or synthetic tables. Each published row carries a value identifier that opens a provenance card.

## 16. Data Lifecycle Center v2

The update center manages 62 source policies and the dependencies among sources, 44 modules and 60 datasets. Release discovery is separated from acquisition, staging, validation and publication.

Dry-run planning reveals the dependency DAG, target products, rights requirements and blockers before any live data changes. Publication is atomic and rollback restores both SQLite and published file trees, including removal of incompatible WAL and SHM sidecars.

## 17. University geography

University rows from QS, THE and ARWU can be displayed as points on a world map when publication rights and a verified location match exist. Coordinates are usually city or agglomeration centroids rather than campus entrances.

Exact cross-source reuse requires normalised institution name, matching ISO3 and a unique match. Ambiguous cases remain unresolved and carry quality flags rather than being silently geocoded.

## 18. National and corporate evidence

National statistics and corporate observations supplement international rankings. They remain separate evidence layers with their own units, reporting periods and provenance, and are not silently inserted into official indices.

The recommendation engine uses these layers only when the indicator, benchmark and transformation are stated explicitly.

## 19. API, export and integration

FastAPI exposes health, workspace, dataset, provenance, CSV and operational endpoints. Route-specific payloads replace the former monolithic application payload wherever possible.

Exports retain country, module or dataset, raw value, unit, rank, percentile, actual year, status, source and value identifier. The OpenAPI surface is part of the technical appendix.

## 20. Interface, accessibility and mathematical typesetting

The interface is bilingual, responsive and keyboard navigable. Essential values remain visible without hover, wide tables are named scroll regions, and charts provide text alternatives.

From T24, formulas are rendered through a local KaTeX parser configured for MathML output. This produces semantic mathematics for assistive technologies without a third-party CDN. The source TeX is preserved in the DOM for audit and fallback.

## 21. Quality assurance and release gates

Quality assurance includes SQLite integrity, foreign keys, formula reproduction, source provenance, synthetic-data exclusion, bilingual labels, coverage, product-loss guards, browser errors and installer rollback.

The scientific release status is independent from the immutable browser-evidence status. A valid application can remain a release candidate until a new cryptographically linked browser matrix is issued.

## 22. Interpretation limits

Indices measure constructed concepts under specific editions, samples and normalisation rules. Ranks are ordinal, not cardinal. Correlation is not causality, and source-gated does not mean a country scored zero.

Changes in methodology, country coverage, classification or data year may break a time series. Every interpretation should cite edition, actual year, universe, unit and uncertainty where available.

## 23. Governance, authorship and responsibility

Official publishers retain authorship of their indices and data. GIR authorship applies to HTEI, the training model, recommendations, explicitly labelled diagnostics and transparent country aggregations.

Licensing decisions are operational controls rather than legal advice. Scientific and technical responsibility includes retaining source evidence, formula versions, review status and update history.

## 24. Conclusion

GIR is a research infrastructure rather than a collection of isolated dashboards. Its main value is the ability to move from a public claim to a module, component, source observation, immutable snapshot and reproducible transformation.

The expanded portfolio provides broad context while preserving the original high-technology labour focus and its applied recommendations for Russia.

## Appendix A. Status matrix of 44 modules

| Group | Code | Module | Numeric status | Records | Primary storage |
| --- | --- | --- | --- | --- | --- |
| Global benchmarks | `HDI` | Human Development Index | numeric_release | 5,940 | `index_scores` |
| Global benchmarks | `HCI_PLUS` | Human Capital Index Plus | numeric_release | 158 | `index_scores` |
| Global benchmarks | `GTCI` | Global Talent Competitiveness Index | numeric_release | 135 | `index_scores` |
| Global benchmarks | `GII` | Global Innovation Index | numeric_release | 536 | `index_scores` |
| Global benchmarks | `IDI` | ICT Development Index | numeric_release | 503 | `index_scores` |
| Global benchmarks | `HTEI` | High-Tech Employment Index | numeric_release | 1,980 | `index_scores` |
| Education & universities | `PISA_SKI` | OECD PISA School Knowledge | numeric_release | 81 | `pisa_school_knowledge_scores` |
| Education & universities | `QS_ET` | QS Engineering & Technology | numeric_release | 2,185 | `qs_institution_rankings` |
| Education & universities | `THE_ENG` | Times Higher Education Engineering | numeric_release | 1,555 | `the_engineering_institution_rankings` |
| Education & universities | `ARWU` | ShanghaiRanking ARWU | numeric_release | 1,000 | `arwu_institution_rankings` |
| Government & institutions | `CPI` | Corruption Perceptions Index | numeric_release | 2,494 | `cpi_results` |
| Government & institutions | `WPFI` | World Press Freedom Index | numeric_release | 900 | `wpfi_results` |
| Government & institutions | `ROLI` | WJP Rule of Law Index | numeric_release | 1,484 | `roli_results` |
| Government & institutions | `WGI` | Worldwide Governance Indicators | numeric_release | 32,403 | `wgi_dimension_values` |
| Government & institutions | `VDEM` | V-Dem Democracy Indices | numeric_release | 118,338 | `vdem_index_values` |
| Digitalisation, AI & compute | `NRI` | Network Readiness Index | numeric_release | 127 | `nri_country_metadata` |
| Digitalisation, AI & compute | `EGDI` | E-Government Development Index | numeric_release | 193 | `egdi_country_metadata` |
| Digitalisation, AI & compute | `GCI` | ITU Global Cybersecurity Index | numeric_release | 194 | `gci_country_scores` |
| Digitalisation, AI & compute | `GARI` | Government AI Readiness Index | numeric_release | 195 | `gari_country_scores` |
| Digitalisation, AI & compute | `AIPI` | IMF AI Preparedness Index | numeric_release | 174 | `aipi_country_scores` |
| Digitalisation, AI & compute | `CF_IQI` | Cloudflare Internet Quality Index | numeric_release | 1,989 | `cf_iqi_observations` |
| Digitalisation, AI & compute | `TOP500` | TOP500 / Green500 country aggregation | numeric_release | 500 | `top500_systems` |
| Economy & finance | `UNCTAD_PCI` | UNCTAD Productive Capacities Index | numeric_release | 59,085 | `pci_observations` |
| Economy & finance | `BREADY` | World Bank Business Ready | numeric_release | 4,343 | `bready_scores` |
| Economy & finance | `ECI` | Economic Complexity Index | numeric_release | 5,693 | `eci_observations` |
| Economy & finance | `KOF_GLOBAL` | KOF Globalisation Index | numeric_release | 280,421 | `kof_observations` |
| Economy & finance | `IMF_FDI` | IMF Financial Development Index | numeric_release | 70,848 | `fdi_observations` |
| Economy & finance | `GLOBAL_FINDEX` | World Bank Global Findex | numeric_release | 385,599 | `findex_observations` |
| Society & human development | `SPI` | Social Progress Index | numeric_release | 171 | `spi_scores` |
| Society & human development | `SDG` | SDG Index | numeric_release | 5,211 | `sdg_country_results` |
| Society & human development | `WHR` | World Happiness Report | numeric_release | 2,116 | `whr_results` |
| Society & human development | `GGGI` | Global Gender Gap Index | numeric_release | 148 | `gggi_results` |
| Society & human development | `UHC_SCI` | WHO UHC Service Coverage Index | numeric_release | 4,968 | `uhc_results` |
| Environment & sustainability | `EPI` | Environmental Performance Index | numeric_release | 11,151 | `giip/static/epi/manifest.json:country_component_rows` |
| Environment & sustainability | `ND_GAIN` | ND-GAIN Country Index | numeric_release | 4,995 | `giip/static/nd-gain/manifest.json:observation_rows` |
| Environment & sustainability | `ETI` | Energy Transition Index | numeric_release | 360 | `giip/static/eti-transition/manifest.json:score_observations` |
| Environment & sustainability | `WORLD_RISK_INDEX` | WorldRiskIndex | numeric_release | 5,018 | `giip/static/world-risk/manifest.json:records` |
| Security & international connectedness | `GPI` | Global Peace Index | numeric_release | 163 | `gpi_country_scores` |
| Security & international connectedness | `GMI` | Global Militarisation Index | numeric_release | 149 | `gmi_country_scores` |
| Security & international connectedness | `GOCI` | Global Organized Crime Index | numeric_release | 579 | `goci_country_scores` |
| Security & international connectedness | `SIPRI_MILEX` | SIPRI Military Expenditure | numeric_release | 55,003 | `sipri_milex_values` |
| Security & international connectedness | `DHL_GCI` | DHL Global Connectedness Index | numeric_release | 17,125 | `dhl_gci_scores` |
| Security & international connectedness | `WORLD_BANK_LPI` | World Bank Logistics Performance Indicators | numeric_release | 12,327 | `wb_lpi2_observations` |
| Security & international connectedness | `UNCTAD_LSCI` | UNCTAD Liner Shipping Connectivity Index | numeric_release | 14,546 | `unctad_lsci_observations` |

## Appendix B. Formula and methodological registry

| Index | Formula version | Formula status | Source |
|---|---|---|---|
| `AIPI` | `imf-aipi-2023-equal-four-dimensions` | official formula available | `IMF_AIPI` |
| `ARWU` | `gir-arwu-country-research-system-v1` | documented or non-composite rule | `SHANGHAI_ARWU` |
| `BREADY` | `official-bready-multidimensional-v1` | documented or non-composite rule | `world-bank-business-ready` |
| `CF_IQI` | `cloudflare-iqi-no-composite-v1` | documented or non-composite rule | `CLOUDFLARE_RADAR_IQI` |
| `DHL_GCI` | `DHL_GCR_2026_OFFICIAL` | official formula available | `DHL_GCI` |
| `ECI` | `official-eci-import-v1` | official formula available | `HARVARD_GROWTH_LAB_ATLAS_ECI` |
| `EGDI` | `un-desa-egdi-2024-official` | official formula available | `UN_DESA_EGOV` |
| `GARI` | `oxford-insights-gari-2025-corrected-2026-01` | official formula available | `OXFORD_INSIGHTS_GARI` |
| `GCI` | `itu-gci-2024-v5-official` | official formula available | `ITU_GCI` |
| `GII` | `gii-official-score-and-pillars` | documented or non-composite rule | `WIPO_GII` |
| `GII` | `official-gii-2025` | official formula available | `WIPO_GII` |
| `GLOBAL_FINDEX` | `official-global-findex-indicators-v1` | documented or non-composite rule | `WORLD_BANK_GLOBAL_FINDEX` |
| `GMI` | `bicc-gmi-codebook-v3-published-score-no-recompute` | official formula available | `BICC_GMI` |
| `GOCI` | `goci-open-data-2025-workbook-v1` | official formula available | `GITOC_GOCI` |
| `GPI` | `IEP_GPI_2026_OFFICIAL` | official formula available | `IEP_GPI` |
| `GTCI` | `official-gtci-2025-pillars` | official formula available | `PORTULANS_GTCI` |
| `HCI` | `hci-historical-2020-official-score` | documented or non-composite rule | `WORLD_BANK_HCI` |
| `HCI` | `official-hci-series` | official formula available | `WORLD_BANK_HCI` |
| `HCI_PLUS` | `official-hci-plus-2026` | official formula available | `WORLD_BANK_HCIPLUS` |
| `HDI` | `hdi-official-method-note-v2` | official formula available | `UNDP_HDR` |
| `HDI` | `official-hdi-timeseries-2025` | official formula available | `UNDP_HDR` |
| `HTEI` | `htei-v3-multisource` | official formula available | `HTEI_MULTI_SOURCE` |
| `HTEI` | `htei-v3-multisource-asof-2026` | documented or non-composite rule | `HTEI_MULTI_SOURCE` |
| `HTEI` | `htei-v5-scientific-2026` | official formula available | `HTEI_SCIENTIFIC_V5` |
| `HTEI` | `htei-v6-common-support-2026` | documented or non-composite rule | `HTEI_FINAL_V6` |
| `IDI` | `official-idi-series-2023-2025` | official formula available | `ITU_IDI` |
| `IMF_FDI` | `official-imf-fdi-multidimensional-v1` | official formula available | `IMF_FINANCIAL_DEVELOPMENT_INDEX` |
| `KOF_GLOBAL` | `official-kof-import-v1` | official formula available | `KOF_ETH_GLOBALISATION_INDEX` |
| `NRI` | `portulans-nri-2025-official-hierarchy` | official formula available | `PORTULANS_NRI` |
| `PISA_SKI` | `gir-pisa-school-knowledge-equal-domains-v1` | documented or non-composite rule | `OECD_PISA` |
| `QS_ET` | `qs-country-aggregation-v1` | documented or non-composite rule | `QS_ET` |
| `SIPRI_MILEX` | `sipri-milex-official-series-no-composite-v1` | documented or non-composite rule | `SIPRI_MILEX` |
| `THE_ENG` | `gir-the-engineering-country-v1` | documented or non-composite rule | `THE_ENG` |
| `TOP500` | `gir-top500-country-aggregation-june-2026-v1` | documented or non-composite rule | `TOP500_ORG_TOP500` |
| `UNCTAD_LSCI` | `unctad-lsci-official-score-no-recompute-v1` | documented or non-composite rule | `UNCTAD_LSCI` |
| `UNCTAD_PCI` | `official-pci-import-v1` | official formula available | `UNCTAD_PCI` |
| `VDEM` | `official-vdem-v16-five-high-level-indices-2025-v1` | official formula available | `VDEM_V16` |
| `WB_LPI2` | `world-bank-lpi2-indicator-family-no-composite-v1` | documented or non-composite rule | `WORLD_BANK_LPI` |
| `WB_LPI_LEGACY` | `world-bank-lpi-legacy-official-v1` | documented or non-composite rule | `WORLD_BANK_LPI` |
| `WB_LPI_LEGACY` | `world-bank-lpi-stage11-v1` | documented or non-composite rule | `WORLD_BANK_LPI` |
| `WGI` | `official-wgi-2025-revision-1996-2024-v1` | official formula available | `WORLD_BANK_WGI` |

## Appendix C. Glossary

- **actual data year.** Year to which the underlying observation refers, distinct from publication year.
- **ASOF profile.** Diagnostic profile using the latest available observation for each component; it is not a synchronous ranking.
- **favourable percentile.** Navigation scale in which higher values indicate a more favourable international position after respecting the module direction.
- **formula version.** Stable identifier of a calculation or official aggregation rule.
- **methodology break.** Change in construct, indicator set, weighting or coverage that prevents automatic time-series continuity.
- **provenance.** Evidence chain linking a result to source, snapshot, transformation, formula and responsible agent.
- **raw snapshot.** Immutable acquired source file with checksum and retrieval metadata.
- **source-gated.** Application contract is implemented but the authorised numeric release is not installed.
- **transformation run.** Recorded execution that converts source observations into normalised or derived outputs.
- **universe.** Set of countries or entities among which a score is ranked or normalised.
- **value ID.** Stable identifier of an individual published observation or derived value.

## Appendix D. Source and distribution-rights registry

| Source ID | Owner | Release | Access | Automation | Archive decision |
|---|---|---:|---|---|---|
| `BICC_GMI` | Bonn International Centre for Conflict Studies (BICC) | 2025 | official_metadata_methodology_and_ranking_reference | latest_report_catalogued_numeric_snapshot_not_captured | exclude_raw_keep_derived |
| `CLOUDFLARE_RADAR_IQI` | Cloudflare, Inc. | 2026 | official REST API; free Cloudflare API token with Account > Radar > Read required | credential_required_source_contract_installed_no_bundled_measurements | exclude_all_measurements_keep_connector_and_source_contract |
| `CORPORATE_REPORTS_HTEI` | Public companies and reporting issuers | 2026 | checksum-verified official report register | implemented_audit_register | exclude_raw_keep_derived |
| `DHL_GCI` | DHL Group / DHL Initiative on Globalization at NYU Stern | 2026 | metadata_only_until_operator_authorized_local_import | implemented_permission_gated_local_official_csv_import | exclude_raw_keep_derived |
| `EUROSTAT_HTEC` | Eurostat | 2025 | official Eurostat Statistics API | implemented_official_json_api | include |
| `GEONAMES` | GeoNames | 2026 | bulk_download_and_web_services | bundled_reference_with_operator_refresh | include |
| `GITOC_GOCI` | Global Initiative Against Transnational Organized Crime (GI-TOC) | 2025 | official_open_data_excel_workbook | implemented_official_open_data_workbook | include |
| `HARVARD_GROWTH_LAB_ATLAS_ECI` | Growth Lab at Harvard University | 2024 | official GraphQL API or official data snapshot | implemented_verified_official_import | exclude_raw_keep_derived |
| `HTEI_FINAL_V6` | MGIMO / FNISC RAS | 2026 | derived from archived official observations | automated | include |
| `HTEI_MULTI_SOURCE` | MGIMO / FNISC RAS | 2026 | computed manifest from official archived snapshots | implemented_reproducible_transform | include |
| `HTEI_SCIENTIFIC_V5` | MGIMO / FNISC RAS project team | 2026 | local reproducible transform | implemented_reproducible_scientific_transform | include |
| `IEP_GPI` | Institute for Economics & Peace | 2026 | official_pdf_report_with_verified_country_table_extract | implemented_official_pdf_extract | include |
| `ILOSTAT_HTEI` | International Labour Organization | 2025 | official bulk CSV API | implemented_official_bulk_csv | include |
| `IMF_AIPI` | International Monetary Fund | 2023 | IMF dataset delivered as a public World Bank Data360 CSV | implemented_verified_derived_export_with_optional_official_download_recheck | exclude_raw_keep_derived |
| `IMF_FINANCIAL_DEVELOPMENT_INDEX` | International Monetary Fund | — | official SDMX API or official data export | metadata_ready_awaiting_verified_local_import | exclude_raw_keep_derived |
| `ITU_GCI` | International Telecommunication Union; machine-readable delivery via World Bank Data360 | 2024 | official report plus public machine-readable Data360 mirror of the ITU dataset | implemented_verified_derived_export_and_hash_locked_source_recipe | exclude_raw_keep_derived |
| `ITU_IDI` | ITU | 2025 | official downloadable XLSX | implemented_official_download | exclude_raw_keep_derived |
| `KOF_ETH_GLOBALISATION_INDEX` | KOF Swiss Economic Institute, ETH Zurich | 2025 | official downloadable workbook | implemented_verified_official_import | exclude_raw_keep_derived |
| `NATIONAL_STATS_HTEI` | National statistical offices | 2026 | checksum-verified official-file register | implemented_audit_register | exclude_raw_keep_derived |
| `NATIONAL_STATS_NUMERIC` | National statistical offices | 2024 | official CSV/JSON endpoints | configured | exclude_raw_keep_derived |
| `ND_GAIN_ARCHIVAL_PANEL_1995_2021` | Notre Dame Global Adaptation Initiative; verified mirror by 360info | 2021 | checksummed bundled CSV mirror; provenance-separated from current release | implemented_archival_panel_backend_and_frontend | include |
| `NOTRE_DAME_ND_GAIN_COUNTRY_INDEX_2026` | Notre Dame Global Adaptation Initiative, University of Notre Dame | 2026 | official downloadable archive; bundled technical report; deterministic importer | release_descriptor_and_local_importer_implemented | include |
| `OECD_HTEI` | OECD | 2025 | official SDMX CSV API | implemented_official_sdmx_api | exclude_raw_keep_derived |
| `OECD_PISA` | OECD | 2022 | official public database, downloadable tables and SDMX API | implemented_official_seed_and_import | include |
| `OXFORD_INSIGHTS_GARI` | Oxford Insights | 2025 | official corrected PDF report and methodology | implemented_verified_derived_export_with_optional_pdf_recheck | exclude_raw_keep_derived |
| `PORTULANS_GTCI` | INSEAD / Portulans Institute | 2025 | official PDF report extraction | implemented_official_pdf_extract | exclude_raw_keep_derived |
| `PORTULANS_NRI` | Portulans Institute | 2025 | official downloadable PDF | implemented_verified_derived_export_and_official_pdf_parser | exclude_raw_keep_derived |
| `QS_ET` | QS Quacquarelli Symonds | 2026 | official public JSON endpoint archive | implemented_official_web_endpoint | exclude_raw_keep_derived |
| `SEC_EDGAR_CORPORATE_NUMERIC` | U.S. Securities and Exchange Commission | 2026 | official JSON API | automated | exclude_raw_keep_derived |
| `SHANGHAI_ARWU` | ShanghaiRanking Consultancy | 2025 | user-supplied official Excel/CSV download, licensed ARWU Tracker export, or written-permission export; automated website extraction disabled | awaiting_authorized_export | exclude_raw_keep_derived |
| `SIPRI_MILEX` | Stockholm International Peace Research Institute (SIPRI) | 2026 | metadata_only_until_operator_authorized_local_import | implemented_permission_gated_local_official_workbook_import | exclude_raw_keep_derived |
| `SPECIALIZED_RATINGS_HTEI` | QS, WIPO, Portulans and other official ranking publishers | 2026 | derived from archived official ranking snapshots | implemented_audit_register | exclude_raw_keep_derived |
| `SRC_CPI_TI` | Transparency International | — | official_open_download | controlled_fetch_or_manual_import | include |
| `SRC_GGGI_WEF` | World Economic Forum | — | official_dashboard_or_authorized_export | manual_import | exclude_raw_keep_derived |
| `SRC_ROLI_WJP` | World Justice Project | — | official_export_with_operator_authorisation | awaiting_authorized_export | exclude_raw_keep_derived |
| `SRC_SDG_SDSN_GLOBAL` | SDSN SDG Transformation Center | 2026 | official_free_download | implemented_verified_official_import | exclude_raw_keep_derived |
| `SRC_SPI_GLOBAL` | Social Progress Imperative | — | premium_authorized_export | manual_import | exclude_raw_keep_derived |
| `SRC_UHC_WHO_WORLD_BANK` | World Health Organization and World Bank | 2025 | official_open_download | implemented_verified_official_import | include |
| `SRC_WHR_FIGURE_2_1` | Wellbeing Research Centre, University of Oxford | 2026 | official_free_download | implemented_verified_official_import | exclude_raw_keep_derived |
| `SRC_WPFI_RSF` | Reporters Without Borders (RSF) | — | official_export_with_operator_authorisation | awaiting_authorized_export | exclude_raw_keep_derived |
| `THE_ENG` | THE World Universities Insights Limited | 2026 | authorised official CSV/XLSX export supplied by the user; automated website extraction disabled | awaiting_authorized_export | exclude_raw_keep_derived |
| `TOP500_ORG_GREEN500` | TOP500.org | 2026 | official downloadable XLSX | implemented_official_xlsx | exclude_raw_keep_derived_attributed |
| `TOP500_ORG_TOP500` | TOP500.org | 2026 | official downloadable XLSX | implemented_official_xlsx | exclude_raw_keep_derived_attributed |
| `UIS_HTEI` | UNESCO Institute for Statistics | 2026 | official version-pinned UIS Data API | implemented_official_api | include |
| `UNCTAD_LSCI` | United Nations Conference on Trade and Development (UNCTAD) | 2026 | official bulk 7z with verified CSV member | implemented_verified_official_bulk_import | allowed_with_attribution |
| `UNCTAD_PCI` | United Nations Trade and Development (UNCTAD) | 2024 | official bulk 7z with verified CSV member | implemented_verified_official_bulk_import | include |
| `UNDP_HDR` | UNDP | 2025 | official downloadable CSV | implemented_official_download | include |
| `UN_DESA_EGOV` | United Nations Department of Economic and Social Affairs (UN DESA) | 2024 | official downloadable PDF and data center | implemented_verified_derived_export_and_official_pdf_parser | exclude_raw_keep_derived |
| `VDEM_V16` | Varieties of Democracy (V-Dem) Institute, University of Gothenburg | 2026 | versioned CC BY-SA 4.0 RDA subset with deterministic GIR canonical CSV | implemented_versioned_snapshot | include_share_alike |
| `WEF_ENERGY_TRANSITION_INDEX_2026` | World Economic Forum, in collaboration with Accenture | 2026 | exact official headline table with checksums; authorised detailed-export importer | implemented_official_headline_backend_frontend_and_authorised_importer | exclude_raw_keep_derived |
| `WIKIPEDIA_GMI_2022_TABLE` | Wikipedia contributors / Wikimedia Foundation | 2022 | locked_attributed_secondary_table_snapshot | implemented_complete_secondary_snapshot | include |
| `WIPO_GII` | WIPO | 2025 | official downloadable XLSX | implemented_official_download | exclude_raw_keep_derived |
| `WORLD_BANK_COUNTRIES` | World Bank | 2026 | official REST API | implemented_official_api | include |
| `WORLD_BANK_GLOBAL_FINDEX` | World Bank | 2025 | official downloadable CSV/XLSX | implemented_verified_official_import | include |
| `WORLD_BANK_HCI` | World Bank | 2020 | official REST API | implemented_official_api | include |
| `WORLD_BANK_HCIPLUS` | World Bank | 2026 | official country-brief PDFs | automated | include |
| `WORLD_BANK_HTEI` | World Bank | 2025 | official REST API | implemented_official_api | include |
| `WORLD_BANK_LPI` | World Bank | 2025 | official_open_data_csv_snapshots | implemented_bundled_official_data360_snapshots | include |
| `WORLD_BANK_WGI` | World Bank | 2025 | official downloadable XLSX with source-by-dimension means | implemented_official_download | include |
| `WORLD_RISK_INDEX_2025` | Bündnis Entwicklung Hilft / Institute for International Law of Peace and Armed Conflict (IFHV), Ruhr University Bochum | 2025 | official checksummed XLSX/CSV files; immutable bundled snapshot | implemented_official_backend_frontend_and_importer | include |
| `YALE_EPI_2026` | Yale Center for Environmental Law & Policy / CIESIN, Columbia University | 2026 | official downloadable XLSX; immutable bundled snapshot | implemented_official_snapshot_import_and_frontend | include |
| `world-bank-business-ready` | World Bank Group | 2025 | official downloadable release bundle | implemented_verified_official_import | include |

## Appendix E. Data Explorer catalogue

| Dataset ID | Title | Group | Status | Rows |
| --- | --- | --- | --- | --- |
| `corporate_metrics` | Corporate metrics | Global benchmarks | published; queryable | 26 |
| `htei_v6_component_values` | HTEI v6 components | Global benchmarks | published; queryable | 1,909 |
| `hci_plus_country_scores` | Human Capital Index+ 2026 | Global benchmarks | published; queryable | 158 |
| `index_scores` | International index scores | Global benchmarks | published; queryable | 13,803 |
| `national_statistics_metrics` | National statistics | Global benchmarks | published; queryable | 94 |
| `component_values` | Official index components | Global benchmarks | published; queryable | 38,890 |
| `qs_institution_rankings` | QS engineering and technology institutions | Global benchmarks | published; queryable | 2,185 |
| `source_observations` | Source observations | Global benchmarks | published; queryable | 18,803 |
| `training_model_components` | Training-model blocks and components | Global benchmarks | published; queryable | 4,943 |
| `training_model_scores` | Workforce training competitiveness model | Global benchmarks | published; queryable | 508 |
| `pisa_school_knowledge_scores` | PISA: GIR school-knowledge composite | Education & universities | published; queryable | 81 |
| `pisa_domain_results` | PISA: official domain results | Education & universities | published; queryable | 243 |
| `arwu_institutions` | ShanghaiRanking ARWU: institution records | Education & universities | published; queryable | 1,000 |
| `the_engineering_institutions` | THE Engineering: institution records | Education & universities | published; queryable | 1,555 |
| `cpi_source_scores` | CPI: underlying source assessments | Government & institutions | published; queryable | 16,918 |
| `cpi_country_results` | Corruption Perceptions Index | Government & institutions | published; queryable | 2,494 |
| `vdem_index_values` | V-Dem v16: five democracy indices | Government & institutions | published; queryable | 118,338 |
| `roli_country_results` | WJP Rule of Law Index | Government & institutions | published; queryable | 1,484 |
| `roli_factor_results` | WJP Rule of Law: eight factors | Government & institutions | published; queryable | 11,872 |
| `roli_subfactor_results` | WJP Rule of Law: sub-factors | Government & institutions | published; queryable | 65,268 |
| `wpfi_country_results` | World Press Freedom Index | Government & institutions | published; queryable | 900 |
| `wpfi_indicator_results` | World Press Freedom Index: five components | Government & institutions | published; queryable | 4,500 |
| `wgi_dimension_values` | Worldwide Governance Indicators: six dimensions | Government & institutions | published; queryable | 32,403 |
| `cloudflare_iqi_observations` | Cloudflare Internet Quality Index | Digitalisation, AI & compute | published; queryable | 1,989 |
| `gari_dimension_values` | Government AI Readiness: dimensions | Digitalisation, AI & compute | published; queryable | 1,170 |
| `aipi_dimension_values` | IMF AI Preparedness Index: dimensions | Digitalisation, AI & compute | published; queryable | 696 |
| `gci_dimension_values` | ITU Global Cybersecurity Index: dimensions | Digitalisation, AI & compute | published; queryable | 4,850 |
| `nri_dimension_values` | Network Readiness Index: dimensions | Digitalisation, AI & compute | published; queryable | 8,763 |
| `top500_country_aggregates` | TOP500: GIR country aggregation | Digitalisation, AI & compute | published; queryable | 225 |
| `top500_systems` | TOP500: computing systems | Digitalisation, AI & compute | published; queryable | 500 |
| `egdi_dimension_values` | UN E-Government Development Index: dimensions | Digitalisation, AI & compute | published; queryable | 4,246 |
| `imf_financial_development_dimensions` | IMF Financial Development Index | Economy & finance | published; queryable | 67,527 |
| `bready_topic_pillars` | B-READY: topics and pillars | Economy & finance | mapping_required; not queryable | 4,343 |
| `eci_country_year` | Economic Complexity Index | Economy & finance | mapping_required; not queryable | 5,693 |
| `global_findex_indicators` | Global Findex indicators | Economy & finance | mapping_required; not queryable | 385,599 |
| `kof_globalisation_dimensions` | KOF Globalisation Index | Economy & finance | mapping_required; not queryable | 280,421 |
| `pci_country_components` | UNCTAD Productive Capacities Index | Economy & finance | mapping_required; not queryable | 59,085 |
| `global_gender_gap_country_results` | Global Gender Gap Index | Society & human development | published; queryable | 148 |
| `sdg_goal_results` | SDG Index: 17 goals | Society & human development | published; queryable | 85,545 |
| `sdg_country_results` | SDG Index: country results | Society & human development | published; queryable | 5,211 |
| `sdg_indicator_values` | SDG Index: indicators | Society & human development | published; queryable | 293,248 |
| `spi_country_scores` | Social Progress Index | Society & human development | published; queryable | 171 |
| `global_gender_gap_indicators` | Global Gender Gap: indicators | Society & human development | empty; not queryable | 0 |
| `spi_measure_scores` | Social Progress Index: measures | Society & human development | empty; not queryable | 0 |
| `uhc_service_coverage_country_results` | UHC Service Coverage Index | Society & human development | mapping_required; not queryable | 4,968 |
| `world_happiness_country_results` | World Happiness Report | Society & human development | mapping_required; not queryable | 2,116 |
| `world_happiness_factors` | World Happiness Report: factors | Society & human development | mapping_required; not queryable | 7,121 |
| `epi_2026_scores` | EPI 2026: countries, objectives, categories and indicators | Environment & sustainability | published; queryable | 11,151 |
| `eti_2026_headline` | ETI 2026: system performance and transition readiness | Environment & sustainability | published; queryable | 120 |
| `nd_gain_panel` | ND-GAIN: vulnerability and readiness panel, 1995–2021 | Environment & sustainability | published; queryable | 4,995 |
| `world_risk_panel` | WorldRiskIndex: harmonised risk panel, 2000–2025 | Environment & sustainability | published; queryable | 5,018 |
| `dhl_gci_scores` | DHL Global Connectedness Index | Security & connectedness | published; queryable | 17,125 |
| `gmi_country_scores` | Global Militarisation Index | Security & connectedness | published; queryable | 149 |
| `goci_country_scores` | Global Organized Crime Index | Security & connectedness | published; queryable | 579 |
| `goci_indicator_scores` | Global Organized Crime Index: 36 indicators | Security & connectedness | published; queryable | 19,686 |
| `gpi_country_scores` | Global Peace Index 2026 | Security & connectedness | published; queryable | 163 |
| `world_bank_lpi_legacy` | Historical Logistics Performance Index | Security & connectedness | published; queryable | 1,079 |
| `sipri_military_expenditure_series` | SIPRI Military Expenditure | Security & connectedness | published; queryable | 53,952 |
| `unctad_lsci_observations` | UNCTAD Liner Shipping Connectivity Index | Security & connectedness | published; queryable | 14,546 |
| `world_bank_lpi2` | World Bank LPI 2.0 | Security & connectedness | published; queryable | 12,327 |

## Appendix F. FastAPI operation catalogue

| Method | Path | Operation |
|---|---|---|
| GET | `/` | `home` |
| GET | `/api/acceptance/tz` | `acceptance_tz` |
| GET | `/api/aipi` | `ai_preparedness_release` |
| GET | `/api/aipi/benchmarks` | `ai_preparedness_benchmarks` |
| GET | `/api/aipi/countries` | `ai_preparedness_countries` |
| GET | `/api/aipi/country/{iso3}` | `ai_preparedness_country` |
| GET | `/api/aipi/ranking` | `ai_preparedness_ranking_compatibility` |
| GET | `/api/aipi/workspace` | `ai_preparedness_workspace` |
| GET | `/api/aipi/workspace.csv` | `ai_preparedness_workspace_export` |
| GET | `/api/app-data` | `app_data` |
| GET | `/api/arwu/countries` | `arwu_countries` |
| GET | `/api/arwu/country/{iso3}` | `arwu_country` |
| GET | `/api/arwu/institutions` | `arwu_institutions` |
| GET | `/api/arwu/methodology` | `arwu_methodology` |
| GET | `/api/arwu/provenance/{value_id:path}` | `arwu_provenance` |
| GET | `/api/arwu/status` | `arwu_status` |
| GET | `/api/catalog/groups/environment-sustainability` | `environment_catalog` |
| GET | `/api/comparison/workspace` | `comparison_workspace` |
| GET | `/api/comparison/workspace.csv` | `comparison_workspace_export` |
| GET | `/api/corruption-perceptions/audit` | `get_audit` |
| GET | `/api/corruption-perceptions/country/{iso3}` | `get_country` |
| GET | `/api/corruption-perceptions/country/{iso3}/series` | `get_country_series` |
| GET | `/api/corruption-perceptions/metadata` | `get_metadata` |
| GET | `/api/corruption-perceptions/ranking` | `get_ranking` |
| GET | `/api/corruption-perceptions/regions` | `get_regions` |
| GET | `/api/corruption-perceptions/releases` | `get_releases` |
| GET | `/api/corruption-perceptions/significant-changes` | `get_significant_changes` |
| GET | `/api/corruption-perceptions/source/{source_code}/country/{iso3}/series` | `get_source_country_series` |
| GET | `/api/corruption-perceptions/sources` | `get_sources` |
| GET | `/api/corruption-perceptions/status` | `get_status` |
| GET | `/api/corruption-perceptions/years` | `get_years` |
| GET | `/api/countries` | `countries` |
| GET | `/api/country/{iso3}` | `country` |
| GET | `/api/country/{iso3}/command-center` | `command_center` |
| GET | `/api/country/{iso3}/profile` | `country_profile` |
| GET | `/api/country/{iso3}/workspace` | `country_workspace` |
| GET | `/api/country/{iso3}/workspace-v3` | `country_portfolio_workspace` |
| GET | `/api/country/{iso3}/workspace-v3.csv` | `country_portfolio_workspace_csv` |
| GET | `/api/cpi/audit` | `get_audit` |
| GET | `/api/cpi/country/{iso3}` | `get_country` |
| GET | `/api/cpi/country/{iso3}/series` | `get_country_series` |
| GET | `/api/cpi/metadata` | `get_metadata` |
| GET | `/api/cpi/ranking` | `get_ranking` |
| GET | `/api/cpi/regions` | `get_regions` |
| GET | `/api/cpi/releases` | `get_releases` |
| GET | `/api/cpi/significant-changes` | `get_significant_changes` |
| GET | `/api/cpi/source/{source_code}/country/{iso3}/series` | `get_source_country_series` |
| GET | `/api/cpi/sources` | `get_sources` |
| GET | `/api/cpi/status` | `get_status` |
| GET | `/api/cpi/years` | `get_years` |
| GET | `/api/cross-matrix` | `cross_matrix` |
| GET | `/api/cross-matrix.csv` | `cross_matrix_csv` |
| GET | `/api/data-catalog/dcat.jsonld` | `catalog_dcat` |
| GET | `/api/data-catalog/files` | `catalog_files` |
| GET | `/api/data-catalog/files/{file_id}` | `catalog_file_detail` |
| GET | `/api/data-catalog/files/{file_id}/content` | `catalog_file_content` |
| GET | `/api/data-catalog/files/{file_id}/preview` | `catalog_file_preview` |
| GET | `/api/data-catalog/manifest.csv` | `catalog_manifest` |
| GET | `/api/data-catalog/sources` | `catalog_sources` |
| GET | `/api/data-catalog/sources/{source_id}` | `catalog_source` |
| GET | `/api/data-catalog/summary` | `catalog_summary` |
| GET | `/api/data-explorer/datasets/{dataset_id}/metadata.json` | `explorer_metadata` |
| GET | `/api/data-explorer/export.csv` | `explorer_export` |
| GET | `/api/data-explorer/portfolio/catalog` | `explorer_portfolio_catalog` |
| GET | `/api/data-explorer/portfolio/distribution` | `explorer_portfolio_distribution` |
| GET | `/api/data-explorer/portfolio/export.csv` | `explorer_portfolio_export` |
| GET | `/api/data-explorer/portfolio/matrix` | `explorer_portfolio_matrix` |
| GET | `/api/data-explorer/portfolio/matrix.csv` | `explorer_portfolio_matrix_export` |
| GET | `/api/data-explorer/portfolio/query` | `explorer_portfolio_query` |
| GET | `/api/data-explorer/portfolio/scatter` | `explorer_portfolio_scatter` |
| GET | `/api/data-explorer/portfolio/selection` | `explorer_portfolio_selection` |
| GET | `/api/data-explorer/portfolio/selection.csv` | `explorer_portfolio_selection_export` |
| GET | `/api/data-explorer/portfolio/trend` | `explorer_portfolio_trend` |
| GET | `/api/data-explorer/provenance/{value_id:path}` | `explorer_provenance` |
| GET | `/api/data-explorer/query` | `explorer_query` |
| GET | `/api/data-explorer/schema` | `explorer_schema` |
| GET | `/api/data-quality` | `data_quality` |
| POST | `/api/data-updates/check` | `data_updates_check` |
| GET | `/api/data-updates/cli` | `data_updates_cli` |
| GET | `/api/data-updates/health` | `data_updates_health` |
| GET | `/api/data-updates/jobs` | `data_updates_jobs` |
| POST | `/api/data-updates/jobs` | `data_updates_stage` |
| GET | `/api/data-updates/jobs/{job_id:path}` | `data_updates_job` |
| POST | `/api/data-updates/jobs/{job_id:path}/publish` | `data_updates_publish` |
| GET | `/api/data-updates/overview` | `data_updates_overview` |
| POST | `/api/data-updates/packages/register` | `data_updates_register_package` |
| GET | `/api/data-updates/plans` | `data_updates_plans` |
| POST | `/api/data-updates/plans` | `data_updates_create_plan` |
| GET | `/api/data-updates/plans/{plan_id:path}` | `data_updates_plan` |
| GET | `/api/data-updates/publications` | `data_updates_publications` |
| POST | `/api/data-updates/rollback/{publication_id:path}` | `data_updates_rollback` |
| GET | `/api/data-updates/sources` | `data_updates_sources` |
| GET | `/api/data-updates/v2/dashboard` | `data_updates_dashboard_v2` |
| GET | `/api/data-updates/v2/jobs/{job_id}/diff` | `data_updates_job_diff_v2` |
| POST | `/api/data-updates/v2/plan-preview` | `data_updates_plan_preview_v2` |
| GET | `/api/data-updates/v2/preflight` | `data_updates_preflight_v2` |
| GET | `/api/data-updates/v2/sources/{source_id}` | `data_updates_source_detail_v2` |
| GET | `/api/diagnostics/{iso3}` | `diagnostics_all` |
| GET | `/api/diagnostics/{iso3}/{code}` | `diagnostics` |
| GET | `/api/economy-finance/bready` | `bready_root` |
| GET | `/api/economy-finance/bready/` | `bready_root` |
| GET | `/api/economy-finance/bready/compare` | `bready_compare` |
| GET | `/api/economy-finance/bready/dimensions` | `bready_dimensions` |
| GET | `/api/economy-finance/bready/economies/{iso3}` | `bready_economy` |
| GET | `/api/economy-finance/bready/economies/{iso3}/series` | `bready_economy_series` |
| GET | `/api/economy-finance/bready/editions` | `bready_editions` |
| GET | `/api/economy-finance/bready/health` | `bready_health` |
| GET | `/api/economy-finance/bready/matrix` | `bready_matrix` |
| GET | `/api/economy-finance/bready/meta` | `bready_meta` |
| GET | `/api/economy-finance/bready/provenance` | `bready_provenance` |
| GET | `/api/economy-finance/bready/ranking` | `bready_ranking` |
| GET | `/api/economy-finance/bready/ranking.csv` | `bready_ranking_csv` |
| GET | `/api/economy-finance/bready/verify` | `bready_verify` |
| GET | `/api/economy-finance/eci` | `eci_root` |
| GET | `/api/economy-finance/eci/` | `eci_root` |
| GET | `/api/economy-finance/eci/compare` | `eci_compare` |
| GET | `/api/economy-finance/eci/countries/{iso3}` | `eci_country` |
| GET | `/api/economy-finance/eci/countries/{iso3}/series` | `eci_country_series` |
| GET | `/api/economy-finance/eci/health` | `eci_health` |
| GET | `/api/economy-finance/eci/meta` | `eci_meta` |
| GET | `/api/economy-finance/eci/methodology` | `eci_methodology` |
| GET | `/api/economy-finance/eci/provenance` | `eci_provenance` |
| GET | `/api/economy-finance/eci/ranking` | `eci_ranking` |
| GET | `/api/economy-finance/eci/ranking.csv` | `eci_ranking_csv` |
| GET | `/api/economy-finance/eci/releases` | `eci_releases` |
| GET | `/api/economy-finance/eci/verify` | `eci_verify` |
| GET | `/api/economy-finance/eci/years` | `eci_years` |
| GET | `/api/economy-finance/fdi` | `fdi_root` |
| GET | `/api/economy-finance/fdi/` | `fdi_root` |
| GET | `/api/economy-finance/fdi/architecture` | `fdi_architecture` |
| GET | `/api/economy-finance/fdi/compare` | `fdi_compare` |
| GET | `/api/economy-finance/fdi/countries/{iso3}` | `fdi_country` |
| GET | `/api/economy-finance/fdi/countries/{iso3}/series` | `fdi_country_series` |
| GET | `/api/economy-finance/fdi/health` | `fdi_health` |
| GET | `/api/economy-finance/fdi/indicators` | `fdi_indicators` |
| GET | `/api/economy-finance/fdi/meta` | `fdi_meta` |
| GET | `/api/economy-finance/fdi/methodology` | `fdi_methodology` |
| GET | `/api/economy-finance/fdi/provenance` | `fdi_provenance` |
| GET | `/api/economy-finance/fdi/ranking` | `fdi_ranking` |
| GET | `/api/economy-finance/fdi/ranking.csv` | `fdi_ranking_csv` |
| GET | `/api/economy-finance/fdi/releases` | `fdi_releases` |
| GET | `/api/economy-finance/fdi/verify` | `fdi_verify` |
| GET | `/api/economy-finance/fdi/years` | `fdi_years` |
| GET | `/api/economy-finance/findex` | `findex_root` |
| GET | `/api/economy-finance/findex/` | `findex_root` |
| GET | `/api/economy-finance/findex/compare` | `findex_compare` |
| GET | `/api/economy-finance/findex/dimensions` | `findex_dimensions` |
| GET | `/api/economy-finance/findex/economies/{economy_code}` | `findex_economy` |
| GET | `/api/economy-finance/findex/economies/{economy_code}/series` | `findex_economy_series` |
| GET | `/api/economy-finance/findex/gaps` | `findex_gaps` |
| GET | `/api/economy-finance/findex/health` | `findex_health` |
| GET | `/api/economy-finance/findex/indicators` | `findex_indicators` |
| GET | `/api/economy-finance/findex/meta` | `findex_meta` |
| GET | `/api/economy-finance/findex/methodology` | `findex_methodology` |
| GET | `/api/economy-finance/findex/provenance` | `findex_provenance` |
| GET | `/api/economy-finance/findex/ranking` | `findex_ranking` |
| GET | `/api/economy-finance/findex/ranking.csv` | `findex_ranking_csv` |
| GET | `/api/economy-finance/findex/releases` | `findex_releases` |
| GET | `/api/economy-finance/findex/verify` | `findex_verify` |
| GET | `/api/economy-finance/findex/years` | `findex_years` |
| GET | `/api/economy-finance/kof` | `kof_root` |
| GET | `/api/economy-finance/kof/` | `kof_root` |
| GET | `/api/economy-finance/kof/compare` | `kof_compare` |
| GET | `/api/economy-finance/kof/countries/{iso3}` | `kof_country` |
| GET | `/api/economy-finance/kof/countries/{iso3}/series` | `kof_country_series` |
| GET | `/api/economy-finance/kof/health` | `kof_health` |
| GET | `/api/economy-finance/kof/indicators` | `kof_indicators` |
| GET | `/api/economy-finance/kof/meta` | `kof_meta` |
| GET | `/api/economy-finance/kof/methodology` | `kof_methodology` |
| GET | `/api/economy-finance/kof/provenance` | `kof_provenance` |
| GET | `/api/economy-finance/kof/ranking` | `kof_ranking` |
| GET | `/api/economy-finance/kof/ranking.csv` | `kof_ranking_csv` |
| GET | `/api/economy-finance/kof/releases` | `kof_releases` |
| GET | `/api/economy-finance/kof/verify` | `kof_verify` |
| GET | `/api/economy-finance/kof/years` | `kof_years` |
| GET | `/api/economy-finance/pci` | `pci_root` |
| GET | `/api/economy-finance/pci/` | `pci_root` |
| GET | `/api/economy-finance/pci/compare` | `pci_compare` |
| GET | `/api/economy-finance/pci/components` | `pci_components` |
| GET | `/api/economy-finance/pci/countries/{iso3}` | `pci_country` |
| GET | `/api/economy-finance/pci/countries/{iso3}/series` | `pci_country_series` |
| GET | `/api/economy-finance/pci/health` | `pci_health` |
| GET | `/api/economy-finance/pci/meta` | `pci_meta` |
| GET | `/api/economy-finance/pci/provenance` | `pci_provenance` |
| GET | `/api/economy-finance/pci/ranking` | `pci_ranking` |
| GET | `/api/economy-finance/pci/ranking.csv` | `pci_ranking_csv` |
| GET | `/api/economy-finance/pci/verify` | `pci_verify` |
| GET | `/api/economy-finance/pci/years` | `pci_years` |
| GET | `/api/egdi` | `e_government_development_release` |
| GET | `/api/egdi/country/{iso3}` | `e_government_development_country` |
| GET | `/api/egdi/ranking` | `e_government_development_ranking` |
| GET | `/api/egdi/workspace` | `e_government_development_workspace` |
| GET | `/api/egdi/workspace.csv` | `e_government_development_workspace_export` |
| GET | `/api/environment/epi` | `epi_overview` |
| GET | `/api/environment/epi/components` | `epi_components` |
| GET | `/api/environment/epi/components/{code}` | `epi_component` |
| GET | `/api/environment/epi/components/{code}/ranking` | `epi_component_ranking` |
| GET | `/api/environment/epi/countries/{iso3}` | `epi_country` |
| GET | `/api/environment/epi/health` | `epi_health` |
| GET | `/api/environment/epi/hierarchy` | `epi_hierarchy` |
| GET | `/api/environment/epi/provenance` | `epi_provenance` |
| GET | `/api/environment/epi/ranking` | `epi_ranking` |
| GET | `/api/environment/epi/ranking.csv` | `epi_ranking_csv` |
| GET | `/api/environment/epi/regions` | `epi_regions` |
| GET | `/api/environment/eti-transition` | `eti_transition_overview` |
| GET | `/api/environment/eti-transition/compare` | `eti_transition_compare` |
| GET | `/api/environment/eti-transition/components` | `eti_transition_components` |
| GET | `/api/environment/eti-transition/components/{code}` | `eti_transition_component` |
| GET | `/api/environment/eti-transition/countries/{iso3}` | `eti_transition_country` |
| GET | `/api/environment/eti-transition/groups` | `eti_transition_groups` |
| GET | `/api/environment/eti-transition/health` | `eti_transition_health` |
| GET | `/api/environment/eti-transition/hierarchy` | `eti_transition_hierarchy` |
| GET | `/api/environment/eti-transition/matrix` | `eti_transition_matrix` |
| GET | `/api/environment/eti-transition/provenance` | `eti_transition_provenance` |
| GET | `/api/environment/eti-transition/ranking` | `eti_transition_ranking` |
| GET | `/api/environment/eti-transition/ranking.csv` | `eti_transition_ranking_csv` |
| GET | `/api/environment/eti-transition/release` | `eti_transition_release` |
| GET | `/api/environment/nd-gain` | `nd_gain_overview` |
| GET | `/api/environment/nd-gain/countries/{iso3}` | `nd_gain_country` |
| GET | `/api/environment/nd-gain/health` | `nd_gain_health` |
| GET | `/api/environment/nd-gain/matrix` | `nd_gain_matrix` |
| GET | `/api/environment/nd-gain/metrics` | `nd_gain_metrics` |
| GET | `/api/environment/nd-gain/official-release` | `nd_gain_official_release` |
| GET | `/api/environment/nd-gain/provenance` | `nd_gain_provenance` |
| GET | `/api/environment/nd-gain/ranking` | `nd_gain_ranking` |
| GET | `/api/environment/nd-gain/ranking.csv` | `nd_gain_ranking_csv` |
| GET | `/api/environment/nd-gain/regions` | `nd_gain_regions` |
| GET | `/api/environment/nd-gain/trends` | `nd_gain_trends` |
| GET | `/api/environment/nd-gain/years` | `nd_gain_years` |
| GET | `/api/environment/world-risk` | `world_risk_overview` |
| GET | `/api/environment/world-risk/compare` | `world_risk_compare` |
| GET | `/api/environment/world-risk/components` | `world_risk_components` |
| GET | `/api/environment/world-risk/components/{code}` | `world_risk_component` |
| GET | `/api/environment/world-risk/components/{code}/ranking` | `world_risk_component_ranking` |
| GET | `/api/environment/world-risk/countries/{iso3}` | `world_risk_country` |
| GET | `/api/environment/world-risk/countries/{iso3}/indicators` | `world_risk_country_indicators` |
| GET | `/api/environment/world-risk/health` | `world_risk_health` |
| GET | `/api/environment/world-risk/hierarchy` | `world_risk_hierarchy` |
| GET | `/api/environment/world-risk/matrix` | `world_risk_matrix` |
| GET | `/api/environment/world-risk/provenance` | `world_risk_provenance` |
| GET | `/api/environment/world-risk/ranking` | `world_risk_ranking` |
| GET | `/api/environment/world-risk/ranking.csv` | `world_risk_ranking_csv` |
| GET | `/api/environment/world-risk/regions` | `world_risk_regions` |
| GET | `/api/environment/world-risk/release` | `world_risk_release` |
| GET | `/api/environment/world-risk/trends` | `world_risk_trends` |
| GET | `/api/environment/world-risk/years` | `world_risk_years` |
| GET | `/api/export/country/{iso3}/brief` | `country_brief` |
| GET | `/api/gari` | `government_ai_readiness_release` |
| GET | `/api/gari/country/{iso3}` | `government_ai_readiness_country` |
| GET | `/api/gari/ranking` | `government_ai_readiness_ranking` |
| GET | `/api/gari/workspace` | `government_ai_readiness_workspace` |
| GET | `/api/gari/workspace.csv` | `government_ai_readiness_workspace_export` |
| GET | `/api/gci` | `global_cybersecurity_release` |
| GET | `/api/gci/countries` | `global_cybersecurity_countries` |
| GET | `/api/gci/country/{iso3}` | `global_cybersecurity_country` |
| GET | `/api/gci/ranking` | `global_cybersecurity_score_order` |
| GET | `/api/gci/tiers` | `global_cybersecurity_tiers` |
| GET | `/api/gci/workspace` | `global_cybersecurity_workspace` |
| GET | `/api/gci/workspace.csv` | `global_cybersecurity_workspace_export` |
| GET | `/api/gender-gap/audit` | `get_audit` |
| GET | `/api/gender-gap/country/{iso3}` | `get_country` |
| GET | `/api/gender-gap/country/{iso3}/series` | `get_country_series` |
| GET | `/api/gender-gap/indicator/{indicator_code}/series` | `get_indicator_series` |
| GET | `/api/gender-gap/indicators` | `get_indicators` |
| GET | `/api/gender-gap/metadata` | `get_metadata` |
| GET | `/api/gender-gap/ranking` | `get_ranking` |
| GET | `/api/gender-gap/releases` | `get_releases` |
| GET | `/api/gender-gap/status` | `get_status` |
| GET | `/api/gender-gap/subindexes` | `get_subindexes` |
| GET | `/api/gender-gap/years` | `get_years` |
| GET | `/api/global-gender-gap/audit` | `get_audit` |
| GET | `/api/global-gender-gap/country/{iso3}` | `get_country` |
| GET | `/api/global-gender-gap/country/{iso3}/series` | `get_country_series` |
| GET | `/api/global-gender-gap/indicator/{indicator_code}/series` | `get_indicator_series` |
| GET | `/api/global-gender-gap/indicators` | `get_indicators` |
| GET | `/api/global-gender-gap/metadata` | `get_metadata` |
| GET | `/api/global-gender-gap/ranking` | `get_ranking` |
| GET | `/api/global-gender-gap/releases` | `get_releases` |
| GET | `/api/global-gender-gap/status` | `get_status` |
| GET | `/api/global-gender-gap/subindexes` | `get_subindexes` |
| GET | `/api/global-gender-gap/years` | `get_years` |
| GET | `/api/governance/external-reviews` | `governance_external_reviews` |
| GET | `/api/governance/licenses` | `governance_licenses_alias` |
| GET | `/api/happiness/audit` | `get_audit` |
| GET | `/api/happiness/country/{iso3}` | `get_country` |
| GET | `/api/happiness/country/{iso3}/series` | `get_country_series` |
| GET | `/api/happiness/entity/{entity_key:path}` | `get_entity` |
| GET | `/api/happiness/factors` | `get_factors` |
| GET | `/api/happiness/metadata` | `get_metadata` |
| GET | `/api/happiness/ranking` | `get_ranking` |
| GET | `/api/happiness/releases` | `get_releases` |
| GET | `/api/happiness/status` | `get_status` |
| GET | `/api/happiness/years` | `get_years` |
| GET | `/api/health` | `health` |
| GET | `/api/htei/model` | `htei_model` |
| GET | `/api/htei/v5` | `htei_v5_root` |
| GET | `/api/htei/v5/audit` | `htei_v5_audit` |
| GET | `/api/htei/v5/profile/{iso3}` | `htei_v5_profile` |
| GET | `/api/htei/v5/ranking` | `htei_v5_ranking` |
| GET | `/api/htei/v5/validation` | `htei_v5_validation` |
| GET | `/api/htei/v6` | `htei_v6_root` |
| GET | `/api/htei/v6/profile/{iso3}` | `htei_v6_profile_endpoint` |
| GET | `/api/htei/v6/ranking` | `htei_v6_ranking_endpoint` |
| GET | `/api/htei/workspace` | `htei_workspace` |
| GET | `/api/htei/workspace.csv` | `htei_workspace_export` |
| GET | `/api/human-capital/combined/{iso3}` | `human_capital_combined_endpoint` |
| GET | `/api/i18n/catalog` | `i18n_catalog` |
| GET | `/api/index-methodology` | `index_methodology_alias` |
| GET | `/api/index-methodology/{code}` | `index_methodology_by_code` |
| GET | `/api/index/{code}` | `index` |
| GET | `/api/index/{code}/components` | `index_components` |
| GET | `/api/index/{code}/details` | `index_score_details` |
| GET | `/api/index/{code}/explainer` | `index_explainer` |
| GET | `/api/index/{code}/formula` | `index_formula` |
| GET | `/api/index/{code}/ranking` | `index_ranking` |
| GET | `/api/index/{code}/workspace` | `standard_index_workspace` |
| GET | `/api/index/{code}/workspace.csv` | `standard_index_workspace_export` |
| GET | `/api/indices` | `indices` |
| GET | `/api/iqi` | `cloudflare_iqi_release` |
| GET | `/api/iqi/countries` | `cloudflare_iqi_countries` |
| GET | `/api/iqi/country/{iso3}` | `cloudflare_iqi_country` |
| GET | `/api/iqi/metrics` | `cloudflare_iqi_metrics` |
| GET | `/api/iqi/ranking` | `cloudflare_iqi_ranking_rejected` |
| GET | `/api/iqi/releases` | `cloudflare_iqi_releases` |
| GET | `/api/iqi/status` | `cloudflare_iqi_status` |
| GET | `/api/iqi/workspace` | `cloudflare_iqi_workspace` |
| GET | `/api/iqi/workspace.csv` | `cloudflare_iqi_workspace_export` |
| GET | `/api/landing-summary` | `landing_summary` |
| GET | `/api/legal/licenses` | `legal_source_registry` |
| GET | `/api/methodology/registry` | `methodology_registry` |
| GET | `/api/methodology/summary` | `methodology_summary` |
| GET | `/api/nri` | `network_readiness_release` |
| GET | `/api/nri/country/{iso3}` | `network_readiness_country` |
| GET | `/api/nri/ranking` | `network_readiness_ranking` |
| GET | `/api/nri/workspace` | `network_readiness_workspace` |
| GET | `/api/nri/workspace.csv` | `network_readiness_workspace_export` |
| GET | `/api/operations/status` | `operations_status` |
| GET | `/api/pisa-school-knowledge/entity/{entity_code}` | `pisa_school_knowledge_entity` |
| GET | `/api/pisa-school-knowledge/methodology` | `pisa_school_knowledge_methodology` |
| GET | `/api/pisa-school-knowledge/provenance/{value_id:path}` | `pisa_school_knowledge_provenance` |
| GET | `/api/pisa-school-knowledge/ranking` | `pisa_school_knowledge_ranking` |
| GET | `/api/pisa-school-knowledge/status` | `pisa_school_knowledge_status` |
| GET | `/api/pisa-school-knowledge/trends/{entity_code}` | `pisa_school_knowledge_trends` |
| GET | `/api/platform-context` | `platform_context` |
| GET | `/api/policy-brief/{iso3}` | `policy_brief_alias` |
| GET | `/api/policy/russia` | `russia_policy_brief` |
| GET | `/api/policy/russia/export.csv` | `policy_russia_export` |
| GET | `/api/policy/russia/workspace` | `policy_russia_workspace` |
| GET | `/api/press-freedom/audit` | `get_audit` |
| GET | `/api/press-freedom/country/{iso3}` | `get_country` |
| GET | `/api/press-freedom/country/{iso3}/series` | `get_country_series` |
| GET | `/api/press-freedom/entity/{entity_key:path}` | `get_entity` |
| GET | `/api/press-freedom/indicator/{indicator_code}/country/{iso3}/series` | `get_indicator_country_series` |
| GET | `/api/press-freedom/indicators` | `get_indicators` |
| GET | `/api/press-freedom/metadata` | `get_metadata` |
| GET | `/api/press-freedom/ranking` | `get_ranking` |
| GET | `/api/press-freedom/regions` | `get_regions` |
| GET | `/api/press-freedom/releases` | `get_releases` |
| GET | `/api/press-freedom/status` | `get_status` |
| GET | `/api/press-freedom/years` | `get_years` |
| GET | `/api/provenance/value/{value_id:path}` | `provenance_value` |
| GET | `/api/qs/{iso3}` | `qs_country` |
| POST | `/api/refresh/{source_code}` | `refresh` |
| GET | `/api/release/readiness` | `release_readiness` |
| GET | `/api/rule-of-law/audit` | `get_audit` |
| GET | `/api/rule-of-law/country/{iso3}` | `get_country` |
| GET | `/api/rule-of-law/country/{iso3}/series` | `get_country_series` |
| GET | `/api/rule-of-law/factor/{factor_code}/country/{iso3}/series` | `get_factor_series` |
| GET | `/api/rule-of-law/factors` | `get_factors` |
| GET | `/api/rule-of-law/metadata` | `get_metadata` |
| GET | `/api/rule-of-law/periods` | `get_periods` |
| GET | `/api/rule-of-law/ranking` | `get_ranking` |
| GET | `/api/rule-of-law/releases` | `get_releases` |
| GET | `/api/rule-of-law/status` | `get_status` |
| GET | `/api/rule-of-law/subfactor/{subfactor_code}/country/{iso3}/series` | `get_subfactor_series` |
| GET | `/api/rule-of-law/subfactors` | `get_subfactors` |
| GET | `/api/sdg/audit` | `get_audit` |
| GET | `/api/sdg/country/{iso3}` | `get_country` |
| GET | `/api/sdg/country/{iso3}/series` | `get_country_series` |
| GET | `/api/sdg/goals` | `get_goals` |
| GET | `/api/sdg/indicator/{indicator_code}/series` | `get_indicator_series` |
| GET | `/api/sdg/indicators` | `get_indicators` |
| GET | `/api/sdg/metadata` | `get_metadata` |
| GET | `/api/sdg/ranking` | `get_ranking` |
| GET | `/api/sdg/releases` | `get_releases` |
| GET | `/api/sdg/status` | `get_status` |
| GET | `/api/sdg/years` | `get_years` |
| GET | `/api/security-connectivity/dhl-gci` | `overview` |
| GET | `/api/security-connectivity/dhl-gci/countries/{iso3}` | `country_profile` |
| GET | `/api/security-connectivity/dhl-gci/export.csv` | `export_csv` |
| GET | `/api/security-connectivity/dhl-gci/health` | `health` |
| GET | `/api/security-connectivity/dhl-gci/license` | `license_status` |
| GET | `/api/security-connectivity/dhl-gci/methodology` | `methodology` |
| GET | `/api/security-connectivity/dhl-gci/pillars` | `pillars` |
| GET | `/api/security-connectivity/dhl-gci/ranking` | `ranking` |
| GET | `/api/security-connectivity/dhl-gci/releases` | `releases` |
| GET | `/api/security-connectivity/dhl-gci/trend` | `trend` |
| GET | `/api/security-connectivity/gmi` | `gmi_overview` |
| GET | `/api/security-connectivity/gmi/countries/{iso3}` | `gmi_country` |
| GET | `/api/security-connectivity/gmi/export.csv` | `gmi_export_csv` |
| GET | `/api/security-connectivity/gmi/health` | `gmi_health` |
| GET | `/api/security-connectivity/gmi/methodology` | `gmi_methodology` |
| GET | `/api/security-connectivity/gmi/ranking` | `gmi_ranking` |
| GET | `/api/security-connectivity/gmi/releases` | `gmi_releases` |
| GET | `/api/security-connectivity/gmi/reports` | `gmi_reports` |
| GET | `/api/security-connectivity/goci` | `goci_overview` |
| GET | `/api/security-connectivity/goci/countries/{iso3}` | `goci_country` |
| GET | `/api/security-connectivity/goci/dataset` | `goci_dataset` |
| GET | `/api/security-connectivity/goci/export.csv` | `goci_export_csv` |
| GET | `/api/security-connectivity/goci/health` | `goci_health` |
| GET | `/api/security-connectivity/goci/indicators` | `goci_indicators` |
| GET | `/api/security-connectivity/goci/methodology` | `goci_methodology` |
| GET | `/api/security-connectivity/goci/ranking` | `goci_ranking` |
| GET | `/api/security-connectivity/goci/releases` | `goci_releases` |
| GET | `/api/security-connectivity/gpi` | `gpi_overview` |
| GET | `/api/security-connectivity/gpi/countries/{iso3}` | `gpi_country` |
| GET | `/api/security-connectivity/gpi/export.csv` | `gpi_export_csv` |
| GET | `/api/security-connectivity/gpi/health` | `gpi_health` |
| GET | `/api/security-connectivity/gpi/methodology` | `gpi_methodology` |
| GET | `/api/security-connectivity/gpi/ranking` | `gpi_ranking` |
| GET | `/api/security-connectivity/gpi/releases` | `gpi_releases` |
| GET | `/api/security-connectivity/sipri-milex` | `overview` |
| GET | `/api/security-connectivity/sipri-milex/countries/{iso3}` | `country_profile` |
| GET | `/api/security-connectivity/sipri-milex/export.csv` | `export_csv` |
| GET | `/api/security-connectivity/sipri-milex/health` | `health` |
| GET | `/api/security-connectivity/sipri-milex/license` | `license_status` |
| GET | `/api/security-connectivity/sipri-milex/methodology` | `methodology` |
| GET | `/api/security-connectivity/sipri-milex/ranking` | `ranking` |
| GET | `/api/security-connectivity/sipri-milex/releases` | `releases` |
| GET | `/api/security-connectivity/sipri-milex/series` | `series` |
| GET | `/api/security-connectivity/sipri-milex/trend` | `trend` |
| GET | `/api/security-connectivity/unctad-lsci` | `overview` |
| GET | `/api/security-connectivity/unctad-lsci/countries/{identifier}` | `country_profile` |
| GET | `/api/security-connectivity/unctad-lsci/dataset` | `dataset` |
| GET | `/api/security-connectivity/unctad-lsci/export.csv` | `export_csv` |
| GET | `/api/security-connectivity/unctad-lsci/health` | `health` |
| GET | `/api/security-connectivity/unctad-lsci/license` | `license_info` |
| GET | `/api/security-connectivity/unctad-lsci/methodology` | `methodology` |
| GET | `/api/security-connectivity/unctad-lsci/ranking` | `ranking` |
| GET | `/api/security-connectivity/unctad-lsci/releases` | `releases` |
| GET | `/api/security-connectivity/unctad-lsci/trend` | `trend` |
| GET | `/api/security-connectivity/world-bank-lpi` | `overview` |
| GET | `/api/security-connectivity/world-bank-lpi/export.csv` | `export_csv` |
| GET | `/api/security-connectivity/world-bank-lpi/health` | `health` |
| GET | `/api/security-connectivity/world-bank-lpi/indicators` | `indicators` |
| GET | `/api/security-connectivity/world-bank-lpi/legacy/countries/{iso3}` | `legacy_country` |
| GET | `/api/security-connectivity/world-bank-lpi/legacy/ranking` | `legacy_ranking` |
| GET | `/api/security-connectivity/world-bank-lpi/legacy/trend` | `legacy_trend` |
| GET | `/api/security-connectivity/world-bank-lpi/license` | `license_record` |
| GET | `/api/security-connectivity/world-bank-lpi/lpi2/countries/{iso3}` | `lpi2_country` |
| GET | `/api/security-connectivity/world-bank-lpi/lpi2/dataset` | `lpi2_dataset` |
| GET | `/api/security-connectivity/world-bank-lpi/lpi2/ranking` | `lpi2_ranking` |
| GET | `/api/security-connectivity/world-bank-lpi/methodology` | `methodology` |
| GET | `/api/security-connectivity/world-bank-lpi/releases` | `releases` |
| GET | `/api/social-progress/audit` | `get_audit` |
| GET | `/api/social-progress/country/{iso3}` | `get_country` |
| GET | `/api/social-progress/country/{iso3}/series` | `get_country_series` |
| GET | `/api/social-progress/metadata` | `get_metadata` |
| GET | `/api/social-progress/ranking` | `get_ranking` |
| GET | `/api/social-progress/releases` | `get_releases` |
| GET | `/api/social-progress/status` | `get_status` |
| GET | `/api/social-progress/years` | `get_years` |
| GET | `/api/source-registry` | `source_registry` |
| GET | `/api/sources` | `sources` |
| GET | `/api/sustainable-development/audit` | `get_audit` |
| GET | `/api/sustainable-development/country/{iso3}` | `get_country` |
| GET | `/api/sustainable-development/country/{iso3}/series` | `get_country_series` |
| GET | `/api/sustainable-development/goals` | `get_goals` |
| GET | `/api/sustainable-development/indicator/{indicator_code}/series` | `get_indicator_series` |
| GET | `/api/sustainable-development/indicators` | `get_indicators` |
| GET | `/api/sustainable-development/metadata` | `get_metadata` |
| GET | `/api/sustainable-development/ranking` | `get_ranking` |
| GET | `/api/sustainable-development/releases` | `get_releases` |
| GET | `/api/sustainable-development/status` | `get_status` |
| GET | `/api/sustainable-development/years` | `get_years` |
| GET | `/api/the-engineering/countries` | `the_engineering_countries` |
| GET | `/api/the-engineering/country/{iso3}` | `the_engineering_country` |
| GET | `/api/the-engineering/institutions` | `the_engineering_institutions` |
| GET | `/api/the-engineering/methodology` | `the_engineering_methodology` |
| GET | `/api/the-engineering/provenance/{value_id:path}` | `the_engineering_provenance` |
| GET | `/api/the-engineering/status` | `the_engineering_status` |
| GET | `/api/top500` | `top500_release` |
| GET | `/api/top500/audit` | `top500_crosslist_audit` |
| GET | `/api/top500/countries` | `top500_countries` |
| GET | `/api/top500/country/{iso3}` | `top500_country` |
| GET | `/api/top500/green500` | `green500_systems` |
| GET | `/api/top500/ranking` | `top500_country_order` |
| GET | `/api/top500/system/{system_id}` | `top500_system` |
| GET | `/api/top500/systems` | `top500_systems` |
| GET | `/api/top500/workspace` | `top500_workspace` |
| GET | `/api/top500/workspace.csv` | `top500_workspace_export` |
| GET | `/api/training-competitiveness` | `training_competitiveness` |
| GET | `/api/training-competitiveness/ranking` | `training_competitiveness_ranking` |
| GET | `/api/training/workspace` | `training_workspace` |
| GET | `/api/training/workspace/export.csv` | `training_workspace_export` |
| GET | `/api/uhc-service-coverage/aggregate/{ref_area}` | `get_aggregate` |
| GET | `/api/uhc-service-coverage/audit` | `get_audit` |
| GET | `/api/uhc-service-coverage/country/{iso3}` | `get_country` |
| GET | `/api/uhc-service-coverage/country/{iso3}/series` | `get_country_series` |
| GET | `/api/uhc-service-coverage/domains` | `get_domains` |
| GET | `/api/uhc-service-coverage/metadata` | `get_metadata` |
| GET | `/api/uhc-service-coverage/ranking` | `get_ranking` |
| GET | `/api/uhc-service-coverage/releases` | `get_releases` |
| GET | `/api/uhc-service-coverage/status` | `get_status` |
| GET | `/api/uhc-service-coverage/tracers` | `get_tracers` |
| GET | `/api/uhc-service-coverage/years` | `get_years` |
| GET | `/api/uhc/aggregate/{ref_area}` | `get_aggregate` |
| GET | `/api/uhc/audit` | `get_audit` |
| GET | `/api/uhc/country/{iso3}` | `get_country` |
| GET | `/api/uhc/country/{iso3}/series` | `get_country_series` |
| GET | `/api/uhc/domains` | `get_domains` |
| GET | `/api/uhc/metadata` | `get_metadata` |
| GET | `/api/uhc/ranking` | `get_ranking` |
| GET | `/api/uhc/releases` | `get_releases` |
| GET | `/api/uhc/status` | `get_status` |
| GET | `/api/uhc/tracers` | `get_tracers` |
| GET | `/api/uhc/years` | `get_years` |
| GET | `/api/universities/geography/status` | `university_geography_status` |
| GET | `/api/universities/location/{location_id:path}` | `university_location_provenance` |
| GET | `/api/universities/map` | `university_geography_map` |
| GET | `/api/v1/indices/cpi/audit` | `get_audit` |
| GET | `/api/v1/indices/cpi/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/cpi/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/cpi/metadata` | `get_metadata` |
| GET | `/api/v1/indices/cpi/ranking` | `get_ranking` |
| GET | `/api/v1/indices/cpi/regions` | `get_regions` |
| GET | `/api/v1/indices/cpi/releases` | `get_releases` |
| GET | `/api/v1/indices/cpi/significant-changes` | `get_significant_changes` |
| GET | `/api/v1/indices/cpi/source/{source_code}/country/{iso3}/series` | `get_source_country_series` |
| GET | `/api/v1/indices/cpi/sources` | `get_sources` |
| GET | `/api/v1/indices/cpi/status` | `get_status` |
| GET | `/api/v1/indices/cpi/years` | `get_years` |
| GET | `/api/v1/indices/gggi/audit` | `get_audit` |
| GET | `/api/v1/indices/gggi/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/gggi/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/gggi/indicator/{indicator_code}/series` | `get_indicator_series` |
| GET | `/api/v1/indices/gggi/indicators` | `get_indicators` |
| GET | `/api/v1/indices/gggi/metadata` | `get_metadata` |
| GET | `/api/v1/indices/gggi/ranking` | `get_ranking` |
| GET | `/api/v1/indices/gggi/releases` | `get_releases` |
| GET | `/api/v1/indices/gggi/status` | `get_status` |
| GET | `/api/v1/indices/gggi/subindexes` | `get_subindexes` |
| GET | `/api/v1/indices/gggi/years` | `get_years` |
| GET | `/api/v1/indices/roli/audit` | `get_audit` |
| GET | `/api/v1/indices/roli/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/roli/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/roli/factor/{factor_code}/country/{iso3}/series` | `get_factor_series` |
| GET | `/api/v1/indices/roli/factors` | `get_factors` |
| GET | `/api/v1/indices/roli/metadata` | `get_metadata` |
| GET | `/api/v1/indices/roli/periods` | `get_periods` |
| GET | `/api/v1/indices/roli/ranking` | `get_ranking` |
| GET | `/api/v1/indices/roli/releases` | `get_releases` |
| GET | `/api/v1/indices/roli/status` | `get_status` |
| GET | `/api/v1/indices/roli/subfactor/{subfactor_code}/country/{iso3}/series` | `get_subfactor_series` |
| GET | `/api/v1/indices/roli/subfactors` | `get_subfactors` |
| GET | `/api/v1/indices/sdg/audit` | `get_audit` |
| GET | `/api/v1/indices/sdg/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/sdg/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/sdg/goals` | `get_goals` |
| GET | `/api/v1/indices/sdg/indicator/{indicator_code}/series` | `get_indicator_series` |
| GET | `/api/v1/indices/sdg/indicators` | `get_indicators` |
| GET | `/api/v1/indices/sdg/metadata` | `get_metadata` |
| GET | `/api/v1/indices/sdg/ranking` | `get_ranking` |
| GET | `/api/v1/indices/sdg/releases` | `get_releases` |
| GET | `/api/v1/indices/sdg/status` | `get_status` |
| GET | `/api/v1/indices/sdg/years` | `get_years` |
| GET | `/api/v1/indices/spi/audit` | `get_audit` |
| GET | `/api/v1/indices/spi/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/spi/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/spi/metadata` | `get_metadata` |
| GET | `/api/v1/indices/spi/ranking` | `get_ranking` |
| GET | `/api/v1/indices/spi/releases` | `get_releases` |
| GET | `/api/v1/indices/spi/status` | `get_status` |
| GET | `/api/v1/indices/spi/years` | `get_years` |
| GET | `/api/v1/indices/uhc-sci/aggregate/{ref_area}` | `get_aggregate` |
| GET | `/api/v1/indices/uhc-sci/audit` | `get_audit` |
| GET | `/api/v1/indices/uhc-sci/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/uhc-sci/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/uhc-sci/domains` | `get_domains` |
| GET | `/api/v1/indices/uhc-sci/metadata` | `get_metadata` |
| GET | `/api/v1/indices/uhc-sci/ranking` | `get_ranking` |
| GET | `/api/v1/indices/uhc-sci/releases` | `get_releases` |
| GET | `/api/v1/indices/uhc-sci/status` | `get_status` |
| GET | `/api/v1/indices/uhc-sci/tracers` | `get_tracers` |
| GET | `/api/v1/indices/uhc-sci/years` | `get_years` |
| GET | `/api/v1/indices/whr/audit` | `get_audit` |
| GET | `/api/v1/indices/whr/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/whr/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/whr/entity/{entity_key:path}` | `get_entity` |
| GET | `/api/v1/indices/whr/factors` | `get_factors` |
| GET | `/api/v1/indices/whr/metadata` | `get_metadata` |
| GET | `/api/v1/indices/whr/ranking` | `get_ranking` |
| GET | `/api/v1/indices/whr/releases` | `get_releases` |
| GET | `/api/v1/indices/whr/status` | `get_status` |
| GET | `/api/v1/indices/whr/years` | `get_years` |
| GET | `/api/v1/indices/wpfi/audit` | `get_audit` |
| GET | `/api/v1/indices/wpfi/country/{iso3}` | `get_country` |
| GET | `/api/v1/indices/wpfi/country/{iso3}/series` | `get_country_series` |
| GET | `/api/v1/indices/wpfi/entity/{entity_key:path}` | `get_entity` |
| GET | `/api/v1/indices/wpfi/indicator/{indicator_code}/country/{iso3}/series` | `get_indicator_country_series` |
| GET | `/api/v1/indices/wpfi/indicators` | `get_indicators` |
| GET | `/api/v1/indices/wpfi/metadata` | `get_metadata` |
| GET | `/api/v1/indices/wpfi/ranking` | `get_ranking` |
| GET | `/api/v1/indices/wpfi/regions` | `get_regions` |
| GET | `/api/v1/indices/wpfi/releases` | `get_releases` |
| GET | `/api/v1/indices/wpfi/status` | `get_status` |
| GET | `/api/v1/indices/wpfi/years` | `get_years` |
| GET | `/api/vdem/dimensions` | `vdem_dimensions` |
| GET | `/api/vdem/polities` | `vdem_polities` |
| GET | `/api/wgi/dimensions` | `wgi_dimensions` |
| GET | `/api/wgi/sources` | `wgi_sources` |
| GET | `/api/wjp-rule-of-law/audit` | `get_audit` |
| GET | `/api/wjp-rule-of-law/country/{iso3}` | `get_country` |
| GET | `/api/wjp-rule-of-law/country/{iso3}/series` | `get_country_series` |
| GET | `/api/wjp-rule-of-law/factor/{factor_code}/country/{iso3}/series` | `get_factor_series` |
| GET | `/api/wjp-rule-of-law/factors` | `get_factors` |
| GET | `/api/wjp-rule-of-law/metadata` | `get_metadata` |
| GET | `/api/wjp-rule-of-law/periods` | `get_periods` |
| GET | `/api/wjp-rule-of-law/ranking` | `get_ranking` |
| GET | `/api/wjp-rule-of-law/releases` | `get_releases` |
| GET | `/api/wjp-rule-of-law/status` | `get_status` |
| GET | `/api/wjp-rule-of-law/subfactor/{subfactor_code}/country/{iso3}/series` | `get_subfactor_series` |
| GET | `/api/wjp-rule-of-law/subfactors` | `get_subfactors` |
| GET | `/api/world-happiness/audit` | `get_audit` |
| GET | `/api/world-happiness/country/{iso3}` | `get_country` |
| GET | `/api/world-happiness/country/{iso3}/series` | `get_country_series` |
| GET | `/api/world-happiness/entity/{entity_key:path}` | `get_entity` |
| GET | `/api/world-happiness/factors` | `get_factors` |
| GET | `/api/world-happiness/metadata` | `get_metadata` |
| GET | `/api/world-happiness/ranking` | `get_ranking` |
| GET | `/api/world-happiness/releases` | `get_releases` |
| GET | `/api/world-happiness/status` | `get_status` |
| GET | `/api/world-happiness/years` | `get_years` |
| GET | `/api/world-press-freedom/audit` | `get_audit` |
| GET | `/api/world-press-freedom/country/{iso3}` | `get_country` |
| GET | `/api/world-press-freedom/country/{iso3}/series` | `get_country_series` |
| GET | `/api/world-press-freedom/entity/{entity_key:path}` | `get_entity` |
| GET | `/api/world-press-freedom/indicator/{indicator_code}/country/{iso3}/series` | `get_indicator_country_series` |
| GET | `/api/world-press-freedom/indicators` | `get_indicators` |
| GET | `/api/world-press-freedom/metadata` | `get_metadata` |
| GET | `/api/world-press-freedom/ranking` | `get_ranking` |
| GET | `/api/world-press-freedom/regions` | `get_regions` |
| GET | `/api/world-press-freedom/releases` | `get_releases` |
| GET | `/api/world-press-freedom/status` | `get_status` |
| GET | `/api/world-press-freedom/years` | `get_years` |
| GET | `/data` | `data_lab_alias` |
| GET | `/data-explorer` | `data_explorer_page` |
| GET | `/data-lab` | `data_lab_page` |
| GET | `/docs` | `swagger_ui_html` |
| GET | `/docs/oauth2-redirect` | `swagger_ui_redirect` |
| GET | `/openapi.json` | `openapi` |
| GET | `/personal-data-consent` | `personal_data_consent` |
| GET | `/redoc` | `redoc_html` |
| — | `/static` | `static` |
| GET | `/world.geojson` | `world_geojson` |

## Appendix G. SQLite data dictionary

| No. | Table |
|---:|---|
| 1 | `aipi_benchmarks` |
| 2 | `aipi_country_scores` |
| 3 | `aipi_dimension_values` |
| 4 | `aipi_dimensions` |
| 5 | `aipi_ingestion_runs` |
| 6 | `arwu_import_registry` |
| 7 | `arwu_institution_rankings` |
| 8 | `bready_economies` |
| 9 | `bready_ingestion_runs` |
| 10 | `bready_releases` |
| 11 | `bready_schema_meta` |
| 12 | `bready_scores` |
| 13 | `bready_source_rows` |
| 14 | `cf_iqi_ingestion_runs` |
| 15 | `cf_iqi_location_status` |
| 16 | `cf_iqi_metrics` |
| 17 | `cf_iqi_observations` |
| 18 | `cf_iqi_releases` |
| 19 | `component_values` |
| 20 | `components` |
| 21 | `corporate_metrics` |
| 22 | `countries` |
| 23 | `cpi_backend_metadata` |
| 24 | `cpi_entities` |
| 25 | `cpi_import_issues` |
| 26 | `cpi_published_releases` |
| 27 | `cpi_region_catalog` |
| 28 | `cpi_region_results` |
| 29 | `cpi_releases` |
| 30 | `cpi_results` |
| 31 | `cpi_schema_meta` |
| 32 | `cpi_significant_changes` |
| 33 | `cpi_source_catalog` |
| 34 | `cpi_source_scores` |
| 35 | `dhl_gci_import_runs` |
| 36 | `dhl_gci_permissions` |
| 37 | `dhl_gci_pillars` |
| 38 | `dhl_gci_releases` |
| 39 | `dhl_gci_scores` |
| 40 | `diagnostics` |
| 41 | `eci_economies` |
| 42 | `eci_ingestion_runs` |
| 43 | `eci_observations` |
| 44 | `eci_releases` |
| 45 | `eci_schema_meta` |
| 46 | `eci_source_rows` |
| 47 | `egdi_country_metadata` |
| 48 | `egdi_dimension_values` |
| 49 | `egdi_dimensions` |
| 50 | `egdi_ingestion_runs` |
| 51 | `egdi_source_layout_events` |
| 52 | `external_method_reviews` |
| 53 | `fdi_economies` |
| 54 | `fdi_ingestion_runs` |
| 55 | `fdi_observations` |
| 56 | `fdi_releases` |
| 57 | `fdi_schema_meta` |
| 58 | `fdi_source_rows` |
| 59 | `findex_economies` |
| 60 | `findex_indicators` |
| 61 | `findex_ingestion_runs` |
| 62 | `findex_observations` |
| 63 | `findex_releases` |
| 64 | `findex_schema_meta` |
| 65 | `findex_source_rows` |
| 66 | `gari_country_scores` |
| 67 | `gari_dimension_values` |
| 68 | `gari_dimensions` |
| 69 | `gari_ingestion_runs` |
| 70 | `gari_rank_audit_events` |
| 71 | `gci_country_scores` |
| 72 | `gci_dimension_values` |
| 73 | `gci_dimensions` |
| 74 | `gci_ingestion_runs` |
| 75 | `gggi_backend_metadata` |
| 76 | `gggi_entities` |
| 77 | `gggi_import_issues` |
| 78 | `gggi_indicator_catalog` |
| 79 | `gggi_indicator_results` |
| 80 | `gggi_published_releases` |
| 81 | `gggi_releases` |
| 82 | `gggi_results` |
| 83 | `gggi_schema_meta` |
| 84 | `gggi_subindex_catalog` |
| 85 | `gggi_subindex_results` |
| 86 | `gmi_country_scores` |
| 87 | `gmi_import_runs` |
| 88 | `gmi_releases` |
| 89 | `gmi_report_catalog` |
| 90 | `goci_country_scores` |
| 91 | `goci_import_runs` |
| 92 | `goci_indicator_catalog` |
| 93 | `goci_indicator_scores` |
| 94 | `goci_releases` |
| 95 | `gpi_country_scores` |
| 96 | `gpi_import_runs` |
| 97 | `gpi_releases` |
| 98 | `hci_plus_country_scores` |
| 99 | `htei_v5_component_values` |
| 100 | `htei_v5_profiles` |
| 101 | `htei_v6_component_values` |
| 102 | `htei_v6_missingness_audit` |
| 103 | `htei_v6_profiles` |
| 104 | `index_aliases` |
| 105 | `index_components` |
| 106 | `index_definitions` |
| 107 | `index_formulas` |
| 108 | `index_methodology_registry` |
| 109 | `index_scores` |
| 110 | `indices` |
| 111 | `institution_locations` |
| 112 | `kof_economies` |
| 113 | `kof_ingestion_runs` |
| 114 | `kof_observations` |
| 115 | `kof_releases` |
| 116 | `kof_schema_meta` |
| 117 | `kof_source_rows` |
| 118 | `license_registry` |
| 119 | `methodology_audit_runs` |
| 120 | `national_statistics_metrics` |
| 121 | `nri_country_metadata` |
| 122 | `nri_dimension_values` |
| 123 | `nri_dimensions` |
| 124 | `nri_ingestion_runs` |
| 125 | `operational_runs` |
| 126 | `pci_economies` |
| 127 | `pci_ingestion_runs` |
| 128 | `pci_observations` |
| 129 | `pci_releases` |
| 130 | `pci_schema_meta` |
| 131 | `pci_source_rows` |
| 132 | `pisa_domain_results` |
| 133 | `pisa_entity_registry` |
| 134 | `pisa_import_registry` |
| 135 | `pisa_school_knowledge_scores` |
| 136 | `policy_brief_items` |
| 137 | `qs_institution_rankings` |
| 138 | `quality_flags` |
| 139 | `rankings` |
| 140 | `raw_snapshots` |
| 141 | `recommendations` |
| 142 | `reproducibility_artifacts` |
| 143 | `roli_backend_metadata` |
| 144 | `roli_entities` |
| 145 | `roli_factor_catalog` |
| 146 | `roli_factor_results` |
| 147 | `roli_import_issues` |
| 148 | `roli_income_group_catalog` |
| 149 | `roli_published_releases` |
| 150 | `roli_region_catalog` |
| 151 | `roli_releases` |
| 152 | `roli_results` |
| 153 | `roli_schema_meta` |
| 154 | `roli_subfactor_catalog` |
| 155 | `roli_subfactor_results` |
| 156 | `sdg_backend_metadata` |
| 157 | `sdg_country_results` |
| 158 | `sdg_goal_catalog` |
| 159 | `sdg_goal_results` |
| 160 | `sdg_import_issues` |
| 161 | `sdg_indicator_catalog` |
| 162 | `sdg_indicator_values` |
| 163 | `sdg_published_releases` |
| 164 | `sdg_releases` |
| 165 | `sdg_schema_meta` |
| 166 | `sipri_milex_entities` |
| 167 | `sipri_milex_import_runs` |
| 168 | `sipri_milex_permissions` |
| 169 | `sipri_milex_releases` |
| 170 | `sipri_milex_series` |
| 171 | `sipri_milex_values` |
| 172 | `source_observations` |
| 173 | `source_registry` |
| 174 | `spi_backend_metadata` |
| 175 | `spi_import_issues` |
| 176 | `spi_measure_catalog` |
| 177 | `spi_measure_scores` |
| 178 | `spi_published_releases` |
| 179 | `spi_releases` |
| 180 | `spi_schema_meta` |
| 181 | `spi_scores` |
| 182 | `the_engineering_import_registry` |
| 183 | `the_engineering_institution_rankings` |
| 184 | `top500_country_aggregates` |
| 185 | `top500_crosslist_audit_events` |
| 186 | `top500_green_systems` |
| 187 | `top500_ingestion_runs` |
| 188 | `top500_metric_definitions` |
| 189 | `top500_releases` |
| 190 | `top500_systems` |
| 191 | `training_model_components` |
| 192 | `training_model_scores` |
| 193 | `transformation_runs` |
| 194 | `uhc_backend_metadata` |
| 195 | `uhc_domain_catalog` |
| 196 | `uhc_domain_results` |
| 197 | `uhc_entities` |
| 198 | `uhc_import_issues` |
| 199 | `uhc_published_releases` |
| 200 | `uhc_releases` |
| 201 | `uhc_results` |
| 202 | `uhc_schema_meta` |
| 203 | `uhc_tracer_catalog` |
| 204 | `ui_translations` |
| 205 | `unctad_lsci_import_runs` |
| 206 | `unctad_lsci_observations` |
| 207 | `unctad_lsci_releases` |
| 208 | `vdem_index_catalog` |
| 209 | `vdem_index_values` |
| 210 | `vdem_polities` |
| 211 | `vdem_polity_years` |
| 212 | `wb_lpi2_observations` |
| 213 | `wb_lpi_import_runs` |
| 214 | `wb_lpi_indicator_catalog` |
| 215 | `wb_lpi_legacy_scores` |
| 216 | `wb_lpi_releases` |
| 217 | `wgi_dimension_values` |
| 218 | `wgi_source_catalog` |
| 219 | `wgi_source_values` |
| 220 | `whr_backend_metadata` |
| 221 | `whr_entities` |
| 222 | `whr_factor_catalog` |
| 223 | `whr_factor_contributions` |
| 224 | `whr_import_issues` |
| 225 | `whr_published_releases` |
| 226 | `whr_releases` |
| 227 | `whr_results` |
| 228 | `whr_schema_meta` |
| 229 | `wpfi_backend_metadata` |
| 230 | `wpfi_entities` |
| 231 | `wpfi_import_issues` |
| 232 | `wpfi_indicator_catalog` |
| 233 | `wpfi_indicator_results` |
| 234 | `wpfi_published_releases` |
| 235 | `wpfi_region_catalog` |
| 236 | `wpfi_releases` |
| 237 | `wpfi_results` |
| 238 | `wpfi_schema_meta` |

## Appendix H. Complete formula-record catalogue

### H.1. AIPI / imf-aipi-2023-equal-four-dimensions

- **Source:** `IMF_AIPI`
- **Official formula available:** `True`
- **Formula or rule:** AIPI = 0.25·DI + 0.25·HCLMP + 0.25·IEI + 0.25·RE = c_DI + c_HCLMP + c_IEI + c_RE
- **Normalisation:** Min-max normalisation of subindicators over the full country universe; adverse indicators are oriented so higher values indicate stronger preparedness by the source methodology.
- **Method note:** The IMF normalises source subindicators to 0–1 and averages them within each dimension, then equally averages the four dimensions. The machine-readable release publishes each dimension contribution on a 0–0.25 scale; GIR preserves it and separately reconstructs the 0–1 dimension as c/0.25.

### H.2. ARWU / gir-arwu-country-research-system-v1

- **Source:** `SHANGHAI_ARWU`
- **Official formula available:** `False`
- **Formula or rule:** ARWU = 0.25×BREADTH* + 0.25×ELITE_DEPTH* + 0.25×BEST_RANK* + 0.25×MEDIAN_RANK*. BREADTH and ELITE_DEPTH are log-transformed; rank components are reverse-normalised.
- **Normalisation:** Edition-specific min-max to 0–100. BREADTH=ln(1+n). ELITE_DEPTH=ln(1+Σw), using band weights 1.0 / 0.6 / 0.4 / 0.25 / 0.1. BEST_RANK and MEDIAN_RANK are reversed. Rank bands use their midpoint only for computation.
- **Method note:** The GIR country score balances system breadth, elite depth, peak position and typical position. It uses only the complete published ARWU top 1000 and does not reproduce ShanghaiRanking's institution formula. The six official indicators are exposed as a separate diagnostic and do not enter the country score because public coverage is uneven.

### H.3. BREADY / official-bready-multidimensional-v1

- **Source:** `world-bank-business-ready`
- **Official formula available:** `False`
- **Formula or rule:** Official topic and pillar scores are imported separately; no formula for a single aggregate economy score exists.
- **Normalisation:** Each official indicator retains its own 0–100 scale.
- **Method note:** GIR forbids synthetic averaging of the ten topics and three pillars.

### H.4. CF_IQI / cloudflare-iqi-no-composite-v1

- **Source:** `CLOUDFLARE_RADAR_IQI`
- **Official formula available:** `False`
- **Formula or rule:** No composite is calculated: p25, p50 and p75 are stored separately for BANDWIDTH, LATENCY and DNS.
- **Normalisation:** Cloudflare returns RAW_VALUES and confidence metadata; GIR does not normalise or combine the metrics.
- **Method note:** Interpretation directions differ: higher bandwidth is better, while lower latency and DNS response time are better. Any GIR ordering must select one metric, one percentile and one dated snapshot.

### H.5. DHL_GCI / DHL_GCR_2026_OFFICIAL

- **Source:** `DHL_GCI`
- **Official formula available:** `True`
- **Formula or rule:** Official overall_score is the geometric mean of depth and breadth levels; the CSV stores depth/breadth components on 0–50 scales.
- **Normalisation:** Historical scores are compared only within the 2026 edition panel.
- **Method note:** GIR preserves published scores and ranks, validates the formula relation, and displays 0–100 levels by multiplying source components by two.

### H.6. ECI / official-eci-import-v1

- **Source:** `HARVARD_GROWTH_LAB_ATLAS_ECI`
- **Official formula available:** `True`
- **Formula or rule:** The official Economic Complexity Index value is imported from the Atlas of Economic Complexity.
- **Normalisation:** The official standardised scale is retained without conversion to 0–100.
- **Method note:** The source trade matrix and iterative procedure are not recomputed in GIR; only explicitly labelled rank and percentile are derived.

### H.7. EGDI / un-desa-egdi-2024-official

- **Source:** `UN_DESA_EGOV`
- **Official formula available:** `True`
- **Formula or rule:** EGDI = (OSI + TII + HCI) / 3 after the official Z-score standardization and 0–1 normalization of each component.
- **Normalisation:** Official components are Z-score standardized and normalized to 0–1 before the equal-weight EGDI mean.
- **Method note:** OSI comprises IF 10%, SP 45%, CP 5%, TEC 5% and EPI 35%. TII has four equal subindices: MS, IU, AM and AF. HCI has five equal subindices: AL, GER, EYS, MYS and EGL. The platform reconciles only the top-level mean of published OSI/TII/HCI values; internal normalization is not replaced by simplified arithmetic.

### H.8. GARI / oxford-insights-gari-2025-corrected-2026-01

- **Source:** `OXFORD_INSIGHTS_GARI`
- **Official formula available:** `True`
- **Formula or rule:** GARI* = 0.10·PC + 0.25·AI_INFRA + 0.15·GOV + 0.15·PSA + 0.25·DEV_DIFF + 0.10·RES
- **Normalisation:** Oxford Insights normalises underlying indicators to 0–100. GIR does not repeat imputation; it uses the published pillar scores.
- **Method note:** The asterisk marks a GIR recomputation from six official pillars printed to two decimals. The corrected official rank is taken directly from the report and prevails where rounded-value sorting differs.

### H.9. GCI / itu-gci-2024-v5-official

- **Source:** `ITU_GCI`
- **Official formula available:** `True`
- **Formula or rule:** GCI = LS + TS + OS + CDS + CS, where each official pillar is scored 0–20 and the total is 0–100. Each country is assigned to one of five official tiers from its overall score.
- **Normalisation:** The overall score uses 0–100, pillars 0–20 and published indicators 0–1. GIR applies no additional normalization to official values.
- **Method note:** Indicator values on the 0–1 scale already reflect ITU expert-group question weights. GIR does not assume equal weights within pillars and does not create a country ranking. Tier thresholds: T1 ≥95; T2 ≥85; T3 ≥55; T4 ≥20; T5 <20.

### H.10. GII / gii-official-score-and-pillars

- **Source:** `WIPO_GII`
- **Official formula available:** `False`
- **Formula or rule:** The official total score and pillar scores are imported from WIPO; the platform does not recompute the official GII.
- **Normalisation:** Official WIPO scores; platform gap and diagnostic calculations are layered on top.
- **Method note:** Visual block weights must not be interpreted as the official WIPO formula.

### H.11. GII / official-gii-2025

- **Source:** `WIPO_GII`
- **Official formula available:** `True`
- **Formula or rule:** Official WIPO GII score and seven pillar scores from the GII 2025 database.
- **Normalisation:** Official 0-100 scores are used directly; external raw components are min-max normalized across available countries.
- **Method note:** Official assessment of innovation ecosystem inputs and outputs.

### H.12. GLOBAL_FINDEX / official-global-findex-indicators-v1

- **Source:** `WORLD_BANK_GLOBAL_FINDEX`
- **Official formula available:** `False`
- **Formula or rule:** Official Global Findex indicators are imported individually; no aggregate-index formula exists.
- **Normalisation:** Normalisation is indicator-specific; no universal transformation is applied.
- **Method note:** Values retain native units and survey waves; aggregation into one score is prohibited.

### H.13. GMI / bicc-gmi-codebook-v3-published-score-no-recompute

- **Source:** `BICC_GMI`
- **Official formula available:** `True`
- **Formula or rule:** Official BICC weighted composite of six indicators in three categories; GIR does not recompute it.
- **Normalisation:** Normalization is performed by BICC; GIR adds only ISO3 and a canonical name.
- **Method note:** Published integer score, unique rank and three components are preserved. Equal displayed scores do not imply a tie.

### H.14. GOCI / goci-open-data-2025-workbook-v1

- **Source:** `GITOC_GOCI`
- **Official formula available:** `True`
- **Formula or rule:** Criminality is the mean of markets and actors; markets, actors and resilience are simple means of their available official indicators. Criminality and resilience are not combined.
- **Normalisation:** Excel binary storage artefacts are canonicalised only to the workbook's displayed two-decimal precision.
- **Method note:** GIR preserves official scores. Ranks are derived standard-competition ranks from displayed scores.

### H.15. GPI / IEP_GPI_2026_OFFICIAL

- **Source:** `IEP_GPI`
- **Official formula available:** `True`
- **Formula or rule:** GIR stores the official published GPI score; no recomputation is performed.
- **Normalisation:** Published IEP scale 1–5; lower is better.
- **Method note:** The IEP methodology uses 23 indicators and three domains; internal peace has a 60% weight and external peace 40%.

### H.16. GTCI / official-gtci-2025-pillars

- **Source:** `PORTULANS_GTCI`
- **Official formula available:** `True`
- **Formula or rule:** Official GTCI 2025 score is extracted from the ranking table; six diagnostic pillars are derived from official pillar ranks in the Rankings by Pillar table.
- **Normalisation:** Official 0-100 scores are used directly; external raw components are min-max normalized across available countries.
- **Method note:** Official index of country competitiveness in enabling, attracting, growing and retaining talent.

### H.17. HCI / hci-historical-2020-official-score

- **Source:** `WORLD_BANK_HCI`
- **Official formula available:** `False`
- **Formula or rule:** The official historical 2020 HCI score is imported without a platform recomputation.
- **Normalisation:** Official World Bank methodology; the platform does not apply equal weights to the official score.
- **Method note:** Components support educational diagnostics. Until HCI+ 2026 is loaded, the module is labelled historical.

### H.18. HCI / official-hci-series

- **Source:** `WORLD_BANK_HCI`
- **Official formula available:** `True`
- **Formula or rule:** Official World Bank HCI score; components use available HCI indicators.
- **Normalisation:** Official 0-100 scores are used directly; external raw components are min-max normalized across available countries.
- **Method note:** Official measure of human capital and expected productivity of the next generation.

### H.19. HCI_PLUS / official-hci-plus-2026

- **Source:** `WORLD_BANK_HCIPLUS`
- **Official formula available:** `True`
- **Formula or rule:** HCI+ = health + education + employment; official World Bank score on the 0–325 scale.
- **Normalisation:** Official values are used without renormalisation.
- **Method note:** Official country briefs are loaded; HCI+ and historical HCI do not form one continuous series.

### H.20. HDI / hdi-official-method-note-v2

- **Source:** `UNDP_HDR`
- **Official formula available:** `True`
- **Formula or rule:** The official UNDP HDI is the geometric mean of the health, education and income indices: HDI=(I_health×I_education×I_income)^(1/3).
- **Normalisation:** Official UNDP goalposts; logarithmic income transformation.
- **Method note:** The platform imports the official score. Component min-max panels are diagnostic only and are not an official recomputation.

### H.21. HDI / official-hdi-timeseries-2025

- **Source:** `UNDP_HDR`
- **Official formula available:** `True`
- **Formula or rule:** Official UNDP HDI score; diagnostic components are normalized from life expectancy, schooling and GNI.
- **Normalisation:** Official 0-100 scores are used directly; external raw components are min-max normalized across available countries.
- **Method note:** Official UN index combining health, education and living standards.

### H.22. HTEI / htei-v3-multisource

- **Source:** `HTEI_MULTI_SOURCE`
- **Official formula available:** `True`
- **Formula or rule:** High-Tech Employment Index v3 = weighted normalized components from ILOSTAT, OECD, Eurostat/national statistics, UIS and World Bank, adjusted by source coverage quality; values are not silently carried across years.
- **Normalisation:** Official 0-100 scores are used directly; external raw components are min-max normalized across available countries.
- **Method note:** High-Tech Employment Index for monitoring technological workforce development, computed from official international data series.

### H.23. HTEI / htei-v3-multisource-asof-2026

- **Source:** `HTEI_MULTI_SOURCE`
- **Official formula available:** `False`
- **Formula or rule:** The High-Tech Employment Index is computed as a multi-source as-of composite: for each country the latest available official observation for every component is selected at release build time; components are min-max normalized across available countries; the base score is the weighted sum divided by available weight; the release score equals the base score multiplied by the data-quality coefficient.
- **Normalisation:** Min-max across latest available official observations; the final score is normalized by available weight and the data-quality coefficient.
- **Method note:** The quality coefficient accounts for component coverage, source-data freshness and source-group diversity. Every value preserves source_data_year, source, raw snapshot and SHA-256.

### H.24. HTEI / htei-v5-scientific-2026

- **Source:** `HTEI_SCIENTIFIC_V5`
- **Official formula available:** `True`
- **Formula or rule:** HTEI is the sum of normalized component scores multiplied by effective weights renormalized over available components. Data quality is reported separately and never changes the substantive score. Ranks are assigned only to the comparable country core.
- **Normalisation:** Winsorized min-max 0–100; quality, freshness and completeness are displayed separately.
- **Method note:** Three modes: comparable core, policy-comparable extended and ASOF diagnostic. Primary normalization is 2.5/97.5-percentile winsorized min-max; robustness is tested using alternative normalizations, weight perturbations and leave-one-component-out.

### H.25. HTEI / htei-v6-common-support-2026

- **Source:** `HTEI_FINAL_V6`
- **Official formula available:** `False`
- **Formula or rule:** HTEI uses the weights fixed by the approved research report. The primary Common Support comparison uses the same four components for every country: employment, occupational structure, STEM pipeline and technology outputs; the approved weights are renormalised only within this fixed set. Data confidence is reported separately and does not alter the substantive score.
- **Normalisation:** Robust normalisation of archived official observations in HTEI v5; Common Support uses one fixed component set.
- **Method note:** The weighting scheme is fixed by the approved research report; v6 removes data-quality multiplication and introduces a common-support ranking.

### H.26. IDI / official-idi-series-2023-2025

- **Source:** `ITU_IDI`
- **Official formula available:** `True`
- **Formula or rule:** Official ITU IDI score and pillar scores from the IDI 2025 dataset.
- **Normalisation:** Official 0-100 scores are used directly; external raw components are min-max normalized across available countries.
- **Method note:** Official ICT development and meaningful connectivity index.

### H.27. IMF_FDI / official-imf-fdi-multidimensional-v1

- **Source:** `IMF_FINANCIAL_DEVELOPMENT_INDEX`
- **Official formula available:** `True`
- **Formula or rule:** The nine official IMF indices are imported as separate series; GIR creates no additional synthetic aggregate.
- **Normalisation:** The official 0–1 scale is retained directly.
- **Method note:** The institutions/markets and depth/access/efficiency architecture is retained without hidden reweighting.

### H.28. KOF_GLOBAL / official-kof-import-v1

- **Source:** `KOF_ETH_GLOBALISATION_INDEX`
- **Official formula available:** `True`
- **Formula or rule:** Official overall, dimensional and de-facto/de-jure values are imported from the KOF release.
- **Normalisation:** The official 1–100 scale is used directly.
- **Method note:** Official weights and aggregation are documented from KOF methodology and are not recomputed by the platform.

### H.29. NRI / portulans-nri-2025-official-hierarchy

- **Source:** `PORTULANS_NRI`
- **Official formula available:** `True`
- **Formula or rule:** NRI = (Technology + People + Governance + Impact) / 4. Each pillar is the unweighted mean of three sub-pillars; each sub-pillar is a weighted mean of available normalized indicators.
- **Normalisation:** Official indicators are normalized by the NRI authors to 0–100. Country inclusion requires at least 70% overall coverage and at least 40% coverage in every sub-pillar.
- **Method note:** Forty-nine indicators have weight 1; indicators 4.2.3, 4.2.4, 4.3.1 and 4.3.5 have weight 0.5. Missing values are excluded. The platform preserves published official values and uses recomputation only as a reconciliation check.

### H.30. PISA_SKI / gir-pisa-school-knowledge-equal-domains-v1

- **Source:** `OECD_PISA`
- **Official formula available:** `False`
- **Formula or rule:** PISA_SKI = (MATH + READING + SCIENCE) / 3. All three components are official PISA mean scores; the composite mean is calculated by GIR.
- **Normalisation:** No normalisation is applied: the arithmetic mean of the three official PISA domain scales is used.
- **Method note:** The composite stays in PISA points and is not converted to an arbitrary 0–100 scale. Only systems with all three domains in the same cycle are ranked; ties use competition ranks and mid-rank percentiles. This is a descriptive GIR ranking, not an official OECD rank. Sampling and comparability warnings are published separately and do not penalise the score.

### H.31. QS_ET / qs-country-aggregation-v1

- **Source:** `QS_ET`
- **Official formula available:** `False`
- **Formula or rule:** Country aggregation is computed from archived official QS endpoint rows: count, best rank, median rank and aggregated institutional score.
- **Normalisation:** Official 0-100 scores are used directly; external raw components are min-max normalized across available countries.
- **Method note:** Country aggregation of QS Engineering & Technology ranking from archived official endpoint rows.

### H.32. SIPRI_MILEX / sipri-milex-official-series-no-composite-v1

- **Source:** `SIPRI_MILEX`
- **Official formula available:** `False`
- **Formula or rule:** GIR preserves official SIPRI series; no composite index is created.
- **Normalisation:** Units and price basis are preserved from the official workbook.
- **Method note:** Ranks and changes are GIR-derived within one compatible series.

### H.33. THE_ENG / gir-the-engineering-country-v1

- **Source:** `THE_ENG`
- **Official formula available:** `False`
- **Formula or rule:** THE_ENG = 0.25×BREADTH* + 0.25×BEST_RANK* + 0.25×MEDIAN_RANK* + 0.25×PILLAR_PROFILE*. BREADTH uses ln(1+n); ranks are reverse-normalised; PILLAR_PROFILE retains the official THE Engineering five-pillar weights.
- **Normalisation:** Edition-specific min-max normalisation to 0–100; BEST_RANK and MEDIAN_RANK are reversed. Published rank bands are represented by their interval midpoint.
- **Method note:** The country score was designed by GIR to balance system breadth, peak performance, typical position and the engineering-university pillar profile. It does not reproduce THE's institution formula and must not be interpreted as an official THE country score.

### H.34. TOP500 / gir-top500-country-aggregation-june-2026-v1

- **Source:** `TOP500_ORG_TOP500`
- **Official formula available:** `False`
- **Formula or rule:** There is no single score. A country profile is a vector of independent aggregates: ΣRmax, system count, ΣRpeak, world Rmax share, cores and Green500 metrics.
- **Normalisation:** No normalization across heterogeneous physical units is performed.
- **Method note:** Official ranks apply only to systems. GIR country orders depend on an explicitly selected metric and snapshot.

### H.35. UNCTAD_LSCI / unctad-lsci-official-score-no-recompute-v1

- **Source:** `UNCTAD_LSCI`
- **Official formula available:** `False`
- **Formula or rule:** The official LSCI score is imported without recomputation; rank and changes are GIR-derived.
- **Normalisation:** The official UNCTAD temporal and country scale is preserved.
- **Method note:** Country LSCI is not mixed with PLSCI or the bilateral index.

### H.36. UNCTAD_PCI / official-pci-import-v1

- **Source:** `UNCTAD_PCI`
- **Official formula available:** `True`
- **Formula or rule:** The official PCI overall value and categories are imported from the UNCTAD release; GIR does not recompute the official index.
- **Normalisation:** The official 0–100 scale is used without renormalisation.
- **Method note:** Rank and percentile are calculated only as descriptive views within one edition.

### H.37. VDEM / official-vdem-v16-five-high-level-indices-2025-v1

- **Source:** `VDEM_V16`
- **Official formula available:** `True`
- **Formula or rule:** V-Dem publishes five separate high-level democracy indices. GIR imports each official score, lower and upper coding-uncertainty bounds, and standard deviation. No cross-index average or overall democracy rank is calculated.
- **Normalisation:** The official 0–1 scale is preserved without normalization. Missing values are not imputed. Polities and historical names are retained using V-Dem identifiers.
- **Method note:** The codelow/codehigh bounds contain the interval in which the V-Dem Bayesian measurement model places 68% of probability mass; _sd is the published standard deviation. GIR ranks are derived within one index and year.

### H.38. WB_LPI2 / world-bank-lpi2-indicator-family-no-composite-v1

- **Source:** `WORLD_BANK_LPI`
- **Official formula available:** `False`
- **Formula or rule:** LPI 2.0 consists of separate operational indicators; no overall composite exists.
- **Normalisation:** Each official unit of measurement is preserved separately.
- **Method note:** GIR derives a rank only within one year × indicator × metric combination.

### H.39. WB_LPI_LEGACY / world-bank-lpi-legacy-official-v1

- **Source:** `WORLD_BANK_LPI`
- **Official formula available:** `False`
- **Formula or rule:** The official overall score and six components of the historical survey LPI are imported without local recomputation.
- **Normalisation:** Official 1–5 scale.
- **Method note:** Official ranks are preserved; the 2007–2023 waves remain separate releases.

### H.40. WB_LPI_LEGACY / world-bank-lpi-stage11-v1

- **Source:** `WORLD_BANK_LPI`
- **Official formula available:** `False`
- **Formula or rule:** The official overall score and six components of the historical survey LPI are imported without local recomputation.
- **Normalisation:** Official 1–5 scale.
- **Method note:** This formula-version alias preserves compatibility with integrated-package row identifiers; its scientific meaning matches the imported official layer.

### H.41. WGI / official-wgi-2025-revision-1996-2024-v1

- **Source:** `WORLD_BANK_WGI`
- **Official formula available:** `True`
- **Formula or rule:** WGI publishes six separate dimensions estimated with the revised unobserved-components model. GIR imports the official standardized estimate, absolute 0–100 score, standard errors, 90% intervals and available source means. No overall WGI score or cross-dimension weighting scheme is constructed.
- **Normalisation:** The six official WGI dimensions are used separately. GIR performs no cross-dimension aggregation and does not impute missing dimensions or source values; ranks are derived only within a selected dimension and year.
- **Method note:** Six official World Bank governance dimensions. WGI publishes no overall score or overall rank; GIR preserves each dimension separately, its uncertainty and the published source values.

## QS T28 appendix: a portfolio of independent projects

QS Intelligence registers 90 ranking projects, including 55 subjects in five broad areas, WUR, Sustainability, regional, MBA and professional products. The analytical route is `/#index-QS_ET`; normalised project layers are discoverable in Data Explorer.

The numerical layer is currently published only for QS Engineering & Technology 2023–2026. Other active projects carry an explicit `source_gated` status; a partly loaded edition is `staged_partial` and never replaces a published release. GIR derives a country profile separately within a specific project and edition and creates no cross-project QS super-index.

Institution rows are available only to authenticated internal users (`authenticated_internal`). When the rights registry prohibits redistribution, viewing remains available while CSV export has `export_permitted=false` and returns a structured refusal. Every value retains its source ID, snapshot ID, SHA-256, edition, transformation and quality flag.

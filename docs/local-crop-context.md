# TerraShift AI — Local Crop Context for the Harohalli Pilot

_Last reviewed: 14 November 2026_

## Purpose and limits

This note collects official regional and university material that can help define a **candidate crop library** and illustrative comparison scenarios for Harohalli, Karnataka.

No farmer interview or farm-level crop history is available for this project. Therefore, no scenario in the prototype can be described as the existing rotation of a real Harohalli farm. The baseline is explicitly illustrative.

The available sources identify regional crops and research systems. They do **not** establish the crop currently grown on a particular field, validate the exact crop sequences in the app, or supply every parameter required by the scoring engine.

## 1. Agro-climatic zone: important geographic correction

The University of Agricultural Sciences Bengaluru (UASB) agro-climatic zone page places Ramanagara district and Bengaluru South taluks, including Kanakapura, in **Agro-climatic Zone 5 — Eastern Dry Zone**. It describes Zone 5 as hot, moist, semi-arid, with average annual rainfall of 680–890 mm and predominantly red soils, with lateritic and alluvial soils also present. Its listed crops include ragi, maize, pulses, mulberry, groundnut, fruits, vegetables, and flowers.

This matters because some earlier search results concerned **Zone 6 — Southern Dry Zone**. Zone 6 crop calendars must not be presented as if they were the exact Zone 5 calendar for Harohalli. Use Zone 5 sources wherever available and confirm the relevant taluk/field context before using a crop calendar.

Source: https://www.uasbangalore.edu.in/en/agroclimatic-zones-uas-bangalore/

## 2. Official Ramanagara / Bengaluru South district context

The Government of Karnataka district Agriculture Department page (currently published under the Bengaluru South district portal) reports:
- Agriculture area in the district: 114,000 ha
- Farm families: 271,448
- Annual average rainfall: 851 mm
- Agriculture extension and farmer-support services through Raitha Samparka Kendras across 18 hoblis

The page describes district programmes for pulses, nutri-cereals, minor millets, rainfed farming, farm ponds/rainwater conservation, and micro-irrigation. It names redgram in a pulse programme and lists foxtail, kodo, proso, browntop, little, and barnyard millets under a minor-millet programme.

**Age/coverage caveat:** the same page includes programme statistics explicitly referring to 2019–20. Treat those statistics as historical context, not current production figures or a current crop census. District-wide rainfall is not a substitute for the selected farm's NASA POWER history or a local rain gauge.

Source: https://ramanagara.nic.in/en/agriculture-department/

## 3. UAS Bengaluru dryland research relevant to Zones IV, V and VI

UAS Bengaluru's GKVK Dryland Agriculture unit states that its AICRP for Dryland Agriculture caters to dryland farmers in Southern Karnataka across Zones IV, V, and VI. Its published research accomplishments include:
- Finger millet + pigeonpea intercropping (8:2 or 10:2)
- Maize + pigeonpea intercropping (1:1)
- Groundnut + pigeonpea intercropping (8:2)
- Pigeonpea + field bean and pigeonpea + cowpea intercropping
- Finger millet–soybean–maize rotation system
- A statement that crop rotation with legumes resulted in higher finger millet yield

These are research findings and systems reported by the UAS unit. They are useful evidence for candidate strategies, but the exact practice, crop variety, soil, sowing window, and management need to be checked for the particular farm. Intercropping is not the same as a sequential crop rotation.

Source: https://www.uasbangalore.edu.in/en/dryland-agriculture-gkvk-bengaluru/

## 4. Candidate crop-library shortlist

Based on the Zone 5 description, district agriculture context, and UAS Bengaluru dryland research, these are candidates to investigate, not confirmed crops for a particular pilot farm:

| Candidate | Evidence in regional sources | Validation still needed |
| --- | --- | --- |
| Finger millet (ragi) | Listed among Zone 5 crops; district crop context also identifies ragi as a major crop in nearby Bengaluru | Farm's current use, variety, sowing window, duration, water and soil parameters |
| Maize | Listed among Zone 5 crops and used in UAS dryland cropping systems | Farm-level use, variety, season, irrigation, duration and crop parameters |
| Pigeonpea / redgram (tur) | Pulses listed for Zone 5; district pulse programme names redgram; UAS dryland research uses pigeonpea | Local sowing window, variety, duration, water and soil parameters |
| Groundnut | Listed among Zone 5 crops and included in UAS dryland intercropping systems | Farm-level use, variety, season, irrigation, duration and crop parameters |
| Horsegram | UAS GKVK dryland page lists horsegram variety PHG-9 among promising improved pulse varieties | Whether it is grown/marketed locally, crop calendar and parameters |
| Cowpea | UAS dryland research includes pigeonpea + cowpea systems | Local use, season, variety, duration and crop parameters |
| Field bean (avare) | UAS dryland research includes pigeonpea + field bean systems | Local use, sowing window, variety, duration and crop parameters |
| Small millets | District minor-millet programme includes foxtail, kodo, proso, browntop, little and barnyard millet | Local availability, variety, season, duration, water and soil parameters |
| Sunflower | UAS Bengaluru crop technologies and dryland research mention sunflower | Local use, variety, season, duration and crop parameters |

Do not add crop parameter values merely because a crop appears in a regional source. For every scored parameter, record the source, publication date, variety, season, unit, and geographic applicability.

## 5. Three illustrative comparison scenarios in the prototype

Because there is no farmer-reported baseline, the app uses these **hypothetical research scenarios** for demonstrating the comparison workflow. They are not claims about what a Harohalli farmer currently grows and are not field recommendations.

| Scenario | Prototype sequence (2026–2029) | Why it is being tested | Important caveat |
| --- | --- | --- | --- |
| Illustrative baseline — ragi monocrop | Kharif: ragi each year | Ragi is a documented Zone 5 crop and regional crop candidate | Not an observed farm rotation; monocropping is a hypothetical reference for comparison |
| Rotation candidate — ragi + horsegram | Kharif: ragi; Rabi: horsegram | Tests a cereal followed by a pulse; UAS reports that legume rotations increased finger millet productivity | The exact ragi–horsegram sequence and Rabi fit are not validated by the cited source |
| Rotation candidate — maize + horsegram | Kharif: maize; Rabi: horsegram | Tests a different cereal–pulse sequence using crops appearing in regional/UAS material | The exact sequence is a comparison hypothesis, not a verified local package of practice |

**Application limitation:** the current simulator assigns one crop per season. It cannot yet model an intercrop such as finger millet + pigeonpea (8:2) as two crops grown together in one field-season. Do not describe the current sequential scenarios as intercropping systems. Supporting true intercropping would require a deliberate data-model and scoring update.

**Parameter limitation:** all crop records in the current prototype are marked as demo values. The farm's soil pH, soil organic carbon, texture, area, and irrigation profile are also illustrative demo inputs. The scores are only demonstrations of the deterministic scoring logic; they are not validated agronomic suitability results.

## 6. How to use these sources in the prototype

1. Keep candidate crops in a research shortlist until local relevance is validated.
2. Prefer Zone 5 references for the Harohalli pilot. Do not silently transfer Zone 6 calendars.
3. For each crop parameter used by the score, record source, publication date, variety, season, unit, and geographic applicability.
4. Distinguish official research findings from farmer-reported practices and illustrative values.
5. If farmer access becomes available, replace the illustrative baseline with the farmer's actual crop sequence and history.
6. If no farmer history is available at submission, retain the illustrative label in the UI, report, and presentation.

## 7. Next data-collection questions if a farmer becomes available

- Which crop(s) were grown in each of the last 3–5 seasons?
- Which season/months were they sown and harvested?
- Is the field rainfed, partially irrigated, or assured irrigated?
- What is the irrigation source and approximate availability?
- Is there a recent soil test for pH, organic carbon, and texture?
- Which crops are preferred or ruled out due to labour, machinery, market access, livestock needs, or household use?
- Are there recurring issues such as waterlogging, drought, erosion, pests, or disease?

## References

- UAS Bengaluru, Agro-climatic Zones: https://www.uasbangalore.edu.in/en/agroclimatic-zones-uas-bangalore/
- Government of Karnataka, Ramanagara/Bengaluru South Agriculture Department: https://ramanagara.nic.in/en/agriculture-department/
- UAS Bengaluru, Dryland Agriculture, GKVK: https://www.uasbangalore.edu.in/en/dryland-agriculture-gkvk-bengaluru/
- UAS Bengaluru, *New Technologies Recommended for Inclusion in Package of Practices* (2025): https://www.uasbangalore.edu.in/wp-content/uploads/2025/06/technologies-E-2025.pdf
- NASA Space Apps Field Shift challenge: https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/

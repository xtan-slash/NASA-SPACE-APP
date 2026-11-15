import { ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import { ENGINE_VERSION, EFFECTIVE_RAIN_FACTOR, PH_PENALTY_PER_UNIT, TEMP_PENALTY_PER_DEG } from "@/lib/scoring";
import { IRRIGATION } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

const DIMENSIONS = [
  {
    name: "Soil health suitability",
    checks: "pH fit 0.42 · texture 0.33 · organic-carbon demand 0.25",
    rule: "100 inside the crop's pH range, −14 points per pH unit outside. Texture: 100 preferred, 62 marginal, 35 otherwise. Organic carbon: 100 × (farm OC ÷ crop threshold), capped at 100.",
    inputs: "Crop pH range, texture preferences, OC demand · farm pH, texture, OC",
  },
  {
    name: "Water suitability",
    checks: "Single seasonal balance, with a surplus penalty",
    rule: "Supply = 0.75 × season rainfall + irrigation allowance. Score = 100 × coverage^1.1 when coverage < 1, else 100, minus up to 18 points where a poorly drained soil gets more than 1.5× demand.",
    inputs: "Crop seasonal water demand · POWER season rainfall · farm irrigation status, texture",
  },
  {
    name: "Climate suitability",
    checks: "Temperature fit 0.5 · heat days 0.3 · heavy-rain days 0.2",
    rule: "100 inside the optimum mean-temperature range, −11 points per °C outside. Heat penalty = share of season days above the crop threshold × 180, capped at 40. Heavy-rain penalty × 300 if flood-sensitive (capped 30), else × 120 (capped 12).",
    inputs: "Crop temperature range, heat threshold, flood sensitivity · POWER season temperature, heat and heavy-rain day counts",
  },
  {
    name: "Crop diversity",
    checks: "Family Shannon index 0.4 · legume share 0.35 · family alternation 0.25",
    rule: "Shannon index normalised by ln(seasons). Legume share scores 100 between 20% and 50% of seasons, ramping up from 0 and down above 50%. Alternation is the share of consecutive seasons that change botanical family.",
    inputs: "Crop families and legume flags across the saved sequence",
  },
];

function Section({ title, kicker, children }) {
  const { t } = useI18n();
  return (
    <section className="panel p-5">
      <p className="kicker">{t(kicker)}</p>
      <h2 className="mt-1 text-[17px] font-medium">{t(title)}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function MethodContent({ backTo = "/dashboard" }) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Reference"
        title="Method & limits"
        description="Everything the score depends on, written down so a judge, an agronomist or a farmer can check it — and the list of what this prototype deliberately does not do."
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to={backTo}>
              <ArrowLeft className="h-4 w-4" /> {t("Back")}
            </Link>
          </Button>
        }
      />

      <Notice tone="warn" title="Not validated agronomic advice">
        TerraShift AI compares scenario inputs. It has not been validated against field trials, it does not
        predict yield, income or nutrient balance, and a higher score is not a recommendation to plant
        anything. Treat every number as a transparent comparison input for a conversation with an agronomist.
      </Notice>

      <Section kicker="Engine" title="How the overall score is assembled">
        <div className="rounded-xl border border-border/70 bg-secondary/40 p-4 font-mono text-[12px] leading-relaxed">
          <p>S_d = mean of that dimension's season scores (diversity is rotation-level)</p>
          <p className="mt-1">overall = Σ (w_d × S_d) / Σ w_d, over dimensions that could be computed</p>
          <p className="mt-1 text-muted-foreground">w_d = your slider value (0–10), normalised to a share</p>
        </div>
        <p className="prose-note mt-3">
          Weights are validated (numeric, 0–10, sum &gt; 0) and normalised. If a dimension has no usable inputs
          it is excluded and the remaining weights are renormalised — the UI always shows which weights were
          actually applied. The same pure functions run in the browser and on the server, so the advisor is
          grounded in recomputed rather than client-supplied results. Engine version {ENGINE_VERSION}.
        </p>
      </Section>

      <Section kicker="Explanation" title="Two explanation modes, one deterministic scoring engine">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 p-3">
            <p className="text-[12px] font-medium text-foreground">Private workspace · generative AI</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              The authenticated advisor sends server-recomputed score tables, farm input provenance and climate summaries to a language model. The model explains the supplied evidence in natural language. It does not calculate or modify the scores, and its wording should be checked against the evidence panel.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <p className="text-[12px] font-medium text-foreground">Public demo · deterministic explanation</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              The read-only demo builds its explanation from fixed rules and the precomputed demonstration results. It does not call a generative AI service. This keeps the public demo reproducible and separate from private workspace data.
            </p>
          </div>
        </div>
        <p className="prose-note mt-3">
          Both modes explain results from the same kind of deterministic scoring logic. Neither explanation mode is a validated agronomic recommendation.
        </p>
      </Section>

      <Section kicker="Dimensions" title="Each dimension, its sub-checks and its inputs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[11.5px]">
            <thead>
              <tr className="border-b border-border/70 text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">{t("Dimension")}</th>
                <th className="py-2 pr-3 font-medium">{t("Sub-checks")}</th>
                <th className="py-2 pr-3 font-medium">{t("Rule")}</th>
                <th className="py-2 font-medium">{t("Required inputs")}</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d) => (
                <tr key={d.name} className="border-b border-border/40 align-top last:border-0">
                  <td className="py-3 pr-3 font-medium">{t(d.name)}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{d.checks}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{d.rule}</td>
                  <td className="py-3 text-muted-foreground">{d.inputs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="Constants" title="Fixed assumptions (documented, not measured)">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 p-3">
            <p className="metric text-[13px]">× {EFFECTIVE_RAIN_FACTOR}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Share of NASA POWER season rainfall assumed plant-available. A single constant, not a
              runoff model.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <p className="metric text-[13px]">
              {IRRIGATION.map((i) => `${i.assumed_mm} mm`).join(" / ")}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Seasonal irrigation allowance assumed for rainfed / supplemental / assured status.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <p className="metric text-[13px]">−{PH_PENALTY_PER_UNIT} / pH unit</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Linear penalty outside the crop's pH range.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <p className="metric text-[13px]">−{TEMP_PENALTY_PER_DEG} / °C</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Linear penalty outside the crop's optimum mean-temperature range.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <p className="metric text-[13px]">0.45 / 0.65 / 0.85 %</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Organic-carbon thresholds for low / medium / high crop demand.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <p className="metric text-[13px]">50 mm · 35 °C</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Thresholds for a heavy-rain day and a heat day counted in the climate dimension.
            </p>
          </div>
        </div>
      </Section>

      <Section kicker="Security" title="Private accounts, shared crop catalogue and ownership">
        <div className="space-y-3 text-[11.5px] leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Farm, scenario and climate records.</strong> These records use creator-based access rules for reading, updating and deleting. The same rule applies to administrator-created records: an administrator does not automatically gain access to another account's private farm data.</p>
          <p><strong className="text-foreground">Shared master crop catalogue.</strong> The master Crop catalogue is readable as shared reference data. Creating, updating or deleting master records is restricted to administrators.</p>
          <p><strong className="text-foreground">Personal crop records.</strong> A UserCrop record stores a user's new crop or personal override of a master crop. These records are creator-owned. A personal override is merged into that user's crop list at read time; it does not modify the shared master record.</p>
          <p><strong className="text-foreground">Active farm selection.</strong> The selected farm ID is stored in browser local storage under a key that includes the signed-in user's ID. The sidebar shows this active farm separately from Harohalli, which remains the project's pilot region rather than a default claim about the user's farm.</p>
          <p><strong className="text-foreground">Public demo boundary.</strong> Public demo pages use fixed demonstration data and do not query private Farm, Scenario, ClimateSnapshot or UserCrop records.</p>
          <p>Automated static policy checks are available with <code>npm run audit:security</code>. These verify the declared entity rules and relevant client/server code paths. They do not replace live cross-account authorization tests with two separate signed-in accounts.</p>
        </div>
      </Section>

      <Section kicker="Data" title="Sources, attribution and availability">
        <ul className="space-y-2.5 text-[12px] leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">NASA POWER — daily point API</span> (Agroclimatology
            community). Parameters: T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, GWETROOT, ALLSKY_SFC_SW_DWN,
            WS2M. Every chart shows the requested window, the retrieval timestamp, per-parameter coverage and
            the exact request URL.{" "}
            <a
              href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              API documentation <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            <span className="font-medium text-foreground">Underlying data</span> — POWER reports the
            assimilation source (MERRA-2) in the response header; the app displays that string rather than
            describing the model itself.
          </li>
          <li>
            <span className="font-medium text-foreground">Soil and crop values</span> — entered by you. The
            seeded library is explicitly labelled illustrative demo data, and the UI warns until records stop
            being demo records.
          </li>
          <li>
            <span className="font-medium text-foreground">Published crop references</span> — selected crop cards show separately sourced water-requirement and duration references from TNAU and a Government of India parliamentary annexure. The tomato card also shows a TNAU field-guide pH range and loamy-soil guidance. These references are contextual only; they are not fed into the scoring engine because regional, variety and management conditions are not equivalent to validated Harohalli crop parameters.
          </li>
          <li>
            <span className="font-medium text-foreground">Not implemented</span> — SMAP soil moisture, MODIS
            NDVI/ET, and national soil-survey polygons. They are named as future integrations and no
            placeholder data is shown for them.
          </li>
        </ul>
      </Section>

      <Section kicker="Data flow" title="How climate and farm inputs become a score">
        <ol className="space-y-3 text-[11.5px] leading-relaxed">
          <li><strong>1. Location and request.</strong> The private workspace sends the saved farm coordinates to the NASA POWER Daily Point API using the AG community. The public demo instead uses a fixed recorded response for 12.6800°N, 77.4800°E covering 1 January 2020 to 31 December 2025.</li>
          <li><strong>2. Daily data processing.</strong> Missing and fill values are excluded, coverage is calculated, and daily values are aggregated into complete Kharif, Rabi and Summer windows. Incomplete season windows are not treated as complete evidence.</li>
          <li><strong>3. Climate variables used by the current score.</strong> Seasonal PRECTOTCORR rainfall totals, T2M mean temperature, derived counts of days with maximum temperature at or above 35°C or 38°C, and derived heavy-rain-day counts (at least 50 mm) feed the water and climate dimensions. The heat threshold is selected from the crop record.</li>
          <li><strong>4. Climate context not directly scored.</strong> RH2M, GWETROOT, ALLSKY_SFC_SW_DWN and WS2M are displayed as context in the climate explorer, but are not direct inputs to the current four-dimension scoring formula. GWETROOT remains a model-derived root-zone wetness variable, not a field measurement.</li>
          <li><strong>5. Farm and crop parameters.</strong> Farm pH, texture, organic carbon and irrigation status combine with crop water demand, pH range, temperature range, heat threshold, texture preferences, organic-carbon demand class, family and legume/flood flags. Demo records are labelled illustrative; published references are informational and do not replace the scoring fields.</li>
          <li><strong>6. Deterministic aggregation.</strong> The engine calculates soil, water and climate checks for each cropped season, calculates diversity across the whole sequence, averages available seasonal checks, then combines available dimensions using normalised weights. Missing dimensions are excluded and remaining weights are renormalised.</li>
        </ol>
        <p className="prose-note mt-3">The public comparison includes an expandable trace showing the actual demo inputs and intermediate values returned by the scoring engine. The trace does not introduce a separate scoring calculation.</p>
      </Section>

      <Section kicker="Gaps" title="Missing data and confidence">
        <p className="prose-note">
          Missing inputs are listed, never imputed. A dimension with no usable input is excluded and the UI
          marks it “excluded”; the remaining weights are renormalised. Confidence is a label, not a
          probability:
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { label: "High", text: "All soil inputs present, a climate snapshot loaded, ≥97% daily coverage, no demo crop parameters in the sequence." },
            { label: "Medium", text: "At most one hard gap, or coverage between 90% and 97%." },
            { label: "Low", text: "Two or more gaps, coverage below 90%, or demo crop parameters in use." },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-border/70 p-3">
              <p className="text-[12px] font-medium">{c.label}</p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="Limits" title="What this prototype does not claim">
        <ul className="grid gap-2 text-[12px] leading-relaxed text-muted-foreground sm:grid-cols-2">
          {[
            "No yield, biomass, income or profit prediction of any kind.",
            "No nutrient balance, erosion, pest or disease modelling.",
            "No field-scale observation: POWER is a coarse-grid reanalysis product.",
            "No variety-level parameters: crop values are single editable records.",
            "No interpolation of missing days and no imputation of missing farm inputs.",
            "No optimisation or ranking that claims a best rotation.",
            "No scientifically validated recommendation; results are a comparison aid.",
            "No satellite observation is shown unless it came back from a live API call.",
          ].map((t) => (
            <li key={t} className="rounded-lg bg-secondary/40 px-3 py-2">
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="Attribution" title="Credits">
        <p className="prose-note">
          Climate data: NASA Prediction Of Worldwide Energy Resources (POWER) project. Challenge framing:
          NASA Space Apps 2026, “Field Shift: Adapting Farms with NASA Data”. Pilot region: Harohalli and
          surrounding agricultural areas, Ramanagara district, Karnataka, India. Crop and soil parameter
          values in the shipped library are illustrative and are not sourced from a specific publication.
        </p>
      </Section>
    </div>
  );
}
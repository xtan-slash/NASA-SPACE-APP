import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Notice from "@/components/common/Notice";
import { ENGINE_VERSION, EFFECTIVE_RAIN_FACTOR, PH_PENALTY_PER_UNIT, TEMP_PENALTY_PER_DEG } from "@/lib/scoring";
import { IRRIGATION } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_app/method")({
  head: () => ({
    meta: [
      { title: "Method & limits · TerraShift AI" },
      { name: "description", content: "Full scoring formulas, constants, NASA POWER attribution and the explicit limitations of this prototype." },
    ],
  }),
  component: MethodPage,
});

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

function MethodPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Reference"
        title="Method & limits"
        description="Everything the score depends on, written down so a judge, an agronomist or a farmer can check it — and the list of what this prototype deliberately does not do."
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
            <span className="font-medium text-foreground">Not implemented</span> — SMAP soil moisture, MODIS
            NDVI/ET, and national soil-survey polygons. They are named as future integrations and no
            placeholder data is shown for them.
          </li>
        </ul>
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
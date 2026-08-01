import { MotifArt } from "@/components/brand/motif-art";
import { Eyebrow, Rule } from "@/components/ui/primitives";
import type { Colorway } from "@/lib/content/designs";

/**
 * The three permitted colorways, shown on the artwork itself rather than as
 * abstract swatches — the point of the rule is how the plate reads, and a row
 * of hex chips would not show that.
 */
export function Colorways({ colorways }: { colorways: Colorway[] }) {
  return (
    <ol className="grid gap-px border hairline bg-stone/40 md:grid-cols-3">
      {colorways.map((colorway) => (
        <li key={colorway.slug} className="bg-ivory">
          <div className="aspect-[4/3] overflow-hidden">
            <MotifArt
              form="single-sprig"
              colorway={colorway.slug}
              alt={`${colorway.name} colorway — ${colorway.linework.name} linework on ${colorway.ground.name.toLowerCase()}`}
            />
          </div>

          <div className="p-9 lg:p-11">
            <h3 className="font-display text-display-sm">{colorway.name}</h3>
            <Rule className="my-6 max-w-16" />

            <dl className="space-y-3">
              {[
                ["Ground", colorway.ground],
                ["Linework", colorway.linework],
                ["Accent", colorway.accent],
              ].map(([label, value]) => {
                const swatch = value as Colorway["ground"];
                return (
                  <div
                    key={label as string}
                    className="flex items-center gap-3"
                  >
                    <span
                      aria-hidden
                      className="size-4 shrink-0 rounded-full border border-espresso/15"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <Eyebrow as="span" className="w-20 shrink-0">
                      {label as string}
                    </Eyebrow>
                    <span className="text-sm text-espresso-soft">
                      {swatch.name}
                    </span>
                  </div>
                );
              })}
            </dl>

            <p className="mt-6 text-sm text-espresso-muted">{colorway.use}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

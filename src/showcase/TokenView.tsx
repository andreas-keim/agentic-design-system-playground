import { Braces, Download } from "lucide-react"

export function TokenView() {
  const sampleTokens = [
    { name: "--color-background-primary-default", value: "#6d28d9", role: "action.primary.default", type: "color" },
    { name: "--color-background-primary-hover", value: "#5b21b6", role: "action.primary.hover", type: "color" },
    { name: "--color-text-primary-default", value: "#ffffff", role: "text.primary.default", type: "color" },
    { name: "--color-text-destructive-default", value: "#b91c1c", role: "text.destructive.default", type: "color" },
    { name: "--color-border-primary-default", value: "#7c3aed", role: "border.primary.default", type: "color" },
    { name: "--space-component-sm", value: "8px", role: "space.component.sm", type: "dimension" },
    { name: "--space-component-md", value: "16px", role: "space.component.md", type: "dimension" },
    { name: "--radii-md", value: "6px", role: "radii.md", type: "dimension" },
    { name: "--font-size-md", value: "14px", role: "typography.size.md", type: "dimension" },
    { name: "--font-family-base", value: "'Geist Variable'", role: "typography.family.base", type: "fontFamily" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Braces className="h-5 w-5 text-primary" />
            W3C Design Token Architecture
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compliant with W3C DTCG community specification (<code className="font-mono text-xs bg-muted px-1 rounded">design.json</code>), compiled via Style Dictionary.
          </p>
        </div>

        <a
          href="https://github.com/andreas-keim/agentic-design-system-playground/blob/main/design.json"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground hover:bg-muted/50 transition-colors shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          View design.json
        </a>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">CSS Custom Property</th>
                <th className="py-2.5 px-4">W3C Semantic Role</th>
                <th className="py-2.5 px-4">Computed Value</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sampleTokens.map((token) => (
                <tr key={token.name} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-foreground">{token.name}</td>
                  <td className="py-2.5 px-4 text-blue-500">{token.role}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{token.value}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{token.type}</td>
                  <td className="py-2.5 px-4">
                    {token.type === "color" ? (
                      <span
                        className="inline-block h-4 w-7 rounded border border-border shadow-2xs"
                        style={{ backgroundColor: token.value }}
                      />
                    ) : (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

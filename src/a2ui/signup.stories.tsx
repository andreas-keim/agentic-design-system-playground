import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { MessageProcessor } from "@a2ui/web_core/v0_9"
import { A2uiSurface } from "@a2ui/react/v0_9"

import { playgroundCatalog } from "./catalog"
import { fixtures } from "./fixtures"

type Msg = Record<string, unknown>
function withDestructiveLoginLink(messages: Msg[]): Msg[] {
  const copy = structuredClone(messages) as { updateComponents?: { components: { id: string; variant?: string }[] } }[]
  copy.forEach((m) => m.updateComponents?.components.forEach((c) => { if (c.id === "login") c.variant = "destructive" }))
  return copy as Msg[]
}

function Demo({ fixtureName, destructiveLoginLink }: { fixtureName: string; destructiveLoginLink?: boolean }) {
  const [log, setLog] = useState<string[]>([])
  const [processor] = useState(() => {
    const p = new MessageProcessor([playgroundCatalog], (action) =>
      setLog((l) => [...l, JSON.stringify(action).slice(0, 160)]),
    )
    const base = fixtures.find((f) => f.name === fixtureName)!.messages
    p.processMessages((destructiveLoginLink ? withDestructiveLoginLink(base) : base) as never)
    return p
  })
  const surfaces = Array.from(processor.model.surfacesMap.values())
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 p-[var(--space-component-md)]">
      {surfaces.map((s) => (
        <A2uiSurface key={(s as { id: string }).id} surface={s as never} />
      ))}
      <pre className="text-xs text-muted-foreground">{log.length ? log.join("\n") : "Noch keine Aktion ausgelöst."}</pre>
    </div>
  )
}

const meta = { title: "A2UI/Sign-up aus Agent-Nachrichten", component: Demo } satisfies Meta<typeof Demo>
export default meta
export const GueltigerSignUp: StoryObj<typeof meta> = { args: { fixtureName: "01 gültiger Sign-up" } }
// Gültig laut Schema und Regeln, aber der Login-Link ist rot: die Lücke aus README und Post.
export const DestructiveLoginLink: StoryObj<typeof meta> = {
  args: { fixtureName: "01 gültiger Sign-up", destructiveLoginLink: true },
}

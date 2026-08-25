import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button"

const meta = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: "default" },
}

export const Outline: Story = {
  args: { variant: "outline" },
}

export const Secondary: Story = {
  args: { variant: "secondary" },
}

export const Ghost: Story = {
  args: { variant: "ghost" },
}

export const Destructive: Story = {
  args: { variant: "destructive" },
}

export const Link: Story = {
  args: { variant: "link" },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-component-md)" }}>
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
      <Button size="icon" aria-label="icon">
        +
      </Button>
      <Button size="icon-xs" aria-label="icon-xs">
        +
      </Button>
      <Button size="icon-sm" aria-label="icon-sm">
        +
      </Button>
      <Button size="icon-lg" aria-label="icon-lg">
        +
      </Button>
    </div>
  ),
}

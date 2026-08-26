import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "./input"

const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    placeholder: "you@example.com",
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { type: "email" },
}

export const WithValue: Story = {
  args: { type: "email", defaultValue: "hi@potarastudio.com" },
}

export const Disabled: Story = {
  args: { type: "email", disabled: true, defaultValue: "hi@potarastudio.com" },
}

export const Invalid: Story = {
  args: { type: "email", "aria-invalid": true, defaultValue: "not-an-email" },
}

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password" },
}

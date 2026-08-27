import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button"
import { FormField } from "./form-field"

const meta = {
  title: "Components/FormField",
  component: FormField,
  args: {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
  },
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabelAction: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    labelAction: (
      <Button type="button" variant="link" className="h-auto p-0">
        Forgot password?
      </Button>
    ),
  },
}

export const WithError: Story = {
  args: {
    label: "Confirm password",
    type: "password",
    placeholder: "Repeat password",
    error: "Passwords do not match.",
  },
}

export const Disabled: Story = {
  args: {
    label: "Email",
    type: "email",
    defaultValue: "hi@potarastudio.com",
    disabled: true,
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"

import { SignUpPage } from "./sign-up-page"

const meta = {
  title: "Pages/SignUpPage",
  component: SignUpPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SignUpPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

import type { Meta, StoryObj } from "@storybook/react-vite"

import { LoginPage } from "./login-page"

const meta = {
  title: "Pages/LoginPage",
  component: LoginPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
      console.log("submit", values)
    },
    onForgotPassword: () => {
      // eslint-disable-next-line no-console
      console.log("forgot password")
    },
    onSignUp: () => {
      // eslint-disable-next-line no-console
      console.log("sign up")
    },
  },
}

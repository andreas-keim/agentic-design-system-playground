export function isPrimaryButton(component: string, variant: unknown) {
  return component === "Button" && (variant ?? "primary") === "primary"
}

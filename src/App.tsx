import { ShowcaseProvider } from "./showcase/ShowcaseContext"
import { AppShell } from "./showcase/AppShell"

function App() {
  return (
    <ShowcaseProvider>
      <AppShell />
    </ShowcaseProvider>
  )
}

export default App

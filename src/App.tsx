import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-4 bg-background">
      <Button>Primary Button</Button>
      <Button disabled>Disabled Button</Button>
    </div>
  )
}

export default App

import { LeftSidebar } from './components/LeftSidebar'
import './styles/index.css'

export default function App() {
  return (
    <div className="app-grid">
      <LeftSidebar />
      <main className="app-main">
        {/* Main character sheet content goes here */}
        <h1>D&D 3.5e Character Sheet</h1>
        <section>
          <p>
            This is your workspace for managing a character’s ability scores, skills, feats,
            and more. Use the left sidebar for tools like dice rolling and utilities.
          </p>
        </section>
      </main>
    </div>
  )
}
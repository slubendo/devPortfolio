import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import JournalApp from './projects/journal-app'
import GoalTracker from './projects/goal-tracker'
import KanbanTracker from './projects/kanban-tracker'
import MeetingNotes from './projects/meeting-notes'
import RecipeTracker from './projects/recipe-tracker'
import StudyTracker from './projects/study-tracker'
import TaskFlow from './projects/task-flow'
import WeeklyCalendar from './projects/weekly-calendar'
import WorkoutDashboard from './projects/workout-dashboard'



function App() {
  const [count, setCount] = useState(0)
  


  return (
    <>
   <BrowserRouter>
    <main>
      <Routes>
        <Route path='/' element={<StudyTracker />}></Route>
        <Route path='/goal-tracker' element={<GoalTracker/>}></Route>
        <Route path='/journal-app' element={<JournalApp />}></Route>
        <Route path='/kanban-tracker' element={<KanbanTracker/>}></Route>
        <Route path='/meeting-notes/' element={<MeetingNotes/>}></Route>
        <Route path='/recipe-tracker' element={<RecipeTracker/>}></Route>
        <Route path='/study-tracker' element={<StudyTracker/>}></Route>
        <Route path='/task-flow' element={<TaskFlow/>}></Route>
        <Route path='/weekly-calendar' element={< WeeklyCalendar />}></Route>
        <Route path='/workout-dashboard' element={<WorkoutDashboard/>}></Route>
      </Routes>
    </main>
   </BrowserRouter>

    </>
  )
}

export default App

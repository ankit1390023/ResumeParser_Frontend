import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ATSChecker from './components/ATSChecker'
import ExtractedData from './components/ExtractedData'


function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<ATSChecker />} />
          <Route path="/extracted-data" element={<ExtractedData />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

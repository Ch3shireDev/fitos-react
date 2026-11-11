
import { Link, Route, Routes } from 'react-router'

function Home() {
  return (
      <nav>
        <ul>
          <li><Link to="/91D0">91D0 – Sosnowe bory bagienne</Link></li>
          <li><Link to="/7120">7120 – Torfowiska wysokie zdegradowane</Link></li>
        </ul>
      </nav>
  )
}

const Card91D0 = () => <h1>Karta 91D0</h1>
const Card7120 = () => <h1>Karta 7120</h1>

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/91D0" element={<Card91D0 />} />
        <Route path="/7120" element={<Card7120 />} />
        <Route path="*" element={<p>Nie ma takiego siedliska.</p>} />
      </Routes>
  )
}


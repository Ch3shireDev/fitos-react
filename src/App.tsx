import {Link, Route, Routes} from 'react-router'
import {Card91D0} from "./91D0/Card91D0.tsx";
import {Card7120} from "./7120/Card7120.tsx";

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


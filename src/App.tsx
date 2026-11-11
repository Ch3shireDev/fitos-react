import {Route, Routes} from 'react-router'
import {Card91D0} from "./91D0/Card91D0.tsx";
import {Card7120} from "./7120/Card7120.tsx";
import {Home} from "./home/Home.tsx";

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


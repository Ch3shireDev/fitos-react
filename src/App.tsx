import {Route, Routes} from 'react-router'
import {Card91D0} from "./91D0/Card91D0.tsx";
import {Card7120} from "./7120/Card7120.tsx";
import {Card40A0} from "./40A0/Card40A0.tsx";
import {Card65XX} from "./65XX/Card65XX.tsx";
import {Card6410} from "./6410/Card6410.tsx";
import {Card6510} from "./6510/Card6510.tsx";
import {Card91E0} from "./91E0/Card91E0.tsx";
import {Card91F0} from "./91F0/Card91F0.tsx";
import {Card91I0} from "./91I0/Card91I0.tsx";
import {Card91P0} from "./91P0/Card91P0.tsx";
import {Home} from "./home/Home.tsx";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/40A0" element={<Card40A0 />} />
        <Route path="/6410" element={<Card6410 />} />
        <Route path="/6510" element={<Card6510 />} />
        <Route path="/65XX" element={<Card65XX />} />
        <Route path="/7120" element={<Card7120 />} />
        <Route path="/91D0" element={<Card91D0 />} />
        <Route path="/91E0" element={<Card91E0 />} />
        <Route path="/91F0" element={<Card91F0 />} />
        <Route path="/91I0" element={<Card91I0 />} />
        <Route path="/91P0" element={<Card91P0 />} />
        <Route path="*" element={<p>Nie ma takiego siedliska.</p>} />
      </Routes>
  )
}


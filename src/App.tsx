import {useLayoutEffect} from 'react'
import {Route, Routes, useLocation} from 'react-router'
import {Home} from "./home/Home.tsx";
import {CARDS} from "./cards";

/** Po przejściu na inną stronę (np. kliknięcie kafelka karty) przewija okno na samą górę. */
function ScrollToTop() {
  const {pathname} = useLocation()
  useLayoutEffect(() => {
    // jsdom nie implementuje scrollTo – w testach to tylko szum w konsoli
    if (navigator.userAgent.includes('jsdom')) return
    window.scrollTo({top: 0, left: 0, behavior: 'instant'})
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        {CARDS.map(({code, Component}) => (
          <Route key={code} path={`/${code}`} element={<Component />} />
        ))}
        <Route path="*" element={<p>Nie ma takiego siedliska.</p>} />
      </Routes>
    </>
  )
}


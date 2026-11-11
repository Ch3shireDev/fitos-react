import { HabitatCardForm } from './components/habitat-form/HabitatCardForm'
import { examples7120 } from './habitats/7120/examples'
import { methodology7120 } from './habitats/7120/methodology'

export const Card7120 = () => <HabitatCardForm methodology={methodology7120} examples={examples7120} />

import { HabitatCardForm } from '../7120/components/habitat-form/HabitatCardForm'
import { rdosXlsxExport } from '../rdos/exportXlsx'
import { examples6510 } from './habitats/examples'
import { methodology6510, rdosProfile6510 } from './habitats/methodology'

const exports6510 = [rdosXlsxExport(rdosProfile6510)]

export const Card6510 = () => <HabitatCardForm methodology={methodology6510} examples={examples6510} exports={exports6510} />

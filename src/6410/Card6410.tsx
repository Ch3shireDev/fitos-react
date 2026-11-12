import { HabitatCardForm } from '../7120/components/habitat-form/HabitatCardForm'
import { rdosXlsxExport } from '../rdos/exportXlsx'
import { examples6410 } from './habitats/examples'
import { methodology6410, rdosProfile6410 } from './habitats/methodology'

const exports6410 = [rdosXlsxExport(rdosProfile6410)]

export const Card6410 = () => <HabitatCardForm methodology={methodology6410} examples={examples6410} exports={exports6410} />

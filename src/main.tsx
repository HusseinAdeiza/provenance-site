/**
 * main.tsx — entry point.
 *
 * Figures are baked at BUILD time by build.ts, which reads the running Canton
 * stack AND proof.json (the eval suite's own output) and fails the build if
 * either is unreachable or red. The browser makes no API call: the numbers are
 * in the bundle, and they were verified seconds before it was produced.
 */
import { site } from './data/site'
import { Sections } from './sections'
import './styles/tokens.css'
import './styles/layout.css'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <Sections d={site} key={JSON.stringify(site)} />,
)

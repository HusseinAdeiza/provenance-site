/**
 * Vite injects CSS as a side-effect import. TypeScript needs to be told those
 * specifiers resolve to a stylesheet rather than a module, otherwise
 * `import './styles/tokens.css'` fails under `moduleResolution: bundler`.
 */
declare module '*.css' {
  const css: string
  export default css
}
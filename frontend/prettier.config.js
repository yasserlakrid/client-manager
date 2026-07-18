/** @type {import("prettier").Config} */
const config = {
  // ─── Indentation & Spacing ──────────────────────────────────────────────────
  tabWidth: 2,              // Number of spaces per indentation level
  useTabs: false,           // Indent with tabs instead of spaces
  bracketSpacing: true,     // Print spaces between brackets: { foo: bar }

  // ─── Line Length & Wrapping ─────────────────────────────────────────────────
  printWidth: 100,          // Wrap lines at this column count (soft limit)
  proseWrap: "preserve",    // Markdown wrapping: "always" | "never" | "preserve"

  // ─── Quotes ─────────────────────────────────────────────────────────────────
  singleQuote: true,        // Use single quotes instead of double quotes in JS/TS
  jsxSingleQuote: false,    // Use single quotes in JSX attributes
  quoteProps: "as-needed",  // Quote object props: "as-needed" | "consistent" | "preserve"

  // ─── Semicolons ─────────────────────────────────────────────────────────────
  semi: true,               // Print semicolons at end of statements

  // ─── Trailing Commas ────────────────────────────────────────────────────────
  trailingComma: "es5",     // Trailing commas: "none" | "es5" | "all"

  // ─── Brackets & Parens ──────────────────────────────────────────────────────
  bracketSameLine: false,   // Put > of multiline JSX on same line as last prop
  arrowParens: "always",    // Arrow fn parens: "always" | "avoid"

  // ─── HTML / JSX ─────────────────────────────────────────────────────────────
  htmlWhitespaceSensitivity: "css",   // HTML whitespace: "css" | "strict" | "ignore"
  jsxBracketSameLine: false,          // (deprecated alias for bracketSameLine)

  // ─── End of Line ────────────────────────────────────────────────────────────
  endOfLine: "lf",          // Line endings: "lf" | "crlf" | "cr" | "auto"

  // ─── Embedded Languages ─────────────────────────────────────────────────────
  embeddedLanguageFormatting: "auto", // Format embedded code (CSS-in-JS etc): "auto" | "off"

  // ─── Vue / Angular ──────────────────────────────────────────────────────────
  vueIndentScriptAndStyle: false,     // Indent <script> and <style> in .vue files

  // ─── Experimental ───────────────────────────────────────────────────────────
  experimentalTernaries: false,       // "Curious ternary" style (Prettier v3+)

  // ─── Misc ───────────────────────────────────────────────────────────────────
  singleAttributePerLine: false,      // One HTML/JSX attribute per line
};

export default config;

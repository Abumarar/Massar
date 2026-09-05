/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#14222b',
    tint: '#0e5665',

    // Core surfaces
    background: '#f7f8f5',
    foreground: '#14222b',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#14222b',

    // Primary action color (buttons, links, active states)
    primary: '#0e5665',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#e8f0ee',
    secondaryForeground: '#0e5665',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#eef1ee',
    mutedForeground: '#66757b',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#f4c95d',
    accentForeground: '#5c4300',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#dfe7e3',
    input: '#d4dfda',

    // Massar brand extensions
    ink: '#14222b',
    petrol: '#0e5665',
    petrolDark: '#093b47',
    gold: '#f4c95d',
    mint: '#d9eee7',
    mintStrong: '#4e9b88',
    coral: '#eb806c',
    routeLine: '#6db39e',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;

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
    text: '#101a2f',
    tint: '#101a2f',

    // Core surfaces
    background: '#f3f4f7',
    foreground: '#101a2f',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#101a2f',

    // Primary action color (buttons, links, active states)
    primary: '#101a2f',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#e8ecf3',
    secondaryForeground: '#101a2f',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#f0f2f5',
    mutedForeground: '#687386',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#ff7a1a',
    accentForeground: '#ffffff',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#dfe3ea',
    input: '#c9d0db',

    // Massar brand extensions
    ink: '#101a2f',
    petrol: '#101a2f',
    petrolDark: '#0c1426',
    gold: '#ff7a1a',
    mint: '#e9eef5',
    mintStrong: '#53627a',
    coral: '#ff7a1a',
    routeLine: '#ff7a1a',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;

/**
 * Semantic design tokens for the mobile app.
 *
 * Derived from the Massar logo palette:
 *   - Deep Navy:    #1B2541  (the "M" background)
 *   - Vibrant Orange: #F5841F (the road swoosh)
 *   - Clean White:  #FFFFFF  (the letter "M")
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1B2541',
    tint: '#F5841F',

    // Core surfaces
    background: '#F4F5F8',
    foreground: '#1B2541',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#1B2541',

    // Primary action color (buttons, links, active states)
    primary: '#F5841F',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#EEF1F6',
    secondaryForeground: '#1B2541',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F0F2F5',
    mutedForeground: '#7A8599',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F5841F',
    accentForeground: '#FFFFFF',

    // Destructive actions (delete, error states)
    destructive: '#E5443F',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#E0E4EB',
    input: '#CDD3DE',

    // Massar brand extensions
    ink: '#1B2541',
    petrol: '#1B2541',
    petrolDark: '#131B30',
    petrolLight: '#2A3658',
    gold: '#F5841F',
    goldLight: '#FFAD5C',
    goldSoft: '#FFF3E5',
    mint: '#EEF2F8',
    mintStrong: '#5A6A84',
    coral: '#F5841F',
    routeLine: '#F5841F',
    success: '#22B573',
    successSoft: '#E6F8EF',
  },

  dark: {
    // Legacy aliases
    text: '#F0F2F5',
    tint: '#F5841F',

    // Core surfaces
    background: '#0E1423',
    foreground: '#F0F2F5',

    // Cards / elevated surfaces
    card: '#1B2541',
    cardForeground: '#F0F2F5',

    // Primary action color
    primary: '#F5841F',
    primaryForeground: '#FFFFFF',

    // Secondary
    secondary: '#232E47',
    secondaryForeground: '#E0E4EB',

    // Muted
    muted: '#1A2438',
    mutedForeground: '#8A96AB',

    // Accent
    accent: '#F5841F',
    accentForeground: '#FFFFFF',

    // Destructive
    destructive: '#E5443F',
    destructiveForeground: '#FFFFFF',

    // Borders
    border: '#2A3658',
    input: '#2A3658',

    // Massar brand extensions
    ink: '#F0F2F5',
    petrol: '#F0F2F5',
    petrolDark: '#0E1423',
    petrolLight: '#3A4B6B',
    gold: '#F5841F',
    goldLight: '#FFAD5C',
    goldSoft: '#2A2015',
    mint: '#1A2438',
    mintStrong: '#8A96AB',
    coral: '#F5841F',
    routeLine: '#FFAD5C',
    success: '#22B573',
    successSoft: '#132A1F',
  },

  // Border radius (in px).
  radius: 8,
};

export default colors;

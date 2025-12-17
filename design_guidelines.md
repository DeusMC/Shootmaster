# Design Guidelines: Mobile 3D Open-World Shooter

## Architecture Decisions

### Authentication
**No Authentication Required** - Single-player game with local data storage.
- **Profile/Settings Screen Required:**
  - Player avatar selection (3 preset sci-fi/tactical avatars matching the shooter aesthetic)
  - Callsign/Display name field (max 12 characters)
  - Game settings: Graphics quality (Low/Medium/High), sensitivity sliders, haptic feedback toggle
  - Audio settings: Master volume, SFX, music toggles
- **Data Persistence:** Use AsyncStorage for player stats, unlocked weapons, and cached AI-generated missions

### Navigation Architecture
**Stack-Only Navigation** with In-Game HUD overlay.

The app follows a linear flow designed for immersive gameplay:
1. **Main Menu** (entry point)
2. **Game World** (primary experience)
3. **Pause Menu** (modal overlay)
4. **Inventory/Loadout** (modal screen)
5. **Mission Briefing** (modal screen)
6. **Settings** (modal screen)

No tab bar - all navigation during gameplay is via HUD buttons and pause menu.

## Screen Specifications

### 1. Main Menu Screen
- **Purpose:** Game entry point, access to settings and start game.
- **Layout:**
  - Full-screen background with subtle animated gradient (dark military greens/grays)
  - Top safe area (insets.top + Spacing.xl): App logo/title
  - Center: Large "START MISSION" button
  - Bottom safe area (insets.bottom + Spacing.xl): Row of icon buttons (Settings, Stats, Exit)
- **Components:** Large touchable cards with haptic feedback, system icons
- **Header:** None

### 2. Game World Screen (Main Gameplay)
- **Purpose:** 3D open-world where player moves, shoots, and completes missions.
- **Layout:**
  - Fullscreen 3D canvas (zero padding/margin)
  - HUD overlay (non-scrollable, absolute positioned elements)
  - Top-left: Health bar, ammo counter, mini-map
  - Top-right: Current mission objective text (collapsible)
  - Bottom-left: Virtual joystick for movement
  - Bottom-right: Aim/shoot button, weapon switch button
  - Top-center: Floating "Pause" icon button
- **Safe Area Insets:**
  - Top HUD elements: insets.top + Spacing.md
  - Bottom controls: insets.bottom + Spacing.md
  - Side elements: Spacing.lg from edges
- **Components:** Semi-transparent HUD panels, circular touch zones for controls, progress bars

### 3. Pause Menu (Modal)
- **Purpose:** Access inventory, settings, or exit game without losing progress.
- **Layout:**
  - Semi-transparent dark overlay (opacity 0.85)
  - Center card with rounded corners
  - Vertical list: Resume, Inventory, Current Mission, Settings, Exit to Menu
  - Top inset: insets.top + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- **Components:** List of large touchable rows with right chevron icons
- **Header:** Custom header with "PAUSED" title, no back button

### 4. Mission Briefing (Modal)
- **Purpose:** Display AI-generated mission details and accept/decline.
- **Layout:**
  - Semi-transparent overlay
  - Scrollable center card (max width 90% screen)
  - Header: Mission title (AI-generated)
  - Body: Objective description, target NPC, reward amount
  - Footer: Two buttons side-by-side (Decline | Accept)
  - Safe insets: All sides insets + Spacing.xl
- **Components:** Scrollable card, heading text, body text, dual action buttons
- **Submit Buttons:** Footer of card, not in header

### 5. Inventory/Loadout Screen (Modal)
- **Purpose:** View and switch weapons, see stats for equipped gun.
- **Layout:**
  - Full-screen modal with dark background
  - Top section: Currently equipped weapon (large display with 3D preview if possible, else icon + stats)
  - Middle: Horizontal scrollable list of unlocked weapons (cards with gun icons)
  - Bottom: "Equip" button (disabled if already equipped)
  - Top inset: headerHeight + Spacing.xl (custom header with back button)
  - Bottom inset: insets.bottom + Spacing.xl
- **Components:** Horizontal scrollable list, weapon stat cards, primary action button
- **Header:** Custom with left back button, title "LOADOUT"

### 6. Settings Screen (Modal)
- **Purpose:** Adjust game settings, view profile.
- **Layout:**
  - Standard navigation header with back button
  - Scrollable form layout
  - Sections: Profile (avatar + name), Graphics, Controls, Audio
  - Each section has multiple rows with sliders, toggles, or selectors
  - Top inset: Spacing.xl (default header)
  - Bottom inset: insets.bottom + Spacing.xl
- **Components:** Form sections, sliders, switches, avatar picker
- **Header:** Default navigation header with "Settings" title

## Design System

### Color Palette
**Dark Military Aesthetic:**
- **Primary:** #1A4D2E (Forest Green) - for health bars, positive actions
- **Secondary:** #FF6500 (Alert Orange) - for ammo, warnings, enemy indicators
- **Background:** #0A0E27 (Deep Navy) - main backgrounds
- **Surface:** #1C2541 (Slate) - HUD panels, cards
- **Text Primary:** #F0F3FF (Off-white)
- **Text Secondary:** #8D93AB (Muted Gray)
- **Accent:** #FFD23F (Gold) - rewards, mission objectives

### Typography
- **Title:** System Bold, 28px - Main menu headings
- **Heading:** System Semibold, 20px - Screen titles, mission names
- **Body:** System Regular, 16px - Descriptions, stats
- **Caption:** System Regular, 14px - HUD text, labels
- **Monospace:** System Monospace, 18px - Ammo counter, stats

### Visual Design Standards
- **Touchable Feedback:** All buttons have 0.7 opacity on press + subtle scale animation (0.95)
- **HUD Elements:** Semi-transparent backgrounds (opacity 0.6-0.75) with 2px solid borders in Primary or Secondary colors
- **Floating Action Buttons (Pause, Weapon Switch):**
  - Circular with diameter 60px
  - Background: Surface color with opacity 0.8
  - Shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- **Mission Cards:** Rounded corners (12px), solid background with subtle border glow effect
- **Icons:** Use Feather icons for UI (@expo/vector-icons) - NO EMOJIS
- **Weapon Icons:** Generate 4 unique weapon silhouettes (Pistol, Rifle, Shotgun, Sniper) as SVG assets with tactical aesthetic

### Critical Assets
1. **Player Avatars (3):** Sci-fi tactical helmets/facemasks in distinct colors (green, orange, blue)
2. **Weapon Icons (4):** Minimalist black silhouettes for Pistol, Rifle, Shotgun, Sniper
3. **Mini-Map Background:** Simple top-down grid texture for mini-map overlay
4. **Crosshair:** Centered reticle graphic (simple cross with dot)

### Accessibility & Performance
- **Touch Targets:** Minimum 44x44px for all interactive elements
- **HUD Contrast:** Ensure 4.5:1 contrast ratio between HUD text and semi-transparent backgrounds
- **Haptic Feedback:** On weapon fire, damage taken, mission complete
- **Performance:** HUD updates at 30fps minimum, animations use native driver
- **Loading States:** Show "Generating Mission..." with spinner when calling AI API
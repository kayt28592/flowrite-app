# FLOWRITE Design System 2.0 (Premium SaaS)

## 1. Brand Identity
- **Logo**: FLOWRITE (Angular, Strong, White on Dark)
- **Concept**: Strength, Reliability, Technology, Stability.
- **Tone**: Professional, Enterprise-ready, High-tech.

## 2. Color Palette (Dark Mode First)

### Backgrounds
- **Rich Black**: `#0B0F14` (Main Background)
- **Deep Navy**: `#121826` (Sidebar / Cards)
- **Surface**: `#1A2332` (Interactive Elements)

### Accents
- **Flow Blue**: `#2563EB` (Primary Brand Color - "Blue Glow")
- **Electric Blue**: `#3B82F6` (Hover States)
- **Cyber Cyan**: `#06B6D4` (Secondary Accents)

### Typography & Status
- **Text Primary**: `#F8FAFC` (White / Slate 50)
- **Text Secondary**: `#94A3B8` (Slate 400)
- **Success**: `#10B981` (Emerald 500)
- **Warning**: `#F59E0B` (Amber 500)
- **Error**: `#EF4444` (Red 500)

## 3. Typography
- **Headings**: `Space Grotesk` (Strong, tech) or `Inter` (if Space Grotesk unavailable).
  - Weights: 700 (Bold), 600 (SemiBold).
- **Body**: `Inter` or `Satoshi`.
  - Weights: 400 (Regular), 500 (Medium).

## 4. UI Components

### Buttons
- **Primary**: Blue Glow Gradient (`bg-blue-600` to `bg-blue-700`).
- **Secondary**: Glassmorphism (`bg-white/5` backdrop-blur).
- **Destructive**: Red Glow (`bg-red-500/10` text-red-500).

### Cards
- **Base**: Dark Navy (`#121826`) with subtle border (`border-white/5`).
- **Hover**: Scale up slightly, border glow (`border-blue-500/30`).

### Dashboard Layout
- **Sidebar**: Fixed left, Dark Navy, sharp corners.
- **Top Bar**: Glassmorphism, sticky.
- **Content Area**: Rich Black, generous padding.

## 5. Motion
- **Page Transitions**: Fade In + Slide Up (`y: 20` -> `y: 0`).
- **Hover Effects**: `scale: 1.02`, `transition-all duration-200`.
- **Skeleton Loading**: Pulse animation on dark placeholders.

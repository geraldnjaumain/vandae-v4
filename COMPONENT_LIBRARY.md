# Vadae UI Component Library

## Overview
A comprehensive, Notion-inspired component library built with **Shadcn/UI**, **Tailwind CSS**, and **TypeScript**. Designed for clean, minimalist interfaces with a focus on readability and user experience.

---

## 🎨 Design Philosophy

### Visual Style
- **Notion-inspired**: Clean, minimalist aesthetic
- **Font**: Inter (Google Fonts)
- **Colors**: 
  - Background: `#F7F7F5` (`bg-notion-bg`)
  - Border: `#E1E1E1` (`border-notion-border`)
  - White cards on subtle background
- **Shadows**: Minimal, hover-triggered
- **Borders**: Thin, subtle (`border-notion-border`)

---

## 📦 Installed Components

### Base Components (Shadcn)
```typescript
✅ Button       // Actions and CTAs
✅ Card         // Content containers (Notion-styled)
✅ Input        // Form inputs
✅ Badge        // Status indicators
✅ Separator    // Content dividers
✅ Sheet        // Mobile drawer/sidebar
✅ Dialog       // Modals
✅ ScrollArea   // Custom scrollbars
```

### Custom Components

#### Typography (`src/components/ui/typography.tsx`)
Enforces consistent, clean typography throughout the app.

**Variants:**
- `h1` - Large headings (4xl, bold, tight tracking)
- `h2` - Section headings (3xl, semibold)
- `h3` - Subsection headings (2xl, semibold)
- `h4` - Small headings (xl, semibold)
- `p` - Body text (slate-600)
- `lead` - Intro text (xl, slate-600)
- `small` - Fine print (sm, medium)
- `muted` - Secondary text (sm, slate-500)

**Usage:**
```tsx
import { Typography } from "@/components/ui/typography"

<Typography variant="h1">Dashboard</Typography>
<Typography variant="p">This is body text</Typography>
<Typography variant="muted">Secondary information</Typography>
```

---

## 🏗️ Layout Components

### NavSidebar (`src/components/layout/nav-sidebar.tsx`)
Collapsible navigation sidebar with responsive design.

**Features:**
- ✅ Desktop: Collapsible sidebar (64px ↔ 256px)
- ✅ Mobile: Sheet drawer
- ✅ Active state highlighting
- ✅ Icon-only mode when collapsed
- ✅ Smooth transitions

**Navigation Links:**
- Dashboard (`/dashboard`)
- Timetable (`/timetable`)
- Resources (`/resources`)
- Community (`/community`)
- AI Advisor (`/ai-advisor`)
- Settings (`/settings`)

**Usage:**
```tsx
import { NavSidebar } from "@/components/layout"

<NavSidebar />
```

### AppLayout (`src/components/layout/app-layout.tsx`)
Main application wrapper combining sidebar + content.

**Usage:**
```tsx
import { AppLayout } from "@/components/layout"

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        {/* Your content */}
      </div>
    </AppLayout>
  )
}
```

---

## 🎯 Card Component (Customized)

### Changes from Default Shadcn
- ❌ Removed heavy `shadow-sm`
- ✅ Added `border-notion-border`
- ✅ White background (`bg-white`)
- ✅ Hover effect: `hover:shadow-md`
- ✅ Smooth transitions

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Classes Today</CardTitle>
    <CardDescription>Your schedule</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Biology 101 - 2:00 PM</p>
  </CardContent>
</Card>
```

---

## 🌈 Color Palette

### Custom Colors (tailwind.config.ts)
```typescript
colors: {
  "notion-bg": "#F7F7F5",        // Main background
  "notion-border": "#E1E1E1",    // Subtle borders
}
```

### Shadcn Neutral Theme
Pre-configured with neutral gray tones:
- `background` - White
- `foreground` - Near-black
- `muted` - Light gray
- `accent` - Subtle gray

---

## 📱 Responsive Design

### Mobile-First Approach
All components are built with mobile-first principles:

```tsx
// Sidebar example
<aside className="hidden lg:flex ...">  {/* Desktop only */}
<Sheet>                                  {/* Mobile only */}
```

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (container max-width)

---

## 🚀 Quick Start Examples

### Dashboard Layout
```tsx
import { AppLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Typography } from "@/components/ui/typography"

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Typography variant="h1">Dashboard</Typography>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
```

### Form Example
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
    <Button className="w-full">Sign In</Button>
  </CardContent>
</Card>
```

---

## 🎨 Styling Conventions

### Class Name Ordering
1. Layout (flex, grid, block)
2. Sizing (w-, h-, p-, m-)
3. Typography (text-, font-)
4. Colors (bg-, text-, border-)
5. States (hover:, focus:, active:)
6. Responsive (sm:, md:, lg:)

### Using `cn()` Utility
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // Allow prop overrides
)} />
```

---

## 📚 Component Exports

### UI Components
```typescript
// All available via:
import { Button, Card, Input, ... } from "@/components/ui"
```

### Layout Components
```typescript
import { NavSidebar, AppLayout } from "@/components/layout"
```

---

## 🔧 Customization Guide

### Adding New Navigation Links
Edit `src/components/layout/nav-sidebar.tsx`:

```typescript
const navigation = [
  {
    name: "Your Page",
    href: "/your-page",
    icon: YourIcon,  // From lucide-react
  },
]
```

### Creating New Card Variants
```tsx
// Extend the Card component
<Card className="border-2 border-blue-200 bg-blue-50">
  {/* Custom styled card */}
</Card>
```

### Typography Customization
Already configured in `tailwind.config.ts`:
- Font: Inter
- Tight tracking for headings
- Readable line-height for body text

---

## ✨ Best Practices

1. **Always use Typography component** for text to ensure consistency
2. **Use Card component** for grouped content
3. **Leverage `cn()`** for conditional styling
4. **Keep colors semantic** (use CSS variables when possible)
5. **Test on mobile** - components are mobile-first
6. **Use AppLayout** for authenticated pages

---

## 📖 Further Reading

- [Shadcn/UI Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

**Component Library Version:** 1.0  
**Last Updated:** 2025-12-14  
**Status:** ✅ Production Ready

# Vadae Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     VADAE AUTH FLOW                         │
└─────────────────────────────────────────────────────────────┘

                        [Homepage /]
                             │
                 ┌──────────┴───────────┐
                 │                      │
          [Get Started]          [Sign In]
                 │                      │
                 ▼                      ▼
         ┌──────────────┐       ┌─────────────┐
         │   /signup    │       │   /login    │
         └──────┬───────┘       └──────┬──────┘
                │                      │
         ┌──────▼───────┬───────────────┘
         │              │
    [New User]    [Existing User]
         │              │
         │         ┌────▼────┐
         │         │ Auth ✓  │
         │         └────┬────┘
         │              │
         │         ┌────▼─────────────┐
         │         │ Middleware Check │
         │         └────┬─────┬───────┘
         │              │     │
         │         ┌────▼─┐ ┌─▼────────┐
         │         │ ✓  │ │ ✗        │
         │         │    │ │          │
         │     [Complete] [Incomplete]
         │         │        │
         │         │    ┌───▼──────┐
         │         │    │ Redirect │
         │         │    │    to    │
         │         │    │/onboarding
         └─────────┼────┘    │
                   │         │
            ┌──────▼─────────▼─────┐
            │   /onboarding         │
            │   ┌─────────────┐    │
            │   │   Step 1:   │    │
            │   │ University  │    │
            │   └──────┬──────┘    │
            │          │           │
            │   ┌──────▼──────┐    │
            │   │   Step 2:   │    │
            │   │   Major     │    │
            │   └──────┬──────┘    │
            │          │           │
            │   ┌──────▼──────┐    │
            │   │   Step 3:   │    │
            │   │  Interests  │    │
            │   │   (3-5)     │    │
            │   └──────┬──────┘    │
            │          │           │
            │   [Complete Setup]   │
            └──────────┬───────────┘
                       │
                ┌──────▼──────┐
                │  Update DB  │
                │  profiles:  │
                │  - university
                │  - major    │
                │  - interests│
                └──────┬──────┘
                       │
                ┌──────▼──────┐
                │  Redirect   │
                │     to      │
                │ /dashboard  │
                └──────┬──────┘
                       │
           ┌───────────▼───────────┐
           │    /dashboard         │
           │  (Protected Route)    │
           │                       │
           │  ✅ Authenticated     │
           │  ✅ Profile Complete  │
           │                       │
           │  Full App Access      │
           └───────────────────────┘


═══════════════════════════════════════════════════════════
                    MIDDLEWARE LOGIC
═══════════════════════════════════════════════════════════

┌─────────────┐
│ User Access │
│   Route     │
└──────┬──────┘
       │
       ▼
┌────────────────┐
│ Authenticated? │
└───┬────────┬───┘
    │        │
 ┌──▼─┐   ┌─▼───┐
 │ NO │   │ YES │
 └──┬─┘   └──┬──┘
    │         │
    │    ┌────▼────────────┐
    │    │ Public Route?   │
    │    │ (/,/login,etc)  │
    │    └────┬────────┬───┘
    │         │        │
    │      ┌──▼─┐   ┌─▼───┐
    │      │YES │   │ NO  │
    │      └──┬─┘   └──┬──┘
    │         │        │
    │     [Allow]  ┌───▼────────────┐
    │              │ Profile        │
    │              │ Complete?      │
    │              └───┬────────┬───┘
    │                  │        │
    │               ┌──▼─┐   ┌─▼───┐
    │               │YES │   │ NO  │
    │               └──┬─┘   └──┬──┘
    │                  │        │
    │              [Allow] ┌────▼─────┐
    │                     │ Redirect  │
    │                     │    to     │
    │                     │/onboarding│
    │                     └───────────┘
    │
    ▼
┌──────────┐
│ Redirect │
│    to    │
│ /login   │
└──────────┘


═══════════════════════════════════════════════════════════
                  ONBOARDING PROGRESS
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│                   Step Indicator                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [1]────────[2]────────[3]                              │
│   ✓          •          ○     (Current: Step 2)         │
│                                                         │
│  ✓ = Completed                                          │
│  • = Current                                            │
│  ○ = Pending                                            │
└─────────────────────────────────────────────────────────┘

STEP 1: University
┌─────────────────────────────────┐
│ University Name                 │
│ ┌─────────────────────────────┐ │
│ │ Stanford University         │ │
│ └─────────────────────────────┘ │
│                                 │
│           [Next →]              │
└─────────────────────────────────┘

STEP 2: Major
┌─────────────────────────────────┐
│ Major / Field of Study          │
│ ┌─────────────────────────────┐ │
│ │ Computer Science            │ │
│ └─────────────────────────────┘ │
│                                 │
│  [← Back]        [Next →]      │
└─────────────────────────────────┘

STEP 3: Interests (Select 3-5)
┌─────────────────────────────────┐
│ Selected: 3                     │
│                                 │
│ [Coding•] [Design•] [Writing•]  │
│ [Math  ] [Science] [Business]   │
│ [Art   ] [Music  ] [Sports  ]   │
│ [Gaming] [Reading] [Photo  ]    │
│ [Travel] [Cooking] [Fitness]    │
│                                 │
│ • = Selected                    │
│                                 │
│  [← Back]  [Complete Setup]     │
└─────────────────────────────────┘


═══════════════════════════════════════════════════════════
                    DATABASE UPDATES
═══════════════════════════════════════════════════════════

BEFORE Onboarding:
┌─────────────────────────────────┐
│ profiles                        │
├─────────────────────────────────┤
│ id: abc-123                     │
│ full_name: "Test User"          │
│ university: NULL                │
│ major: NULL                     │
│ interests: []                   │
└─────────────────────────────────┘

AFTER Onboarding:
┌─────────────────────────────────┐
│ profiles                        │
├─────────────────────────────────┤
│ id: abc-123                     │
│ full_name: "Test User"          │
│ university: "Stanford"          │
│ major: "Computer Science"       │
│ interests: ["Coding",           │
│             "Design",           │
│             "Writing"]          │
└─────────────────────────────────┘


═══════════════════════════════════════════════════════════
                   ROUTE PROTECTION
═══════════════════════════════════════════════════════════

PUBLIC ROUTES (No Auth Required):
├─ /                    (Homepage)
├─ /login               (Login page)
└─ /signup              (Signup page)

PROTECTED ROUTES (Auth + Complete Profile):
├─ /dashboard           (Main dashboard)
├─ /timetable           (Class schedule)
├─ /resources           (File vault)
├─ /community           (Study groups)
├─ /ai-advisor          (AI assistant)
└─ /settings            (User settings)

SPECIAL ROUTE (Auth + Incomplete Profile):
└─ /onboarding          (Profile setup)
                        Auto-redirect here if incomplete


═══════════════════════════════════════════════════════════
                    ERROR HANDLING
═══════════════════════════════════════════════════════════

LOGIN ERRORS:
┌────────────────────────────────────┐
│ ⚠ Invalid login credentials       │
└────────────────────────────────────┘

SIGNUP ERRORS:
┌────────────────────────────────────┐
│ ⚠ Email already in use             │
│ ⚠ Password must be 6+ chars        │
│ ⚠ Passwords don't match            │
└────────────────────────────────────┘

VALIDATION ERRORS:
┌────────────────────────────────────┐
│ ✗ Email: Invalid email address    │
│ ✗ Name: Min 2 characters required │
│ ✗ Interests: Select at least 3    │
└────────────────────────────────────┘

SUCCESS STATES:
┌────────────────────────────────────┐
│ ✓ Account created successfully    │
│ ✓ Profile updated                  │
│ ✓ Redirecting to dashboard...     │
└────────────────────────────────────┘
```

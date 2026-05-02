# CLAUDE.md

## Core Principles

**IMPORTANT**: Whenever you write code, it MUST follow SOLID design principles:
- **Single Responsibility**: Each class/function/component should have one reason to change.
- **Open-Closed**: Open for extension, closed for modification.
- **Liskov Substitution**: Subtypes should be substitutable for their base types.
- **Interface Segregation**: Clients should not be forced to depend on interfaces they don't use.
- **Dependency Inversion**: Depend on abstractions, not concretions.

Additional principles:
- Write clean, readable, and maintainable code.
- Prioritize user experience, especially for natural language input and parsing.
- Use TypeScript strictly to ensure type safety.
- Follow React best practices for component design and state management.
- Keep the codebase modular and testable.

## Development Workflow

1. **Setup**: Run `npm install` to install dependencies.
2. **Development**: Use `npm run dev` to start the development server at `http://localhost:3000`.
3. **Building**: Run `npm run build` to create a production build.
4. **Linting**: Execute `npm run lint` to check code quality and style.
5. **Testing**: Manually test features, especially natural language parsing and expense tracking.
6. **Version Control**: 
   - Write detailed commit messages explaining the changes and rationale
   - Commit all changes to the feature branch and specify a Jira key (ticket) in the commit message

## Architecture Overview

This is a Next.js 16 web application built with TypeScript and Tailwind CSS. It uses the App Router for routing and provides a natural language expense tracking experience.

### Key Technologies
- **Framework**: Next.js 16 with React 18
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Application Structure
- **State Management**: React Context (`AppContext.tsx`) for global app state
- **Components**: Modular UI components in `src/components/`
- **Utilities**: Core logic in `src/lib/` (parser for NL input, storage, insights)
- **Hooks**: Custom React hooks in `src/hooks/`
- **Types**: TypeScript definitions in `src/types/`
- **Data Persistence**: localStorage (no backend required)

### Features
- Natural language expense input with live parsing preview
- Category detection and override
- Budget tracking with visual rings
- Expense feed with inline editing
- Month navigation and historical data
- Batch import from bank statements

## Code Standards

- **TypeScript**: Use strict mode. Define types for all data structures, function parameters, and return values. Avoid `any` type.
- **React**: Use functional components with hooks. Follow React best practices for performance and state management.
- **Styling**: Use Tailwind CSS classes. Maintain consistent design tokens.
- **Naming Conventions**:
  - Variables and functions: camelCase
  - Components: PascalCase
  - Files: PascalCase for components, camelCase for utilities
  - Constants: UPPER_SNAKE_CASE
- **Imports**: Use the `@/` alias for `src/` directory imports. Group imports: React, third-party, local.
- **Error Handling**: Use try-catch for async operations. Provide meaningful error messages.
- **Comments**: Add comments for complex logic, not obvious code.
- **Code Formatting**: Follow ESLint and Prettier rules (configured via Next.js).

## Quality Gates

- **Linting**: All code must pass `npm run lint` without errors or warnings.
- **Type Checking**: TypeScript compilation must succeed with no type errors.
- **Build**: Production build must complete successfully.
- **Manual Testing**: Test all features, especially:
  - Natural language parsing accuracy
  - Expense addition, editing, and deletion
  - Budget calculations and visual updates
  - Data persistence across sessions
  - Responsive design on different screen sizes
- **Performance**: Ensure fast load times and smooth interactions.
- **Accessibility**: Follow WCAG guidelines for inclusive design.

## File Organization

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
│   ├── BudgetPanel.tsx     # Budget display with rings
│   ├── CategoryRing.tsx    # Individual budget ring
│   ├── ExpenseCard.tsx     # Single expense display
│   ├── ExpenseFeed.tsx     # List of expenses
│   ├── Header.tsx          # App header with navigation
│   ├── NLInput.tsx         # Natural language input component
│   └── ParsePreview.tsx    # Live parsing preview
├── context/
│   └── AppContext.tsx      # Global app state management
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and core logic
│   ├── insights.ts         # Spending insights and calculations
│   ├── parser.ts           # Natural language parsing logic
│   └── storage.ts          # localStorage operations
└── types/
    └── expense.ts          # TypeScript type definitions

docs/                       # Documentation
├── dev/
│   └── natural-language-implementation.md
└── user/
    ├── natural-language-guide.md
    └── screenshots/

Root files:
- next.config.js            # Next.js configuration
- package.json              # Dependencies and scripts
- tailwind.config.js        # Tailwind CSS configuration
- tsconfig.json             # TypeScript configuration
- postcss.config.js         # PostCSS configuration
- README.md                 # Project overview and setup
```
# implement-feature

Implement a new feature for Spill following SOLID principles.

## Instructions

Feature MUST: Follow SOLID (CLAUDE.md), use TypeScript strict, React hooks, AppContext, error handling.

## Arguments: `{{FEATURE_NAME}}`, `{{JIRA_TICKET}}`

## Process

1. **Plan**: Break down `{{FEATURE_NAME}}` into components, identify state
2. **Types**: Add to `src/types/expense.ts` or create type file
3. **Components**: Create in `src/components/` (PascalCase), logic to `src/lib/`
4. **State**: Update `AppContext.tsx` if needed
5. **Test**: `npm run dev`, test end-to-end, verify localStorage
6. **Quality**: Lint/build pass, no TypeScript errors

## Output

- Files modified with descriptions
- `npm run lint` ✓ | `npm run build` ✓
- Commit: `{{JIRA_TICKET}}: {{FEATURE_NAME}} - description`

## Errors

- **TypeScript**: See CLAUDE.md Code Standards
- **Integration**: Verify AppContext exports
- **State**: No duplicate properties
- **Storage**: Test with DevTools

## References

[CLAUDE.md](CLAUDE.md), [AppContext](src/context/AppContext.tsx), [Types](src/types/expense.ts)

# debug-issue

Systematically diagnose and resolve issues in Spill.

## Instructions

Debugging MUST: Isolate root cause systematically, examine source files, test hypotheses with minimal changes, verify no regressions, document findings.

## Arguments: `{{ISSUE_DESCRIPTION}}`, `{{AFFECTED_FEATURE}}`, `{{REPRODUCTION_STEPS}}`, `{{JIRA_TICKET}}`

## Process

1. **Reproduce**: Follow {{REPRODUCTION_STEPS}}, document vs. expected
2. **Scope**: Consistent? All users? Related to {{AFFECTED_FEATURE}}?
3. **Context**: Console errors, Network, localStorage, DevTools
4. **Root Cause**:
   - **Parsing**: `src/lib/parser.ts`, NLInput state, regex
   - **Storage**: `src/lib/storage.ts`, AppContext reducer, localStorage
   - **UI**: Props, CSS classes, responsive design
   - **State**: AppContext reducer, action types
5. **Test Hypotheses**: Create minimal test cases
6. **Fix**: Make targeted minimal changes
7. **Verify**: Reproduce (should pass), lint/build, test regressions

## Output

Root cause identified, files/lines with bug, fix applied (before/after), verification results, regression testing.
Commit: `{{JIRA_TICKET}}: Fix [issue]. Root cause: [explanation]`

## Debug Checklist

- [ ] Cleared cache/localStorage | Fresh incognito window
- [ ] Console errors/warnings checked | `npm run type-check` passes
- [ ] `npm run build` succeeds | `npm run lint` passes
- [ ] DevTools debugger/profiler used | Different browser tested

## References

[CLAUDE.md](CLAUDE.md), [src/lib/](src/lib/), [AppContext](src/context/AppContext.tsx)

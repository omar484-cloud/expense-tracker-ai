# test-nl-parsing

Test natural language parsing for accuracy, edge cases, and integration.

## Coverage

Amount extraction, category detection, date parsing (relative/absolute), multi-expense splitting, edge cases.

## Arguments: `{{INPUT_TEXT}}`, `{{EXPECTED_AMOUNT}}`, `{{EXPECTED_CATEGORY}}`, `{{JIRA_TICKET}}`

## Process

1. **Setup**: `npm run dev`, DevTools (F12)
2. **Basic**: Test simple ("coffee $5", "uber 28")
3. **Dates**: Test relative/absolute
4. **Categories**: Test detection and override
5. **Multi-Expense**: Test "X and Y" splitting
6. **Edge Cases**: Empty, malformed, special chars
7. **Preview**: Verify updates real-time
8. **Integration**: Feed/rings/persistence check

## Output

Pass/fail count, bugs discovered, edge cases failed, performance notes.
Commit: `{{JIRA_TICKET}}: Fix NL parsing for [case]`

## Issues & Solutions

| Issue | Solution |
|-------|----------|
| Category not detected | Expand parser.ts keywords |
| Date parsing fails | Check date-fns logic |
| Multi-expense split broken | Verify regex pattern |
| Preview not updating | Check ParsePreview re-render |

## References

[parser.ts](src/lib/parser.ts), [NLInput](src/components/NLInput.tsx), [ParsePreview](src/components/ParsePreview.tsx)
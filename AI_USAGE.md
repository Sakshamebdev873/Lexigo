# AI Usage Log

Per Bonus 4 of the assignment brief.

## What was generated with AI assistance

- Initial scaffolding of Mongoose models, Zod validation schemas, and the
  Express controller shape.
- First draft of the REST routes file and the GraphQL schema/resolver.
- Boilerplate for Vite + Vitest config and the initial React page layouts.

## What I reviewed / corrected manually

- **Cascade delete semantics.** The AI first draft deleted the case but left
  orphaned tasks. I added an explicit `TaskModel.deleteMany({ caseId })` call
  before `case.deleteOne()` in `caseController.deleteCase`, and documented the
  choice in the README.
- **Search regex escaping.** The initial `new RegExp(search, 'i')` allowed a
  user-typed `(` to throw a `SyntaxError`. Replaced with an escape of all regex
  metacharacters before constructing the pattern.
- **Zod + Mongoose double validation.** Initially only Mongoose validated on
  save; I added Zod at the route boundary so errors come back as structured
  `{ error, details.fieldErrors }` instead of raw Mongoose messages, which made
  the frontend error handling much cleaner.
- **Role gate placement.** First draft put `requireAdmin` as global middleware;
  I moved it to per-route so only DELETEs are gated.
- **GraphQL wiring.** I made sure the GraphQL mutation is actually invoked from
  the UI (CaseDetail "Quick stage update") rather than sitting as dead code —
  the brief explicitly calls this out.

## One bug where AI output was wrong and how I fixed it

The AI-generated `listCases` controller initially built its date-range filter
like this:

```ts
if (fromDate) q.nextHearingDate = { $gte: new Date(fromDate) };
if (toDate)   q.nextHearingDate = { $lte: new Date(toDate) };
```

Two separate assignments — so if both `fromDate` and `toDate` were provided,
the second line overwrote the first and only the upper bound was applied. The
"hearing date range" filter silently ignored the start date.

**Fix:** build the sub-object once, then add keys into it:

```ts
if (fromDate || toDate) {
  q.nextHearingDate = {};
  if (fromDate) q.nextHearingDate.$gte = new Date(fromDate);
  if (toDate)   q.nextHearingDate.$lte = new Date(toDate);
}
```

Caught by manually running the filter with both ends set and noticing results
included cases before the supposed `fromDate`.

## Code ownership

I can walk through every file in this submission: the data flow from the React
pages through `services/api.ts`, into the Express routes, Zod validation, the
controller → Mongoose boundary, and back. I can also explain the GraphQL
resolver, the role middleware, and every trade-off documented in the README.

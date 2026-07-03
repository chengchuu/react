The roadmap around **becoming operational in the React repo**, then moving quickly into **tests, tooling, reproducible bugs, and small architecture-adjacent work**.

**30-Day React Contribution Roadmap**

**Days 1-3: Local Environment**
1. Run baseline setup:
2. Create `react-notes.md`.
3. Record every command that fails, what fixed it, and what each major package seems to do.

**Days 4-6: Repo Map**
Read only:
```txt
packages/react
packages/react-dom
packages/react-reconciler
packages/scheduler
scripts
fixtures
```

Write a one-page map:
```txt
react: public APIs
react-dom: DOM renderer
react-reconciler: Fiber/reconciliation engine
scheduler: priority/task scheduling
scripts: build/test/release tooling
fixtures: manual debugging apps
```

**Day 7: First Debug Session**
Pick a fixture and trace a simple update:
```txt
setState/useState update
→ scheduler
→ reconciler
→ commit
→ DOM mutation
```

Do not aim for full understanding yet. Aim to know where to look.

**Days 8-10: Concepts Before Code**
Write short notes for:
```txt
Virtual DOM
Reconciliation
Fiber
Render phase
Commit phase
Scheduling
Lanes
```

For each:
```txt
Problem solved
Mental model
Key files
Small example
```

**Days 11-13: Learn the Test System**
Inspect existing tests near:
```txt
packages/react-dom/src/__tests__
packages/react-reconciler/src/__tests__
packages/react/src/__tests__
```

Run focused tests instead of the whole suite. Learn the repo’s test conventions before changing anything.

**Day 14: Pick a Tiny Investigation**
Find one warning, edge case, or failing reproduction you can understand. Avoid concurrency, scheduler semantics, and lane changes for now.

Good targets:
```txt
warning wording
missing regression test
test cleanup
build script issue
fixture issue
type/test mismatch
```

**Days 15-17: Reproduce First**
Before fixing anything, create a minimal reproduction or identify the exact existing test that should cover it.

Your contribution workflow should become:
```txt
Observe
→ Reproduce
→ Add/adjust test
→ Fix
→ Verify focused test
```

**Days 18-20: First PR Candidate**
Search issues, but also inspect small test gaps yourself.

Avoid:
```txt
performance rewrites
ReactFiberWorkLoop changes
scheduler behavior changes
large refactors
```

Prefer:
```txt
small bug with test
clear warning improvement
tooling/test infra cleanup
fixture improvement
```

**Days 21-23: Implement One Small Change**
Keep the diff boring and easy to review.

Checklist:
```txt
one behavioral intent
small test
no unrelated formatting
no drive-by refactors
clear commit message
```

**Days 24-25: Verify Like a Maintainer**
Run:
```bash
pnpm test <focused-target>
pnpm lint
```

If applicable, run the relevant build/test command from the repo’s own guidance.

**Days 26-27: Write the PR**
PR body should include:
```txt
Problem
Reproduction
Fix
Tests run
```

Keep it concise. Maintainers should understand the value in under 60 seconds.

**Days 28-30: Review Loop**
Respond calmly to feedback. If the PR stalls, keep learning from the area you touched.

Also write a short retrospective in `react-notes.md`:
```txt
What I changed
What I misunderstood
What files matter here
What I would inspect next
```

**Best Track For You**

Given your backend/tooling experience, I’d bias your first month toward:

```txt
tests
fixtures
scripts
build tooling
warnings
reproducible bugs
```

Then move inward:

```txt
react-dom behavior
reconciler tests
Fiber data structures
lanes/scheduling
```

The key shift is: don’t try to “learn React internals” abstractly forever. Use small tests as your flashlight. That’s how the repo starts becoming navigable instead of just enormous.

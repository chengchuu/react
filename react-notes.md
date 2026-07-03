# React Notes

## Environment

- OS: macOS Tahoe 2026
- Architecture: ARM64 / Apple Silicon M5
- Shell: zsh
- Node: v22.22.2
- npm: 10.9.7
- Yarn: v1.22.22
- Repo package manager: yarn@1.22.22

## Setup Commands

### yarn install

Result: Success

### yarn build

Result: Passed after environment fixes.

Fixes needed:
- Installed OpenJDK 17 so Closure Compiler could run.
- Ran `yarn install` inside `compiler/` so compiler workspace TypeScript dependencies were present.
- Used a writable npm cache when needed:
  `npm_config_cache=/private/tmp/npm-cache-react-build`

### yarn test

Result: Success

Notes:

Test Suites: 326 passed, 326 total
Tests:       23 skipped, 6811 passed, 6834 total
Snapshots:   304 passed, 304 total
Time:        50.33 s
Ran all test suites.
✨  Done in 51.62s.

## Failures And Fixes

### pnpm install

Failed because this repo is configured for Yarn, not pnpm.

Fix:

Use `yarn install`.

## Package Map Draft

### react: public APIs

`packages/react` is the public React package. Its entry points include `react`,
`react/jsx-runtime`, `react/jsx-dev-runtime`, `react/compiler-runtime`, and
React Server variants. The source files define the APIs most app authors import:
elements and JSX helpers, `Component`/`PureComponent`, `createRef`, `Children`,
`forwardRef`, `memo`, `lazy`, context, hooks, `act`, cache APIs, and transition
helpers. Good first files: `src/ReactClient.js`, `src/ReactHooks.js`,
`src/ReactBaseClasses.js`, `src/ReactChildren.js`, and `src/jsx/`.

### react-dom: DOM renderer

`packages/react-dom` connects React to browser and server DOM environments. Its
public entry points include `react-dom`, `react-dom/client`, `react-dom/server`,
`react-dom/static`, `react-dom/test-utils`, and profiling/testing variants. The
source is split into client, server, events, shared, and test-utils areas. This
is where DOM roots, hydration, browser events, DOM attributes/properties, forms,
Fizz server rendering, and DOM-specific behavior are tested. Good first files:
`src/client/`, `src/server/`, `src/events/`, `src/shared/`, and
`src/__tests__/ReactDOM*-test.js`.

### react-reconciler: Fiber/reconciliation engine

`packages/react-reconciler` is the core Fiber engine used by renderers. It
schedules and performs render work, compares children, manages hooks, context,
updates, lanes, Suspense, errors, and commit effects. Renderers plug into it
through host config forks such as DOM, native, test, noop, markup, and custom.
The README describes the host config boundary: render phase creates/prepares
work; commit phase applies host mutations. Good landmark files:
`src/ReactFiberWorkLoop.js`, `src/ReactFiberBeginWork.js`,
`src/ReactFiberCompleteWork.js`, `src/ReactFiberCommitWork.js`,
`src/ReactFiberHooks.js`, `src/ReactFiberLane.js`, `src/ReactFiberReconciler.js`,
and `src/forks/ReactFiberConfig.*.js`.

### scheduler: priority/task scheduling

`packages/scheduler` is a small cooperative scheduling package used by React. It
contains priority definitions, a min-heap, profiling support, browser/native
forks, a postTask fork, and a mock scheduler for deterministic tests. It is not
the whole React update system; it is one lower-level tool the reconciler can use
to schedule work. Good first files: `src/SchedulerPriorities.js`,
`src/SchedulerMinHeap.js`, `src/forks/Scheduler.js`, and
`src/forks/SchedulerMock.js`.

### scripts: build/test/release tooling

`scripts` contains repo tooling. Major areas: `rollup/` builds bundles and
release channels; `jest/` configures and runs source/build tests; `flow/`
generates Flow configs and runs Flow; `tasks/` wraps lint, Flow, version checks,
and changelog tooling; `eslint-rules/` holds custom repo lint rules;
`error-codes/` extracts production error codes; `release/` builds, validates,
packs, and publishes releases; `react-compiler/` links/builds the compiler
package; `babel/` contains test/build transforms; `bench/` and `devtools/` hold
specialized tooling.

### fixtures: manual debugging apps

`fixtures` contains standalone apps and reproductions for manual debugging,
integration checks, demos, and compatibility testing. Examples include DOM
behavior, attribute behavior, Fiber debugger, Fizz SSR, Flight/RSC, DevTools
regression pages, scheduling profiler, ESLint-version fixtures, nesting/owner
stack/stacks fixtures, SSR fixtures, view transitions, and benchmark fixtures.
These are useful when a behavior is easier to inspect in a running app than in a
unit test.

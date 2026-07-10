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

## Day 7: First Debug Session

### Fixture

Selected fixture: `fixtures/dom`, Mouse Events, Mouse Movement.

Source: `fixtures/dom/src/components/fixtures/mouse-events/mouse-movement.js`

Trigger:

```js
onMove = event => {
  this.setState({x: event.movementX, y: event.movementY});
};
```

This fixture uses `mousemove`, which React classifies as a continuous event.
That makes it a useful example because its update is scheduled through the
standalone Scheduler package. A discrete click update can instead take React's
synchronous microtask path.

Run the fixture with:

```bash
cd fixtures/dom
yarn
yarn dev
```

Open `http://localhost:3000/mouse-events/mouse-movement` and use the Mouse
Movement box. Loading the component directly avoids mounting the neighboring
Mouse Enter fixture.

The parent route, `http://localhost:3000/mouse-events`, currently throws
`TypeError: ReactDOM.render is not a function`. Its `mouse-enter.js` fixture
still calls the legacy `ReactDOM.render` API, which is not exported by the local
React 19 build. This unrelated fixture failure is intentionally bypassed for
the Day 7 trace rather than fixed as part of the debugging exercise.

### Update Trace

```txt
MouseMovement.onMove
-> Component.prototype.setState
-> classComponentUpdater.enqueueSetState
-> requestUpdateLane
-> enqueueUpdate
-> scheduleUpdateOnFiber
-> ensureRootIsScheduled
-> scheduleTaskForRootDuringMicrotask
-> Scheduler.unstable_scheduleCallback
-> Scheduler workLoop
-> performWorkOnRootViaSchedulerTask
-> performWorkOnRoot
-> processUpdateQueue
-> MouseMovement.render
-> complete Fiber work
-> commitRoot
-> commitMutationEffects
-> commitHostTextUpdate
-> commitTextUpdate
-> textInstance.nodeValue = newText
```

### Landmarks

- `packages/react/src/ReactBaseClasses.js`: public `setState` validates the
  value and delegates to `this.updater.enqueueSetState`.
- `packages/react-reconciler/src/ReactFiberClassComponent.js`:
  `enqueueSetState` finds the component Fiber, chooses a lane, creates the
  update, queues it, and calls `scheduleUpdateOnFiber`.
- `packages/react-dom-bindings/src/events/ReactDOMEventListener.js`:
  `mousemove` maps to `ContinuousEventPriority`.
- `packages/react-reconciler/src/ReactFiberWorkLoop.js`:
  `requestUpdateLane` converts the event priority to `InputContinuousLane`;
  `scheduleUpdateOnFiber` marks the root as updated.
- `packages/react-reconciler/src/ReactFiberRootScheduler.js`: the root
  scheduler maps continuous work to User Blocking Scheduler priority and
  schedules `performWorkOnRootViaSchedulerTask`.
- `packages/scheduler/src/forks/Scheduler.js`: `unstable_scheduleCallback`
  queues a task, and `workLoop` invokes its callback when the browser host gives
  Scheduler time.
- `packages/react-reconciler/src/ReactFiberClassUpdateQueue.js`:
  `processUpdateQueue` merges the pending partial state into the class state.
- `packages/react-reconciler/src/ReactFiberCompleteWork.js`: `updateHostText`
  compares old and new text and marks changed HostText Fibers with `Update`.
- `packages/react-reconciler/src/ReactFiberCommitWork.js`: the HostText commit
  path calls `commitHostTextUpdate`.
- `packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js`:
  `commitTextUpdate` performs the browser mutation by assigning
  `textInstance.nodeValue`.

### Debugger Notes

Useful breakpoint names:

```txt
enqueueSetState
scheduleUpdateOnFiber
scheduleTaskForRootDuringMicrotask
unstable_scheduleCallback
performWorkOnRootViaSchedulerTask
processUpdateQueue
updateHostText
commitHostTextUpdate
commitTextUpdate
```

Use Resume between asynchronous breakpoints. Stepping from `setState` alone
cannot cross into the later Scheduler task.

The fixture initially stores `{movement: {x, y}}`, while `render` reads
top-level `state.x` and `state.y`. The first mouse movement therefore creates
the dynamic text nodes. Trace a second movement to observe the cleaner HostText
update path ending in `nodeValue` assignment.

### What I Learned

- `setState` queues an update; it does not directly change the DOM.
- The current event priority helps React choose an update lane.
- React's root scheduler decides whether work should use the Scheduler package.
- The render phase computes and marks changes without mutating the browser DOM.
- The commit mutation phase crosses the renderer host-config boundary and
  performs the actual DOM operation.
- I do not need to understand every Fiber branch yet. I now know the main files
  and function names to inspect for a class state update.

## Days 8-10: Concepts Before Code

### Virtual DOM

**Problem solved:** Application code needs a declarative way to describe the UI
it wants without manually coordinating every DOM creation, update, and removal.

**Mental model:** A React element tree is an immutable snapshot or blueprint of
the desired UI. React elements are what people usually mean by "Virtual DOM."
They are not browser DOM nodes, and they are not the same thing as Fibers.

**Key files:** `packages/react/src/jsx/ReactJSXElement.js` creates React
elements. `packages/shared/ReactTypes.js` defines shared element types.
`packages/react-reconciler/src/ReactChildFiber.js` consumes new element values
while building the next Fiber tree. There is no single `VirtualDOM.js` file.

**Small example:**

```jsx
// Two descriptions of desired UI, not two DOM nodes.
const before = <button>Save</button>;
const after = <button disabled>Saving...</button>;
```

React determines how to move the real DOM from `before` to `after`.

### Reconciliation

**Problem solved:** Given the previous rendered tree and a new element tree,
React must decide what can be reused, what moved, and what must be inserted,
updated, or deleted while preserving the correct component state.

**Mental model:** Reconciliation matches new children against current Fibers,
primarily using element type and key. A matching type and key can preserve a
Fiber's identity and state. Differences produce effect flags such as
`Placement`, `Update`, and deletion records for the later commit phase.

**Key files:** `packages/react-reconciler/src/ReactChildFiber.js` contains the
child matching and array reconciliation logic.
`packages/react-reconciler/src/ReactFiberBeginWork.js` asks for children to be
reconciled. `packages/react-reconciler/src/ReactFiberCompleteWork.js` finishes
host work and marks updates.

**Small example:**

```jsx
// Keys let the item with key="b" keep its identity while moving.
before = [<Row key="a" />, <Row key="b" />];
after = [<Row key="b" />, <Row key="a" />];
```

### Fiber

**Problem solved:** React needs persistent units of work so rendering can track
state and effects, prioritize updates, pause or restart work, and resume walking
a large component tree.

**Mental model:** A Fiber is a mutable internal record for one unit in the
rendered tree. Fibers link through `return`, `child`, and `sibling`. They store
props, state, update queues, lanes, and effect flags. React keeps a current tree
and builds its `alternate` work-in-progress tree for the next result.

**Key files:** `packages/react-reconciler/src/ReactInternalTypes.js` defines the
Fiber shape. `packages/react-reconciler/src/ReactFiber.js` creates Fibers and
work-in-progress alternates. `packages/react-reconciler/src/ReactFiberWorkLoop.js`
walks Fiber units.

**Small example:**

```txt
App Fiber
`- Counter Fiber
   `- button HostComponent Fiber
      `- "Count: 0" HostText Fiber
```

Updating `Counter` builds work-in-progress versions of the affected Fibers
instead of immediately changing the button DOM node.

### Render Phase

**Problem solved:** React must calculate the next tree and identify required
effects before publishing any partially computed UI to the host environment.

**Mental model:** The render phase processes update queues, calls components,
reconciles children, and constructs the work-in-progress tree. `beginWork`
travels down into children; `completeWork` finishes nodes while returning up.
This phase should be pure: it can yield, restart, or run more than once, and it
does not perform normal DOM mutations.

**Key files:** `packages/react-reconciler/src/ReactFiberWorkLoop.js`,
`ReactFiberBeginWork.js`, `ReactFiberCompleteWork.js`, `ReactFiberHooks.js`, and
`ReactFiberClassUpdateQueue.js`.

**Small example:** A count update from `0` to `1` runs the component again and
marks its HostText Fiber with `Update`. During render, the page can still show
`Count: 0`; React has only prepared the next result.

### Commit Phase

**Problem solved:** Once rendering completes, React must publish the finished
tree atomically, apply host changes, update refs, and run lifecycle effects in a
defined order.

**Mental model:** Commit is the non-interruptible publication step. Its major
parts are before-mutation work, host mutations, and layout effects. React makes
the finished Fiber tree current during this sequence. Passive effects such as
`useEffect` are scheduled and normally flushed afterward.

**Key files:** `packages/react-reconciler/src/ReactFiberWorkLoop.js` orchestrates
`commitRoot`. `ReactFiberCommitWork.js`, `ReactFiberCommitEffects.js`, and
`ReactFiberCommitHostEffects.js` apply Fiber effects. For DOM, the host boundary
is implemented in `packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js`.

**Small example:** A changed HostText Fiber reaches `commitHostTextUpdate`, then
the DOM host config runs:

```js
textInstance.nodeValue = newText;
```

### Scheduling

**Problem solved:** React must coordinate updates of different urgency without
letting expensive, less urgent rendering make important interactions feel
unresponsive.

**Mental model:** An update marks a root as having work. The root scheduler
selects the next lanes and decides how that work should run. Synchronous work
can flush through React's microtask path; other work is given to the standalone
Scheduler as a priority task. Scheduler manages task timing and yielding but
does not understand components or Fibers.

**Key files:** `packages/react-reconciler/src/ReactFiberRootScheduler.js` manages
the root schedule. `ReactFiberWorkLoop.js` performs selected work.
`packages/scheduler/src/forks/Scheduler.js`, `SchedulerPriorities.js`, and
`SchedulerMinHeap.js` implement cooperative task scheduling.

**Small example:** The Day 7 `mousemove` update gets continuous priority. The
root scheduler maps it to a User Blocking Scheduler task. Scheduler later calls
`performWorkOnRootViaSchedulerTask` and may yield when the browser needs time.

### Lanes

**Problem solved:** React needs to represent update priority, group related
updates, track pending work on a root, and choose which work may render together
or wait until later.

**Mental model:** Lanes are bitmasks attached to updates and Fibers. A single
lane represents a class of work; multiple lanes combine with bitwise operations
into a set. The root records pending lanes, and `getNextLanes` chooses the next
set based on priority, suspension, expiration, and related work. A lane is not a
thread; it is scheduling metadata.

**Key files:** `packages/react-reconciler/src/ReactFiberLane.js` defines lanes
and lane selection. `ReactFiberWorkLoop.js` contains `requestUpdateLane`.
`ReactFiberRootScheduler.js` uses lanes to schedule roots, and
`packages/react-reconciler/src/ReactEventPriorities.js` maps event priorities to
lanes.

**Small example:**

```txt
click                 -> SyncLane
mousemove             -> InputContinuousLane
ordinary async update -> DefaultLane
startTransition       -> a TransitionLane
```

React can render higher-priority lanes first while keeping lower-priority work
pending, unless related lanes need to be processed together.

### Combined Mental Model

```txt
React elements describe desired UI
-> reconciliation matches them against current Fibers
-> lanes describe the priority of pending Fiber work
-> scheduling decides when that work runs
-> render builds and marks the next Fiber tree
-> commit publishes it and performs DOM mutations
```

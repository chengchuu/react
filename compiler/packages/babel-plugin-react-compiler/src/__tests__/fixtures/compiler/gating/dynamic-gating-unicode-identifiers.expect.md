
## Input

```javascript
// @dynamicGating:{"source":"shared-runtime"} @compilationMode:"annotation"

function Foo() {
  // The condition contains U+0301, U+200C, and U+200D.
  'use memo if(isÉ‌‍nabled)';
  return <div>hello world</div>;
}

function Bar() {
  // U+037A is ID_Start, but not XID_Start.
  'use memo if(ͺgate)';
  return <div>hello world</div>;
}

```

## Code

```javascript
import { c as _c } from "react/compiler-runtime";
import { isÉ‌‍nabled, ͺgate } from "shared-runtime"; // @dynamicGating:{"source":"shared-runtime"} @compilationMode:"annotation"
const Foo = isÉ‌‍nabled()
  ? function Foo() {
      "use memo if(isÉ‌‍nabled)";
      const $ = _c(1);
      let t0;
      if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = <div>hello world</div>;
        $[0] = t0;
      } else {
        t0 = $[0];
      }
      return t0;
    }
  : function Foo() {
      // The condition contains U+0301, U+200C, and U+200D.
      "use memo if(isÉ‌‍nabled)";
      return <div>hello world</div>;
    };
const Bar = ͺgate()
  ? function Bar() {
      "use memo if(ͺgate)";
      const $ = _c(1);
      let t0;
      if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = <div>hello world</div>;
        $[0] = t0;
      } else {
        t0 = $[0];
      }
      return t0;
    }
  : function Bar() {
      // U+037A is ID_Start, but not XID_Start.
      "use memo if(ͺgate)";
      return <div>hello world</div>;
    };

```
      
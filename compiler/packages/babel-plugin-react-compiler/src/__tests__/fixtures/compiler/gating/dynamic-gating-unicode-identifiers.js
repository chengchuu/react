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

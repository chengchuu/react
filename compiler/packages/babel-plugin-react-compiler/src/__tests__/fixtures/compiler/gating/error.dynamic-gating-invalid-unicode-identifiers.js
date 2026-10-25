// @dynamicGating:{"source":"shared-runtime"}

function Foo() {
  'use memo if(gate²)';
  // U+0345 is alphabetic, but cannot start a JavaScript identifier.
  'use memo if(ͅgate)';
  return <div>hello world</div>;
}

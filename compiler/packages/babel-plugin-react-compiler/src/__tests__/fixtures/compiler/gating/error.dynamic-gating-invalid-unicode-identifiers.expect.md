
## Input

```javascript
// @dynamicGating:{"source":"shared-runtime"}

function Foo() {
  'use memo if(gate²)';
  // U+0345 is alphabetic, but cannot start a JavaScript identifier.
  'use memo if(ͅgate)';
  return <div>hello world</div>;
}

```


## Error

```
Found 2 errors:

Error: Dynamic gating directive is not a valid JavaScript identifier

Found 'use memo if(gate²)'.

error.dynamic-gating-invalid-unicode-identifiers.ts:4:2
  2 |
  3 | function Foo() {
> 4 |   'use memo if(gate²)';
    |   ^^^^^^^^^^^^^^^^^^^^^ Dynamic gating directive is not a valid JavaScript identifier
  5 |   // U+0345 is alphabetic, but cannot start a JavaScript identifier.
  6 |   'use memo if(ͅgate)';
  7 |   return <div>hello world</div>;

Error: Dynamic gating directive is not a valid JavaScript identifier

Found 'use memo if(ͅgate)'.

error.dynamic-gating-invalid-unicode-identifiers.ts:6:2
  4 |   'use memo if(gate²)';
  5 |   // U+0345 is alphabetic, but cannot start a JavaScript identifier.
> 6 |   'use memo if(ͅgate)';
    |   ^^^^^^^^^^^^^^^^^^^^^ Dynamic gating directive is not a valid JavaScript identifier
  7 |   return <div>hello world</div>;
  8 | }
  9 |
```
          
      
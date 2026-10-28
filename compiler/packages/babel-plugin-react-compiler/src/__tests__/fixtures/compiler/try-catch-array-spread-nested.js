function foo() {
  'use memo';
  try {
    try {
      return [...null];
    } catch {
      return 'inner catch';
    }
  } catch {
    return 'outer catch';
  }
}

export const FIXTURE_ENTRYPOINT = {
  fn: foo,
  params: [],
};

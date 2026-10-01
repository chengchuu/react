/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

// Keep the reproduction focused on the fixture's nested-root setup.
jest.mock('../components/TestCase', () => {
  const React = require('react');
  function TestCase({children}) {
    return React.createElement('div', null, children);
  }
  TestCase.Steps = TestCase;
  TestCase.ExpectedResult = TestCase;
  return TestCase;
});

describe('Mouse Enter fixture reproduction', () => {
  it('mounts both mouse-enter boxes with the current React APIs', async () => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const ReactDOMClient = require('react-dom/client');
    const {act} = React;
    const previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.ReactDOMClient = ReactDOMClient;

    const MouseEnter =
      require('../components/fixtures/mouse-events/mouse-enter').default;
    const container = document.createElement('div');
    const root = ReactDOMClient.createRoot(container);

    try {
      await act(() => {
        root.render(React.createElement(MouseEnter));
      });

      expect(
        container.textContent.match(/Mouse enter call count:/g)
      ).toHaveLength(2);
    } finally {
      await act(() => root.unmount());
      delete window.React;
      delete window.ReactDOM;
      delete window.ReactDOMClient;
      global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  });
});

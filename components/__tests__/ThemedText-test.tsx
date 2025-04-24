import * as React from 'react';

import { ThemedText } from '../ThemedText';
import { render } from '@testing-library/react-native';

it(`renders correctly`, () => {
  const tree = render(<ThemedText>Snapshot test!</ThemedText>).toJSON();

  expect(tree).toMatchSnapshot();
});

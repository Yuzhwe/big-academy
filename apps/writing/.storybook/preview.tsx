import type { Preview } from '@storybook/react-vite';
import '@big-academy/design-system/tokens.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;

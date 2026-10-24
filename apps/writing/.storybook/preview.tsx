import type { Preview } from '@storybook/react-vite';
import '@big-academy/design-system/tokens.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    viewport: { options: { desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' } }, tablet: { name: 'Tablet 834', styles: { width: '834px', height: '1112px' } }, mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' } } } },
    controls: { expanded: true },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;


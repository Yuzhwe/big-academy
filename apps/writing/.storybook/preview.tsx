import type { Decorator, Preview } from '@storybook/react-vite';
import '@big-academy/design-system/tokens.css';
import './storybook.css';

const withBigAcademyGlobals: Decorator = (Story, context) => {
  const product = context.globals.product === 'neutral' ? 'neutral' : 'writing';
  const locale = context.globals.locale === 'zh' ? 'zh-CN' : 'en';
  const motion = context.globals.motion === 'reduced' ? 'reduced' : 'full';

  return (
    <div className="ba-storybook-story" data-ba-product={product} data-ba-motion={motion} lang={locale}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    product: {
      description: 'Semantic product theme',
      defaultValue: 'writing',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'writing', title: 'Writing' },
          { value: 'neutral', title: 'Neutral' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Interface language',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'zh', title: '中文' },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      description: 'Motion preference',
      defaultValue: 'full',
      toolbar: {
        icon: 'play',
        items: [
          { value: 'full', title: 'Motion on' },
          { value: 'reduced', title: 'Reduced motion' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { product: 'writing', locale: 'en', motion: 'full' },
  decorators: [withBigAcademyGlobals],
  parameters: {
    layout: 'padded',
    viewport: { options: { desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' } }, tablet: { name: 'Tablet 834', styles: { width: '834px', height: '1112px' } }, mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' } } } },
    controls: { expanded: false, sort: 'requiredFirst' },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;


import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BATabs, BATabList, BATabPanel } from './BATabs';

const meta = {
  title: 'Workbench / 01 · Level Tabs (BA-UI-002)',
  component: BATabs,
  args: { defaultSelectedKey: 'L2', children: <span>Interactive controls below</span> },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BATabs>;
export default meta;
type Story = StoryObj<typeof meta>;

function LiveTabs({ locale = 'en', disabled = false, size = 36 }: { locale?: 'en' | 'zh'; disabled?: boolean; size?: 36 | 50 | 70 | 90 }) {
  const [selected, setSelected] = useState('L2');
  const options = ['L0', 'L1', 'L2', 'L3'].map(id => ({
    id, label: id, accessibleLabel: locale === 'zh' ? '第' + id.slice(1) + '级' : 'Level ' + id.slice(1),
    disabled: disabled && id === 'L3',
  }));
  return <div data-ba-product="writing" lang={locale === 'zh' ? 'zh-CN' : 'en'} style={{ display: 'grid', gap: 16 }}>
    <BATabs selectedKey={selected} onSelectionChange={setSelected}>
      <BATabList selectedKey={selected} options={options} size={size} aria-label={locale === 'zh' ? '选择级别' : 'Choose level'} />
      {options.map(option => <BATabPanel key={option.id} id={option.id}>
        <p style={{ fontSize: 16, lineHeight: 1.5 }}>
          {locale === 'zh' ? '当前为第' + selected.slice(1) + '级，点击上方标签切换学习路径。' : 'Current path: Level ' + selected.slice(1) + '. Change level using the tabs above.'}
        </p>
      </BATabPanel>)}
    </BATabs>
  </div>;
}
export const LevelNavigation: Story = { render: () => <LiveTabs/> };
export const Chinese: Story = { render: () => <LiveTabs locale="zh"/> };
export const Disabled: Story = { render: () => <LiveTabs disabled/> };
export const Sizes: Story = { render: () => <div style={{ display: 'grid', gap: 26 }}>{([36,50,70,90] as const).map(size => <LiveTabs key={size} size={size}/>)}</div> };
export const KeyboardFocus: Story = { render: () => <div><p>Tab into the strip, use Left/Right arrows, then Tab into the panel.</p><LiveTabs disabled/></div> };
export const LevelTabs = LevelNavigation;
export const StrongSubtle: Story = { render: () => <LiveTabs size={50}/> };


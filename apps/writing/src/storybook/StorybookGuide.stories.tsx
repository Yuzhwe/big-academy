import type { Meta, StoryObj } from '@storybook/react-vite';

import '../../.storybook/storybook.css';

function StorybookGuide() {
  return (
    <main className="ba-storybook-taskflow" aria-labelledby="storybook-guide-title">
      <section className="ba-storybook-taskflow__header">
        <p className="ba-storybook-taskflow__eyebrow">Big Academy · Storybook guide</p>
        <h1 id="storybook-guide-title">Big Academy Storybook</h1>
        <p>先通过实时预览确认视觉和交互，再展开状态、用法、Contract 和实现细节。</p>
      </section>
      <section className="ba-storybook-taskflow__stage" aria-labelledby="guide-order-title">
        <h2 id="guide-order-title">推荐阅读顺序</h2>
        <ol>
          <li>从左侧分类或搜索进入组件。</li>
          <li>先看 Live Preview 和默认状态。</li>
          <li>使用顶部工具栏切换视口、语言、产品主题和 Reduced Motion。</li>
          <li>展开 States、Responsive、Accessibility 和 Usage。</li>
          <li>最后查看 API、源码和 Review Evidence。</li>
        </ol>
        <div className="ba-storybook-taskflow__stage-card">
          <strong>当前视觉基线</strong>
          <span>Writing 使用 Warm Frame + White Canvas；共享组件消费语义 Token；普通分隔线使用 0.5px；交互控件保持至少 44px 命中区域。</span>
        </div>
      </section>
    </main>
  );
}

function ReviewChecklist() {
  return (
    <main className="ba-storybook-taskflow" aria-labelledby="checklist-title">
      <section className="ba-storybook-taskflow__header">
        <p className="ba-storybook-taskflow__eyebrow">Big Academy · Design review</p>
        <h1 id="checklist-title">Design review checklist</h1>
        <p>这份清单记录审查证据，不把构建成功当作视觉批准。</p>
      </section>
      <section className="ba-storybook-taskflow__stage">
        <h2>视觉</h2>
        <ul>
          <li>默认态是否符合 Warm Frame + White Canvas？</li>
          <li>组件是否使用语义色和共享 Token？</li>
          <li>长标题、长正文和中文是否保持可读？</li>
        </ul>
        <h2>交互与可访问性</h2>
        <ul>
          <li>hover、pressed、focus-visible、disabled 和 busy 是否可区分？</li>
          <li>键盘是否可以完成核心任务？</li>
          <li>Reduced Motion 是否保留状态反馈？</li>
          <li>弹出层是否从合理的触发源方向展开？</li>
        </ul>
        <h2>响应式与交付</h2>
        <ul>
          <li>验证 1440×900、834×1112、390×844。</li>
          <li>检查浏览器缩放、长文本和 EN/ZH。</li>
          <li>确认 Contract ID、Owner、Review status 和 Review evidence。</li>
        </ul>
      </section>
    </main>
  );
}

const meta = {
  title: 'Start Here',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StorybookGuidePage: Story = { render: () => <StorybookGuide /> };
export const DesignReviewChecklist: Story = { render: () => <ReviewChecklist /> };

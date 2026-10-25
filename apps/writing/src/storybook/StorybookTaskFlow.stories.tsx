import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import '../../.storybook/storybook.css';

type FlowId = 'designer' | 'developer' | 'qa';

type Flow = {
  id: FlowId;
  label: string;
  description: string;
  steps: Array<{ title: string; body: string; evidence: string }>;
};

const flows: Flow[] = [
  {
    id: 'designer',
    label: 'Designer review',
    description: '从视觉结果开始，逐步检查状态、响应式和设计证据。',
    steps: [
      { title: 'Choose a component', body: '先通过分类或搜索进入一个具体组件页面。', evidence: '入口：Foundations、Primitives、Writing 或 Review Workbench。' },
      { title: 'See the default', body: '首屏只展示用途、当前状态和可以直接操作的预览。', evidence: '设计师不需要先阅读 Props。' },
      { title: 'Try key states', body: '切换中文、长文本、禁用、焦点和完成状态。', evidence: '场景控制只暴露高价值检查项。' },
      { title: 'Check responsive', body: '使用顶部 Viewport 工具栏检查 Desktop、Tablet 和 Mobile。', evidence: '目标尺寸：1440×900、834×1112、390×844。' },
      { title: 'Review evidence', body: '展开 Anatomy、Accessibility 和 Review Evidence，记录最终判断。', evidence: '编译成功与视觉批准保持独立。' },
    ],
  },
  {
    id: 'developer',
    label: 'Developer implementation',
    description: '先理解使用边界，再查看 API 和源码。',
    steps: [
      { title: 'Search', body: '用组件名称、Contract ID 或页面职责搜索。', evidence: '例如 BA-UI-001 或 LessonTopBar。' },
      { title: 'Read intent', body: '查看用途、Owner、设计状态和不能改变的行为。', evidence: '这些内容来自组件合同和当前设计规范。' },
      { title: 'Use the example', body: '打开 Usage，复制最小可行的组件用法。', evidence: '推荐用法先于完整 API。' },
      { title: 'Adjust controls', body: '只调整核心 Props，确认视觉行为仍然符合预期。', evidence: '高级实现参数保持折叠。' },
      { title: 'Inspect contract', body: '最后查看 Props、Events、States 和 Accessibility。', evidence: '实现不能绕过共享组件的交互基础。' },
    ],
  },
  {
    id: 'qa',
    label: 'QA / accessibility',
    description: '以状态矩阵和可复现操作验证组件。',
    steps: [
      { title: 'Open review fixture', body: '从 Review Workbench 进入目标组件的评审用例。', evidence: '评审页使用稳定的场景数据。' },
      { title: 'Run keyboard path', body: '用 Tab、Enter、Space 和方向键完成核心操作。', evidence: '焦点环必须清晰，不能只依赖颜色。' },
      { title: 'Check names', body: '确认按钮、选项、锁定态和进度状态有正确的可访问名称。', evidence: '视觉标签与 accessible name 可以不同，但语义必须一致。' },
      { title: 'Check zoom and locale', body: '验证长英文、中文、混合内容和浏览器缩放。', evidence: '文本应增长，不能被固定高度截断。' },
      { title: 'Reduce motion', body: '切换 Reduced Motion，确认状态仍然可理解。', evidence: '动效关闭后不能丢失反馈。' },
    ],
  },
];

function TaskFlowWorkbench() {
  const [flowId, setFlowId] = useState<FlowId>('designer');
  const [stepIndex, setStepIndex] = useState(0);
  const flow = flows.find(item => item.id === flowId) ?? flows[0];
  const step = flow.steps[stepIndex];

  function selectFlow(nextFlow: FlowId) {
    setFlowId(nextFlow);
    setStepIndex(0);
  }

  return (
    <main className="ba-storybook-taskflow" aria-labelledby="taskflow-title">
      <section className="ba-storybook-taskflow__header">
        <p className="ba-storybook-taskflow__eyebrow">Big Academy · Storybook review flow</p>
        <h1 id="taskflow-title">Progressive disclosure task flows</h1>
        <p className="ba-storybook-taskflow__meta">先看结果，再看行为；先看推荐用法，再看完整实现。</p>
        <div className="ba-storybook-taskflow__flow-switcher" role="group" aria-label="Choose a task flow">
          {flows.map(item => (
            <button key={item.id} type="button" aria-pressed={item.id === flowId} onClick={() => selectFlow(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p>{flow.description}</p>
        <div className="ba-storybook-taskflow__steps" aria-label={`${flow.label} steps`}>
          {flow.steps.map((item, index) => (
            <div className="ba-storybook-taskflow__step" data-active={index === stepIndex} key={item.title} aria-current={index === stepIndex ? 'step' : undefined}>
              <span className="ba-storybook-taskflow__step-number">{index + 1}</span>
              <strong>{item.title}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ba-storybook-taskflow__stage" aria-live="polite">
        <p className="ba-storybook-taskflow__eyebrow">Step {stepIndex + 1} of {flow.steps.length}</p>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        <div className="ba-storybook-taskflow__stage-card">
          <strong>Review evidence</strong>
          <span>{step.evidence}</span>
        </div>
        <div className="ba-storybook-taskflow__nav">
          <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex(index => Math.max(0, index - 1))}>Back</button>
          <button type="button" onClick={() => setStepIndex(index => Math.min(flow.steps.length - 1, index + 1))}>
            {stepIndex === flow.steps.length - 1 ? 'Review complete' : 'Continue'}
          </button>
        </div>
      </section>

      <details className="ba-storybook-taskflow__details">
        <summary>Why this order?</summary>
        <p>把发现、视觉验证、状态探索、实现细节和签核证据分成不同层级，能减少设计师首次进入页面时的认知负担，同时保留开发和 QA 所需的完整信息。</p>
      </details>
    </main>
  );
}

const meta = {
  title: 'Review Workbench/Task Flows',
  parameters: {
    layout: 'fullscreen',
    ba: {
      status: 'ready-for-visual-review',
      owner: 'Design System',
      purpose: 'Progressive disclosure task flow for Storybook reviewers',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProgressiveDisclosure: Story = {
  render: () => <TaskFlowWorkbench />,
};

import buttonSource from '../../../packages/design-system/src/components/ui/BAButton.tsx?raw';
import choiceSource from '../../../packages/design-system/src/components/ui/BAChoice.tsx?raw';
import tabsSource from '../../../packages/design-system/src/components/ui/BATabs.tsx?raw';
import topbarSource from '../../writing/src/components/writing/LessonTopBar.tsx?raw';
import lessonSource from '../../writing/src/components/writing/StairLessonCard.tsx?raw';
import solarSource from '../../writing/src/components/writing/SolarLessonPreview.tsx?raw';
import hamburgerSource from '../../writing/src/components/writing/HamburgerComposition.tsx?raw';
import coachSource from '../../writing/src/components/writing/LessonWorkspace.tsx?raw';
import coachNoteSource from '../../writing/src/components/writing/CoachNote.tsx?raw';
import coachChatSource from './CoachChatPlayground.tsx?raw';
import pathBackSource from './PathBackToCurrentPlayground.tsx?raw';
import flagSource from '../../writing/src/course/LevelRewardFlag.tsx?raw';
import wordsSource from '../../writing/src/components/writing/WordGrid.tsx?raw';
import unitSource from '../../writing/src/components/writing/StairUnitCard.tsx?raw';
import milestoneSource from '../../writing/src/components/writing/UnitMilestone.tsx?raw';
import transitionSource from '../../writing/src/components/writing/BAPageTransition.tsx?raw';
import cloudSource from '../../writing/src/course/CloudShaderSky.tsx?raw';
import startPointSource from '../../writing/src/components/writing/StartPoint.tsx?raw';
import levelSource from '../../writing/src/components/writing/StairLevelIntroCard.tsx?raw';
import notebookSource from '../../writing/src/components/writing/NotebookShell.tsx?raw';
import notebookEditorSource from '../../writing/src/components/writing/NotebookEditor.tsx?raw';
import originalM4ShaderSource from '../../writing/src/course/cloudShaderM4.ts?raw';
import { choiceOptions, type Scene, type Entry } from './catalog';
const sources = { coach:coachSource, button: buttonSource, choice: choiceSource, tabs: tabsSource, topbar: topbarSource,
  lesson: lessonSource + '\n\n/* Shared Current Solar overlay (same source used in Writing page): */\n' + solarSource,
  unit: unitSource, hamburger: hamburgerSource, flag: flagSource, words: wordsSource,
  milestone:milestoneSource, transition:transitionSource,
  cloud: cloudSource + '\n\n/* Original M4 GLSL and transparent derivative source: */\n' + originalM4ShaderSource,
  'start-point': startPointSource, level: levelSource, notebook: notebookSource + '\n\n/* Legacy NotebookEditor (ruled + textarea) for compare: */\n' + notebookEditorSource,
  'coach-note': coachNoteSource, 'coach-chat': coachChatSource,
  'path-back': pathBackSource + '\n\n/* Shared Solar control-fit wrap: */\n' + solarSource };
export function Code({ scene, entry }: { scene: Scene; entry: Entry }) {
  const props = scene.component === 'choice' ? {
    choiceMode: scene.choice,
    options: choiceOptions(scene.sample).map((option, i) => ({ ...option, ...(scene.mode === 'state' && i === 0 ? { state: scene.state } : {}) })),
    selectedKeys: scene.mode === 'state' ? (['selected', 'correct', 'wrong'].includes(scene.state) ? ['a'] : []) : scene.selected,
    disabled: scene.mode === 'state', 'aria-label': scene.locale === 'zh' ? '选择句子' : 'Choose a sentence',
  } : null;
  return <>
    {props ? <><p>选择配置的最小用法（不包含示例判题器）。交互由调用方保存；判题、清除和状态组合见预览适配器。</p><pre tabIndex={0}><code>{`import { useState, type ComponentProps } from 'react';\nimport { BAChoice } from '@big-academy/design-system';\n\nconst props = ${JSON.stringify(props, null, 2)} satisfies ComponentProps<typeof BAChoice>;\n\nexport function Example() {\n  const [selectedKeys, setSelectedKeys] = useState(props.selectedKeys);\n  return <div data-ba-product="writing" lang="${scene.locale === 'zh' ? 'zh-CN' : 'en'}">\n    <BAChoice {...props} selectedKeys={selectedKeys} onChange={setSelectedKeys} />\n  </div>;\n}`}</code></pre></> : <p>以下为当前版本的真实组件源码；可用属性和事件见「规范与接口」。预览交互适配在组件库应用中维护。</p>}
    <details><summary>查看 {entry.en} 原始源码</summary><pre tabIndex={0}><code>{sources[scene.component]}</code></pre></details>
  </>;
}

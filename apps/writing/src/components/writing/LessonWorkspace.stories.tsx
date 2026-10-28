import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoachMessage, LessonWorkspace } from './LessonWorkspace';

const meta = {
  title: 'Writing/Shell/LessonWorkspace',
  component: LessonWorkspace,
  parameters: { ba: { contractId: 'BA-WR-002', status: 'pending-review', owner: 'Writing', purpose: 'White activity paper with independently scrolling Coach rail' }, layout: 'fullscreen' },
} satisfies Meta<typeof LessonWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

function Frame({ coach }: { coach: string }) {
  return (
    <div style={{ height: 640 }}>
      <LessonWorkspace
        activity={<p>White paper. The activity stays in this column.</p>}
        coach={
          <div>
            {Array.from({ length: 12 }, (_, index) => (
              <p key={index}>{coach} {index + 1}</p>
            ))}
          </div>
        }
        navigation={
          <>
            <button type="button">Back</button>
            <button type="button">Check</button>
          </>
        }
      />
    </div>
  );
}

export const Desktop: Story = {
  args: { activity: 'Paper', coach: 'Coach', navigation: 'Footer' },
  render: () => <Frame coach="Coach line" />,
};

export const CoachOverflow: Story = {
  args: { activity: 'Paper', coach: 'Coach', navigation: 'Footer' },
  render: () => <Frame coach="A long coach note stays inside the rail" />,
};

export const CoachRailNavBottomRight: Story = {
  args: { activity: 'Paper', coach: 'Coach', navigation: 'Footer' },
  render: () => <Frame coach="Previous and the primary action sit under the coach" />,
};

/** All Coach answers are cards; correct, wrong and hint retain separate semantic palettes. */
export const CoachMessageStates: Story = {
  args: { activity: 'Paper', coach: 'Coach', navigation: 'Footer' },
  render: () => <div style={{ height: 620 }}>
    <LessonWorkspace
      activity={<p>A learning activity and its answer controls.</p>}
      coach={<div>
        <CoachMessage tone="orientation">Read the question and choose what you think is right.</CoachMessage>
        <CoachMessage tone="hint" data-testid="hint">Look for a word that tells you the writer's opinion.</CoachMessage>
        <CoachMessage tone="wrong">Not quite. Look again for an opinion.</CoachMessage>
        <CoachMessage tone="correct" role="status">Great! You found the topic sentence.</CoachMessage>
      </div>}
      navigation={<><button type="button">Previous</button><button type="button">Next</button></>}
    />
  </div>,
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LessonWorkspace } from './LessonWorkspace';

const meta = {
  title: 'Writing/LessonWorkspace',
  component: LessonWorkspace,
  parameters: { layout: 'fullscreen' },
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

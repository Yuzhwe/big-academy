import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StairUnitCard } from './StairUnitCard';

const unit = {
  id: 'G2-O', index: 1, typeLabel: 'Writing unit',
  title: 'Opinion Paragraph', meta: '9 lessons · 170 mins',
  goals: ['write a topic sentence', 'give two reasons'],
};

describe('BA-WR-007 StairUnitCard · approved shared round paper', () => {
  it('renders only the UNIT index and one outlined count/time pill', () => {
    const { container } = render(<StairUnitCard unit={unit} />);
    expect(screen.getByText('UNIT 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name:'Opinion Paragraph' })).toBeInTheDocument();
    expect(screen.getByText('9 lessons · 170 min')).toBeInTheDocument();
    expect(container.querySelector('.course-unit__meta')).toHaveTextContent('9 lessons · 170 min');
    expect(container.querySelectorAll('.course-unit__meta')).toHaveLength(1);
    expect(container.querySelector('[data-testid="unit-fold"]')).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Writing unit|0 of|about/i);
  });
  it('retains the same rounded structure and localized concise pill', () => {
    const { container } = render(<StairUnitCard unit={{...unit, title:'观点段落', meta:'9 课 · 170 分钟'}} locale="zh"/>);
    expect(screen.getByText('第 1 单元')).toBeInTheDocument();
    expect(screen.getByText('9 课 · 170 分钟')).toBeInTheDocument();
    expect(container.querySelector('.course-unit__fold-flap')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.course-unit__goal')).toHaveLength(2);
  });
});

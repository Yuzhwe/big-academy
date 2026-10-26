import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StairUnitCard } from './StairUnitCard';

const unit = {
  id: 'G2-O', index: 1, typeLabel: 'Writing unit',
  title: 'Opinion Paragraph', meta: '9 lessons · 170 mins',
  goals: ['write a topic sentence', 'give two reasons'],
};

describe('BA-WR-007 StairUnitCard · Review 03', () => {
  it('renders only the UNIT index and one outlined count/time pill', () => {
    const { container } = render(<StairUnitCard unit={unit} />);
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name:'Opinion Paragraph' })).toBeInTheDocument();
    expect(screen.getByText('9 lessons · 170 mins')).toBeInTheDocument();
    expect(container.querySelector('.course-unit__meta')).toHaveTextContent('9 lessons · 170 mins');
    expect(container.querySelectorAll('.course-unit__meta')).toHaveLength(1);
    expect(container.querySelector('[data-testid="unit-fold"]')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Writing unit|0 of|about/i);
  });
  it('retains the same folded structure and localized concise pill', () => {
    const { container } = render(<StairUnitCard unit={{...unit, title:'观点段落', meta:'9 课 · 170 分钟'}} locale="zh"/>);
    expect(screen.getByText('第 1 单元')).toBeInTheDocument();
    expect(screen.getByText('9 课 · 170 分钟')).toBeInTheDocument();
    expect(container.querySelector('.course-unit__fold-flap')).toBeInTheDocument();
    expect(container.querySelectorAll('.course-unit__goal')).toHaveLength(2);
  });
});

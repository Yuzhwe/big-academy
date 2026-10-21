import './StairLevelIntroCard.css';
export function StairLevelIntroCard({text}:{text:string}) {
  return <section className="course-intro stair-level-card" data-component="BA-WR-008" data-testid="level-intro">
    <p>{text}</p>
  </section>;
}

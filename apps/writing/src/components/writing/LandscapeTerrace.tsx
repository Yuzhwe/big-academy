import './LandscapeTerrace.css';

/** BA-WR-010. Decorative scene layer, never owns lesson state or click events.
 * Staircase's existing ::before shares these exact styles with the workbench.
 */
export function LandscapeTerrace() {
  return <div className="landscape-terrace" data-component="BA-WR-010" aria-hidden="true" />;
}



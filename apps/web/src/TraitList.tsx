import { useTraits } from './useTraits';

export function TraitList() {
  const traits = useTraits();

  return (
    <table aria-label="Traits">
      <thead>
        <tr>
          <th>Name</th>
          <th>Tier thresholds</th>
        </tr>
      </thead>
      <tbody>
        {traits.map((trait) => (
          <tr key={trait.apiName}>
            <td>{trait.name}</td>
            <td>{trait.tiers.map((tier) => tier.minUnits).join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

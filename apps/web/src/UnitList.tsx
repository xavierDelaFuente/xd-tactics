import { useUnits } from './useUnits';

export function UnitList() {
  const units = useUnits();

  return (
    <table aria-label="Units">
      <thead>
        <tr>
          <th>Name</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        {units.map((unit) => (
          <tr key={unit.apiName}>
            <td>{unit.name}</td>
            <td>{unit.cost}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

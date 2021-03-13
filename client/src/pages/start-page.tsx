import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { useResourceList } from '../hooks/use-resource-list';

export const StartPage: FC = () => {
  const resourceList = useResourceList();

  if (resourceList.length === 0) {
    return null;
  }

  return (
    <ul>
      {resourceList.map(({ id, name }) => (
        <li key={id}>
          <Link to={`/resources/${id}`}>{name}</Link>
        </li>
      ))}
    </ul>
  );
};

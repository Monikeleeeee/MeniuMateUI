import useSWR from 'swr';

type GroupDTO = {
  id: number;
  title: string;
};

const fetcher = (...args: [RequestInfo, RequestInit?]) =>
  fetch(...args).then((res) => res.json());

const Swr = () => {
  const {
    data: groups,
    error,
    isValidating,
  } = useSWR<GroupDTO[]>('https://oyster-app-koqt5.ondigitalocean.app/', fetcher);

  if (error) return <div className="failed">Failed to load</div>;
  if (isValidating) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h2>Groups</h2>
      <ul>
        {groups?.map((group) => (
          <li key={group.id}>{group.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Swr;

import { useState } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';

type GroupDTO = {
  id: number;
  title: string;
  balance: number;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

const GroupsPage = () => {
  const memberId = 1; 
  const { data: groups, error, mutate } = useSWR<GroupDTO[]>(
    `http://localhost:5131/api/Group?memberId=${memberId}`,
    fetcher
  );

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const createGroup = async () => {
    if (!newTitle.trim()) {
      setErrorMsg('Title cannot be empty');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5131/api/Group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to create group');
      setNewTitle('');
      setCreating(false);
      mutate();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <Typography color="error">Failed to load groups.</Typography>;
  if (!groups) return <CircularProgress />;

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button
        variant="contained"
        onClick={() => {
          setCreating(!creating);
          setErrorMsg('');
        }}
        sx={{ mb: 3 }}
      >
        {creating ? 'Cancel' : 'Create New Group'}
      </Button>

      {creating && (
        <Box
          component="form"
          sx={{ mb: 4, width: '100%', maxWidth: 400 }}
          onSubmit={e => {
            e.preventDefault();
            createGroup();
          }}
        >
          <TextField
            label="Group Title"
            variant="outlined"
            fullWidth
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            disabled={loading}
            error={Boolean(errorMsg)}
            helperText={errorMsg}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ mt: 2 }}
            fullWidth
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </Box>
      )}

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
        {groups.length === 0 && <Typography>No groups found.</Typography>}
        {groups.map(group => (
          <Card
            key={group.id}
            variant="outlined"
            onClick={() => navigate(`/group/${group.id}`)}
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <CardContent>
              <Typography variant="h6">{group.title}</Typography>
              <Typography color="text.secondary">
                {group.balance > 0
                  ? `They owe you: ${group.balance.toFixed(2)}`
                  : group.balance < 0
                  ? `You owe: ${Math.abs(group.balance).toFixed(2)}`
                  : 'Settled up'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default GroupsPage;

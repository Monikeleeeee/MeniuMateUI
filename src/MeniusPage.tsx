import useSWR, { mutate } from 'swr';
import { Box, Card, CardContent, CircularProgress, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type MeniuDTO = { id: number; name: string; };

const fetcher = async (url: string) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    console.error('Failed response', res.status, await res.text());
    throw new Error('Nepavyko gauti menius');
  }

  return res.json();
};

const MeniusPage = () => {
  const navigate = useNavigate();
  const { data: menius, error } = useSWR<MeniuDTO[]>('http://localhost:5071/api/menius', fetcher);

  const token = localStorage.getItem('accessToken');
  const roles = localStorage.getItem('roles')?.split(',') || [];
  const isAdmin = roles.includes('Admin');

  const [deleteMeniuId, setDeleteMeniuId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDelete = async () => {
    if (!deleteMeniuId || !token) return;
    setLoadingDelete(true);

    try {
      const res = await fetch(`http://localhost:5071/api/menius/${deleteMeniuId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Nepavyko ištrinti meniu');

      mutate('http://localhost:5071/api/menius', menius?.filter(m => m.id !== deleteMeniuId), false);

      mutate('http://localhost:5071/api/menius');
    } catch (err: any) {
      alert(err.message || 'Įvyko klaida.');
    } finally {
      setLoadingDelete(false);
      setDeleteMeniuId(null);
    }
  };

  if (error) return <Typography color="error">Failed to load menu.</Typography>;
  if (!menius) return <CircularProgress />;

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Visi Menius</Typography>

      {isAdmin && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/meniu/create-meniu')}
          >
            Sukurti naują meniu
          </Button>
        </Box>
      )}

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
        {menius.length === 0 && <Typography>Nei vienas meniu nerastas.</Typography>}

        {menius.map(m => (
          <Card
            key={m.id}
            variant="outlined"
            sx={{ cursor: 'pointer', '&:hover': isAdmin ? { boxShadow: 6, transform: 'scale(1.02)' } : {} }}
            onClick={() => navigate(`/meniu/${m.id}`)}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">{m.name}</Typography>

              {isAdmin && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={e => { e.stopPropagation(); navigate(`/meniu/${m.id}/edit`); }}
                  >
                    Redaguoti
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={e => { e.stopPropagation(); setDeleteMeniuId(m.id); }}
                  >
                    Ištrinti
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog
        open={deleteMeniuId !== null}
        onClose={() => setDeleteMeniuId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Patvirtinti ištrynimą</DialogTitle>
        <DialogContent>
          <Typography>Ar tikrai norite ištrinti šį meniu? Šis veiksmas negali būti atšauktas.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Button onClick={() => setDeleteMeniuId(null)} color="inherit" disabled={loadingDelete}>Atšaukti</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loadingDelete}>
            {loadingDelete ? <CircularProgress size={24} color="inherit" /> : "Ištrinti"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeniusPage;

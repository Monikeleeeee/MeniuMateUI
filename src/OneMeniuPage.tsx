import { useParams, Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';

type MeniuDTO = {
  id: number;
  name: string;
  description: string;
};

type DishDTO = {
  id: number;
  name: string;
  price: number;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

const OneMeniuPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  const roles = localStorage.getItem('roles')?.split(',') || [];
  const isAdmin = roles.includes('Admin');

  const { data: meniu, error: meniuError } = useSWR<MeniuDTO>(
    `https://oyster-app-koqt5.ondigitalocean.app/api/menius/${id}`,
    fetcher
  );

  const { data: dishes, error: dishesError } = useSWR<DishDTO[]>(
    id ? `https://oyster-app-koqt5.ondigitalocean.app/api/menius/${id}/dishes` : null,
    fetcher
  );

  const [deleteDishId, setDeleteDishId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteDish = async () => {
    if (!deleteDishId || !id || !token) return;
    setLoadingDelete(true);

    try {
      const res = await fetch(`https://oyster-app-koqt5.ondigitalocean.app/api/menius/${id}/dishes/${deleteDishId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Nepavyko ištrinti patiekalo.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Įvyko klaida.');
    } finally {
      setLoadingDelete(false);
      setDeleteDishId(null);
    }
  };

  const handleBack = () => navigate('/');

  if (meniuError) return <Typography color="error">Nepavyko užkrauti meniu.</Typography>;
  if (!meniu) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box sx={{ mt: 2, px: 2, pb: 4, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="text" onClick={handleBack}>← Atgal</Button>
        <Typography variant="h3" sx={{ mx: 'auto' }}>{meniu.name}</Typography>
      </Box>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>{meniu.description}</Typography>

      {isAdmin && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/meniu/${id}/create-dish`)}
          >
            Sukurti patiekalą
          </Button>
        </Box>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>Patiekalai</Typography>
      {dishesError && <Typography color="error">Nepavyko užkrauti patiekalų.</Typography>}
      {!dishes ? (
        <CircularProgress />
      ) : dishes.length === 0 ? (
        <Typography color="text.secondary">Patiekalaų dar nėra.</Typography>
      ) : (
        <Stack spacing={3} alignItems="center">
          {dishes.map(dish => (
            <Card key={dish.id} sx={{ width: 400, cursor: 'pointer', border: '1px solid #ccc', '&:hover': { boxShadow: 6, transform: 'scale(1.02)' } }}>
              <CardContent
                component={Link}
                to={`/meniu/${id}/dishes/${dish.id}`}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="h6">{dish.name}</Typography>
                <Typography variant="body2" color="text.secondary">{dish.price.toFixed(2)}</Typography>
              </CardContent>

              {isAdmin && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pb: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/meniu/${id}/dishes/${dish.id}/edit`)}
                  >
                    Redaguoti
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDishId(dish.id);
                    }}
                  >
                    Ištrinti
                  </Button>
                </Box>
              )}
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={deleteDishId !== null} onClose={() => setDeleteDishId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Patvirtinti ištrynimą</DialogTitle>
        <DialogContent>
          <Typography>Ar tikrai norite ištrinti šį patiekalą? Šis veiksmas negali būti atšauktas.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Button onClick={() => setDeleteDishId(null)} color="inherit" disabled={loadingDelete}>Atšaukti</Button>
          <Button onClick={handleDeleteDish} color="error" variant="contained" disabled={loadingDelete}>
            {loadingDelete ? <CircularProgress size={24} color="inherit" /> : "Ištrinti"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OneMeniuPage;

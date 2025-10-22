import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Stack, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

type DishDTO = {
  id: number;
  name: string;
  description: string;
  price: number;
  ingredients: string;
  imageUrl?: string;
};

type CommentDTO = {
  id: number;
  content: string;
  rating: number;
  userId: string;
};

const OneDishPage = () => {
  const { id: meniuId, dishId } = useParams<{ id: string; dishId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('accessToken');
  const roles = localStorage.getItem('roles')?.split(',') || [];
  const isAdmin = roles.includes('Admin');
  const isLoggedIn = !!token;

  let userId: string | null = null;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.sub || localStorage.getItem('userId');
    } catch {
      userId = localStorage.getItem('userId');
    }
  }

  const isValidUrl = (url: string | undefined) => {
    if (!url) return false;
    try { new URL(url); return true; } catch { return false; }
  };

  const { data: dish, error: dishError } = useSWR<DishDTO>(
    meniuId && dishId ? `http://localhost:5071/api/menius/${meniuId}/dishes/${dishId}` : null,
    async (url:string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Nepavyko gauti patiekalo iš duomenų bazės: ${res.statusText}`);
      const data = await res.json();
      const rawImageUrl = data.ImageUrl || data.imageUrl;
      const imageUrl = isValidUrl(rawImageUrl?.trim()) ? rawImageUrl : 'https://via.placeholder.com/150';
      return { ...data, imageUrl };
    }
  );

  const { data: comments, error: commentsError, mutate } = useSWR<CommentDTO[]>(
    meniuId && dishId ? `http://localhost:5071/api/menius/${meniuId}/dishes/${dishId}/comments` : null,
    (url:string) => fetch(url).then(res => res.json())
  );

  useEffect(() => {
    if (location.state?.refreshComments) {
      mutate();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, mutate]);

  const handleAddComment = () => {
    if (!meniuId || !dishId) return;
    navigate(`/meniu/${meniuId}/dishes/${dishId}/create-comment`);
  };

  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteComment = async () => {
    if (!deleteCommentId || !token || !meniuId || !dishId) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(
        `http://localhost:5071/api/menius/${meniuId}/dishes/${dishId}/comments/${deleteCommentId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Nepavyko ištrinti komentaro.');
      mutate();
    } catch (err: any) {
      alert(err.message || 'Įvyko klaida.');
    } finally {
      setLoadingDelete(false);
      setDeleteCommentId(null);
    }
  };

  const handleBack = () => navigate(`/meniu/${meniuId}`);

  if (dishError) return <Typography color="error">Nepavyko užkrauti patiekalo: {dishError.message}</Typography>;
  if (!dish) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box sx={{ mt: 0, px: 2, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Button variant="text" onClick={handleBack} sx={{ mb: 2 }}>← Atgal</Button>
        <Typography variant="h3" sx={{ mb: 2, textAlign: 'center' }}>{dish.name}</Typography>

        {dish.imageUrl && <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img src={dish.imageUrl} alt={dish.name} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
        </Box>}

        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>{dish.description}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}><strong>Sudėtis:</strong> {dish.ingredients}</Typography>
        <Typography variant="h6" sx={{ mb: 3 }}><strong>Kaina:</strong> ${dish.price.toFixed(2)}</Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" sx={{ mb: 2 }}>Komentarai</Typography>
        {isLoggedIn && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleAddComment}>Pridėti komentarą</Button>
          </Box>
        )}

        {commentsError && <Typography color="error">Nepavyko užkrauti komentarų.</Typography>}
        {!comments ? <CircularProgress /> :
          comments.length === 0 ? <Typography color="text.secondary">Komentarų dar nėra.</Typography> :
            <Stack spacing={2}>
              {comments.map(c => (
                <Paper key={c.id} sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                  <Typography>{c.content}</Typography>
                  <Typography color="text.secondary">⭐ Rating: {c.rating}/5</Typography>
                  {(userId && (c.userId === userId || isAdmin)) && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/meniu/${meniuId}/dishes/${dishId}/edit-comment/${c.id}`, { state: { refreshComments: true } })}>
                        Redaguoti
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => setDeleteCommentId(c.id)}>
                        Ištrinti
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>
        }

        <Dialog open={deleteCommentId !== null} onClose={() => setDeleteCommentId(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Patvirtinti ištrynimą</DialogTitle>
          <DialogContent>
            <Typography>Ar tikrai norite ištrinti šį komentarą? Šis veiksmas negali būti atšauktas.</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
            <Button onClick={() => setDeleteCommentId(null)} color="inherit" disabled={loadingDelete}>Atšaukti</Button>
            <Button onClick={handleDeleteComment} color="error" variant="contained" disabled={loadingDelete}>
              {loadingDelete ? <CircularProgress size={24} color="inherit" /> : "Ištrinti"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default OneDishPage;

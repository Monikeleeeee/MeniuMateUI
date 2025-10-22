import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';

const CreateComment = () => {
  const { id: meniuId, dishId } = useParams<{ id: string; dishId: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    } catch (err) {
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meniuId || !dishId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://oyster-app-koqt5.ondigitalocean.app/api/menius/${meniuId}/dishes/${dishId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, rating }),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error('Backend error:', msg, 'Status:', res.status);
        throw new Error(msg || 'Nepavyko sukurti komentaro');
      }

      navigate(`/meniu/${meniuId}/dishes/${dishId}`);
    } catch (err: any) {
      setError(err.message || 'Kažkas nutiko ne taip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        mt: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: 6, transform: 'scale(1.01)' },
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 3, textAlign: 'center', transition: 'all 0.3s ease' }}
        >
          Pridėti komentarą
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Komentaro turinys"
            value={content}
            onChange={e => setContent(e.target.value)}
            margin="normal"
            required
            sx={{ transition: 'all 0.3s ease' }}
          />
          <TextField
            fullWidth
            type="number"
            label="Įvertinimas (1-5)"
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            inputProps={{ min: 1, max: 5 }}
            margin="normal"
            required
            sx={{ transition: 'all 0.3s ease' }}
          />
          {error && (
            <Typography color="error" sx={{ mt: 1, transition: 'all 0.3s ease' }}>
              {error}
            </Typography>
          )}
          <Box sx={{ mt: 3, textAlign: 'center', transition: 'all 0.3s ease' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.05)' } }}
            >
              {loading ? <CircularProgress size={24} /> : 'Pridėti komentarą'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateComment;

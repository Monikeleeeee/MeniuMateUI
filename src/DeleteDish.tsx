import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';

const DeleteMeniu = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(true);

  const token = localStorage.getItem('accessToken');

  const handleDelete = async () => {
    if (!token || !id) return;

    setLoading(true);

    try {
      const res = await fetch(`https://oyster-app-koqt5.ondigitalocean.app/api/menius/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Nepavyko ištrinti meniu');

      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Įvyko klaida');
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  return (
    <Box
      sx={{
        mt: 0,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Dialog open={openConfirm} onClose={() => navigate('/')} maxWidth="xs" fullWidth>
        <DialogTitle>Patvirtinti ištrynimą</DialogTitle>
        <DialogContent>
          <Typography>Ar tikrai norite ištrinti šį meniu? Šis veiksmas negali būti atšauktas.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')} color="inherit" disabled={loading}>Atšaukti</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Ištrinti'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeleteMeniu;

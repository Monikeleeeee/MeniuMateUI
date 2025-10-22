import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';

const DeleteComment = () => {
  const { id: meniuId, dishId, commentId } = useParams<{ id: string; dishId: string; commentId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(true);

  const handleDelete = async () => {
    if (!token || !meniuId || !dishId || !commentId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://oyster-app-koqt5.ondigitalocean.app/api/menius/${meniuId}/dishes/${dishId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Nepavyko ištrinti komentaro.');
      }

      navigate(`/meniu/${meniuId}/dishes/${dishId}`);
    } catch (err: any) {
      alert(err.message || 'Įvyko klaida.');
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  const handleCancel = () => navigate(`/meniu/${meniuId}/dishes/${dishId}`);

  return (
    <Box sx={{ mt: 0, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Dialog open={openConfirm} onClose={handleCancel} maxWidth="xs" fullWidth sx={{ "& .MuiDialog-paper": { textAlign: "center", px: 3, py: 2 } }}>
        <DialogTitle sx={{ fontSize: 20 }}>Patvirtinti ištrynimą</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            Ar tikrai norite ištrinti šį komentarą? Šis veiksmas negali būti atšauktas.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
          <Button onClick={handleCancel} color="inherit" variant="outlined" sx={{ minWidth: 100 }} disabled={loading}>Atšaukti</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ minWidth: 100 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Ištrinti"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeleteComment;

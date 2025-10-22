import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

type MeniuDTO = { id: number; name: string; description: string; };

const EditMeniu = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [meniu, setMeniu] = useState<MeniuDTO | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`https://oyster-app-koqt5.ondigitalocean.app/api/menius/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => { if (!res.ok) throw new Error('Nepavyko gauti meniu'); return res.json(); })
      .then((data: MeniuDTO) => {
        setMeniu(data);
        setDescription(data.description);
      })
      .catch(err => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleBack = () => navigate('/');

  const handleSave = async () => {
    if (!description || description.length < 10) {
      setErrorMsg('Aprašymą turi sudaryti 10 ar daugiau raidžių');
      return;
    }
    if (!id) return;

    setSaving(true);
    try {
      const res = await fetch(`https://oyster-app-koqt5.ondigitalocean.app/api/menius/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'Nepavyko atnaujinti meniu');
      }

      const updated = await res.json();
      setSuccessOpen(true);
      setTimeout(() => navigate(`/meniu/${updated.id}`), 1200);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (!meniu) return <Typography color="error">Meniu not found.</Typography>;

  return (
    <Box sx={{ mt: 4, px: 2, maxWidth: 600, mx: 'auto' }}>
      <Button variant="text" onClick={handleBack} sx={{ mb: 2 }}>← Atgal</Button>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>{meniu.name}</Typography>

      <TextField
        label="Aprašymas"
        value={description}
        onChange={e => setDescription(e.target.value)}
        fullWidth multiline minRows={4}
        sx={{ mb: 3, backgroundColor: '#fff' }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={24} /> : 'Išsaugoti'}
        </Button>
        <Button variant="outlined" onClick={handleBack}>Atšaukti</Button>
      </Box>

      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>Meniu atnaujintas sėkmingai!</Alert>
      </Snackbar>

      <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg('')}>
        <Alert severity="error" sx={{ width: '100%' }}>{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EditMeniu;

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';

const CreateDish = () => {
  const { id: meniuId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [ingredients, setIngredients] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('accessToken');

  const handleSubmit = async () => {
    if (!meniuId) return;

    if (
      !name || name.length < 2 ||
      !description || description.length < 5 ||
      !ingredients || ingredients.length < 5 ||
      price <= 0
    ) {
      alert('Please fill in all fields correctly.');
      return;
    }

    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      alert('Nuotraukos nuoroda turi būti validi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5071/api/menius/${meniuId}/dishes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price,
          ingredients,
          isAvailable,
          imageUrl,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMessage = 'Nepavyko sukurti patiekalo';
        try {
          const errJson = JSON.parse(errText);
          errMessage = errJson?.message || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const text = await res.text();
      const newDish = text ? JSON.parse(text) : null;

      if (newDish?.id) {
        navigate(`/meniu/${meniuId}/dishes/${newDish.id}`);
      } else {
        navigate(`/meniu/${meniuId}`);
      }

    } catch (err: any) {
      alert(err.message || 'Kažkas nutiko ne taip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 10, textAlign: 'center', px: 2, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Sukurti naują patiekalą</Typography>

      <TextField
        label="Pavadinimas"
        value={name}
        onChange={e => setName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Aprašymas"
        value={description}
        onChange={e => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Kaina"
        type="number"
        value={price}
        onChange={e => setPrice(Number(e.target.value))}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Patiekalo sudedamosios dalys"
        value={ingredients}
        onChange={e => setIngredients(e.target.value)}
        fullWidth
        multiline
        rows={2}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Nuotrauka (URL)"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={<Checkbox checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} />}
        label="Patiekalą galima užsisakyti"
        sx={{ mb: 3 }}
      />

      <Box>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Sukurti patiekalą'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ ml: 2 }}
          onClick={() => navigate(-1)}
        >
          Atšaukti
        </Button>
      </Box>
    </Box>
  );
};

export default CreateDish;

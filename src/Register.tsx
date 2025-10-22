import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const registerRes = await fetch('http://localhost:5071/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserName: username, Email: email, Password: password }),
      });

      if (!registerRes.ok) {
        const msg = await registerRes.text();
        throw new Error(msg || 'Nepavyko prisiregistruoti');
      }

      console.log('✅ Prisiregistruota sėkmingai');

      const loginRes = await fetch('http://localhost:5071/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserName: username, Password: password }),
      });

      if (!loginRes.ok) {
        const msg = await loginRes.text();
        throw new Error(msg || 'Nepavyko prisijungti');
      }

      const loginData = await loginRes.json();

      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      localStorage.setItem('username', username);
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Kažkas įvyko ne taip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>Registracija</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Vartotojo vardas"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="El. paštas"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Slaptažodis"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Registruotis'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;

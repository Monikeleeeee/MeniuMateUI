import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5071/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, password }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Login failed");
      }

      const data = await response.json();

      const decoded: any = jwtDecode(data.accessToken);
      const userId = decoded.sub;
      const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        ? Array.isArray(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"])
          ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
          : [decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]]
        : [];

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem("roles", roles.join(","));
      localStorage.setItem("username", username);

      window.dispatchEvent(new Event("login"));
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 8, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Prisijungti
        </Typography>
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
            type="password"
            label="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Prisijungti"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;

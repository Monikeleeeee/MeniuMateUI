import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

const CreateMeniu = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");

  const handleSubmit = async () => {
    if (!name || name.length < 2 || !description || description.length < 10) {
      alert("Prašome užpildyti visus laukus teisingai.");
      return;
    }

    if (!token) {
      alert("Nerastas prisijungimo raktas.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://oyster-app-koqt5.ondigitalocean.app/api/menius", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = "Nepavyko sukurti meniu.";
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson?.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const text = await res.text();
      const newMeniu = text ? JSON.parse(text) : null;

      if (newMeniu?.id) {
        navigate(`/meniu/${newMeniu.id}`);
      } else {
        navigate("/");
      }
    } catch (err: any) {
      alert(err.message || "Įvyko klaida kuriant meniu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        mt: 10,
        textAlign: "center",
        px: 2,
        maxWidth: 500,
        mx: "auto",
        transition: "all 0.3s ease",
      }}
    >
      <Typography variant="h4" sx={{ mb: 3 }}>
        Sukurti naują meniu
      </Typography>

      <TextField
        label="Pavadinimas"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Aprašymas"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 3 }}
      />

      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Sukurti meniu"}
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

export default CreateMeniu;

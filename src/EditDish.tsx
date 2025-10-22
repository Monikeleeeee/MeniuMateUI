import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";

const EditDish = () => {
  const { id: meniuId, dishId } = useParams<{ id: string; dishId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [ingredients, setIngredients] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingDish, setLoadingDish] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const roles = localStorage.getItem("roles")?.split(",") || [];
    if (!roles.includes("Admin")) {
      alert("Tik administratorius gali redaguoti patiekalus");
      navigate(`/meniu/${meniuId}/dishes/${dishId}`);
      return;
    }

    const fetchDish = async () => {
      try {
        const res = await fetch(
          `http://localhost:5071/api/menius/${meniuId}/dishes/${dishId}`
        );
        if (!res.ok) throw new Error("Iškilo problema gaunant duomenis");

        const data = await res.json();
        setDescription(data.description);
        setPrice(data.price);
        setIngredients(data.ingredients);
        setIsAvailable(data.isAvailable);
      } catch (err: any) {
        setError(err.message || "Kažkas nutiko ne taip");
      } finally {
        setLoadingDish(false);
      }
    };

    fetchDish();
  }, [meniuId, dishId, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meniuId || !dishId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:5071/api/menius/${meniuId}/dishes/${dishId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description,
            price,
            ingredients,
            isAvailable,
          }),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Nepavyko atnaujinti patiekalo informacijos");
      }

      navigate(`/meniu/${meniuId}`);
    } catch (err: any) {
      setError(err.message || "Kažkas nutiko ne taip");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(`/meniu/${meniuId}/dishes/${dishId}`);

  if (loadingDish)
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;

  return (
    <Box
      sx={{
        mt: 8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "all 0.3s ease",
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 500, transition: "all 0.3s ease" }}>
        <Button
          variant="text"
          onClick={handleBack}
          sx={{
            mb: 2,
            transition: "all 0.3s ease",
            "&:hover": { color: "#1976d2" },
          }}
        >
          ← Atgal
        </Button>

        <Typography
          variant="h5"
          sx={{ mb: 3, textAlign: "center", transition: "all 0.3s ease" }}
        >
          Redaguoti patiekalą
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Aprašas"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            sx={{
              backgroundColor: "#fff",
              transition: "all 0.3s ease",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          <TextField
            fullWidth
            label="Kaina"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            margin="normal"
            required
            sx={{
              backgroundColor: "#fff",
              transition: "all 0.3s ease",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          <TextField
            fullWidth
            label="Patiekalo sudedamosios dalys"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            margin="normal"
            required
            sx={{
              backgroundColor: "#fff",
              transition: "all 0.3s ease",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
            }
            label="Patiekalą galima užsisakyti"
            sx={{ transition: "all 0.3s ease" }}
          />

          {error && (
            <Typography color="error" sx={{ mt: 1, transition: "all 0.3s ease" }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 3, textAlign: "center", transition: "all 0.3s ease" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ transition: "all 0.3s ease", "&:hover": { transform: "scale(1.05)" } }}
            >
              {loading ? <CircularProgress size={24} /> : "Išsaugoti pakeitimus"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditDish;

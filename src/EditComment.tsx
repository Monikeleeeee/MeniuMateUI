import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button, CircularProgress } from "@mui/material";

const EditComment = () => {
  const { id: meniuId, dishId, commentId } = useParams<{ id: string; dishId: string; commentId: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingComment, setLoadingComment] = useState(true);

  const token = localStorage.getItem("accessToken");
  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    if (!meniuId || !dishId || !commentId) return;

    const fetchComment = async () => {
      try {
        const res = await fetch(`http://localhost:5071/api/menius/${meniuId}/dishes/${dishId}/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Nepavyko gauti komentaro iš duomenų bazės");

        const data = await res.json();
        setContent(data.content);
        setRating(data.rating);
      } catch (err: any) {
        setError(err.message || "Kažkas nutiko ne taip");
      } finally {
        setLoadingComment(false);
      }
    };

    fetchComment();
  }, [meniuId, dishId, commentId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meniuId || !dishId || !commentId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:5071/api/menius/${meniuId}/dishes/${dishId}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Content: content, Rating: rating }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Nepavyko atnaujinti komentaro");
      }

      navigate(`/meniu/${meniuId}/dishes/${dishId}`);
    } catch (err: any) {
      setError(err.message || "Kažkas nutiko ne taip");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(-1);

  if (loadingComment) return <CircularProgress />;

  return (
    <Box sx={{ mt: 8, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Button variant="text" onClick={handleBack} sx={{ mb: 2 }}>
          ← Atgal
        </Button>

        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Redaguoti komentarą
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Komentaro turinys"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Įvertinimas (1-5)"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            inputProps={{ min: 1, max: 5 }}
            margin="normal"
            required
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Atnaujinti komentarą"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditComment;

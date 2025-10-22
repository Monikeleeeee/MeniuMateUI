import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState } from "react";

const DeleteMeniu = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(true);

  const token = localStorage.getItem("accessToken");

  const handleDelete = async () => {
    if (!id || !token) return;

    setLoading(true);

    try {
      const res = await fetch(`https://oyster-app-koqt5.ondigitalocean.app/api/menius/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Nepavyko ištrinti meniu.");

      navigate("/");
    } catch (err: any) {
      alert(err.message || "Įvyko klaida.");
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <Dialog
      open={openConfirm}
      onClose={handleCancel}
      aria-labelledby="confirm-dialog-title"
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          textAlign: "center",
          px: 3,
          py: 2,
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontSize: 20 }}>
        Patvirtinti ištrynimą
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mt: 1 }}>
          Ar tikrai norite ištrinti šį meniu?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
        <Button
          onClick={handleCancel}
          color="inherit"
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Atšaukti
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Ištrinti"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMeniu;

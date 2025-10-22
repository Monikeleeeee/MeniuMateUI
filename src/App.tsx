import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Layout from "./Layout";
import MeniusPage from "./MeniusPage";
import OneMeniuPage from "./OneMeniuPage";
import OneDishPage from "./OneDishPage";
import Login from "./Login";
import CreateComment from "./CreateComment";
import EditComment from "./EditComment";
import EditDish from "./EditDish";
import DeleteDish from "./DeleteDish";
import CreateDish from "./CreateDish";
import EditMeniu from "./EditMeniu";
import DeleteMeniu from "./DeleteMeniu";
import CreateMeniu from "./CreateMeniu";
import Register from "./Register";

function App() {
  return (
    <Router>
      <Layout>
        <Box
          sx={{
            mt: 2,
            px: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 600 }}>
            <Routes>
              {/* Pagrindinis puslapis */}
              <Route path="/" element={<MeniusPage />} />
              <Route path="/meniu/:id" element={<OneMeniuPage />} />
              <Route path="/meniu/:id/dishes/:dishId" element={<OneDishPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Komentarai */}
              <Route
                path="/meniu/:id/dishes/:dishId/create-comment"
                element={<CreateComment />}
              />
              <Route
                path="/meniu/:id/dishes/:dishId/edit-comment/:commentId"
                element={<EditComment />}
              />

              {/* Patiekalai */}
              <Route
                path="/meniu/:id/dishes/:dishId/edit"
                element={<EditDish />}
              />
              <Route
                path="/meniu/:id/dishes/:dishId/delete"
                element={<DeleteDish />}
              />
              <Route path="/meniu/:id/create-dish" element={<CreateDish />} />

              {/* Menius */}
              <Route path="/meniu/:id/edit" element={<EditMeniu />} />
              <Route path="/meniu/:id/delete" element={<DeleteMeniu />} />
              <Route path="/meniu/create-meniu" element={<CreateMeniu />} />

            </Routes>
          </Box>
        </Box>
      </Layout>
    </Router>
  );
}

export default App;

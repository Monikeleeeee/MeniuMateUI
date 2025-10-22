import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "./axiosClient";

const colors = {
  header: "#F48FB1",
  footer: "#F06292",
  button: "#F8BBD0",
  buttonHover: "#F48FB1",
  background: "#FFF0F5",
  menuBackground: "#FCE4EC",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("accessToken");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
    };
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, [navigate]);

  useEffect(() => {
  const interval = setInterval(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      interface RefreshResponse {
        accessToken: string;
        refreshToken: string;
      }

      const response = await axiosClient.post<RefreshResponse>("/api/accessToken", { refreshToken });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    } catch {
      window.dispatchEvent(new Event("logout"));
    }
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);


  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("logout"));
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: colors.background,
        transition: "background-color 0.3s ease",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: colors.header, transition: "background-color 0.3s ease" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer", fontWeight: "bold", color: "#fff", transition: "color 0.3s ease" }}
            onClick={() => navigate("/")}
          >
            MeniuMate
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/")}
              sx={{
                color: "#fff",
                backgroundColor: colors.button,
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
              }}
            >
              Pradžia
            </Button>

            {!token ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "#fff",
                    backgroundColor: colors.button,
                    transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
                  }}
                >
                  Prisijungti
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate("/register")}
                  sx={{
                    color: "#fff",
                    backgroundColor: colors.button,
                    transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
                  }}
                >
                  Registruotis
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  color: "#fff",
                  backgroundColor: colors.button,
                  transition: "all 0.3s ease",
                  "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
                }}
              >
                Atsijungti ({username})
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              color="inherit"
              onClick={() => setMenuOpen(!menuOpen)}
              sx={{ transition: "transform 0.3s ease", "&:hover": { transform: "rotate(90deg)" } }}
            >
              <MenuIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>
        </Toolbar>

        <Box
          sx={{
            display: { xs: menuOpen ? "flex" : "none", md: "none" },
            flexDirection: "column",
            backgroundColor: colors.menuBackground,
            px: 2,
            py: 1,
            transition: "all 0.3s ease-in-out",
            transform: menuOpen ? "translateY(0)" : "translateY(-10px)",
            opacity: menuOpen ? 1 : 0,
          }}
        >
          <Button
            sx={{
              color: "#fff",
              backgroundColor: colors.button,
              transition: "all 0.3s ease",
              "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
            }}
            onClick={() => navigate("/")}
          >
            Pradžia
          </Button>

          {!token ? (
            <>
              <Button
                sx={{
                  color: "#fff",
                  backgroundColor: colors.button,
                  transition: "all 0.3s ease",
                  "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
                }}
                onClick={() => navigate("/login")}
              >
                Prisijungti
              </Button>
              <Button
                sx={{
                  color: "#fff",
                  backgroundColor: colors.button,
                  transition: "all 0.3s ease",
                  "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
                }}
                onClick={() => navigate("/register")}
              >
                Registruotis
              </Button>
            </>
          ) : (
            <Button
              sx={{
                color: "#fff",
                backgroundColor: colors.button,
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: colors.buttonHover, transform: "scale(1.03)" },
              }}
              onClick={handleLogout}
            >
              Atsijungti ({username})
            </Button>
          )}
        </Box>
      </AppBar>

      <Container
        sx={{
          flexGrow: 1,
          py: 4,
          width: "100%",
          maxWidth: { xs: "100%", sm: 600, md: 900 },
          backgroundColor: colors.background,
          transition: "background-color 0.3s ease",
        }}
      >
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          backgroundColor: colors.footer,
          color: "#fff",
          textAlign: "center",
          py: 3,
          mt: "auto",
          transition: "background-color 0.3s ease",
        }}
      >
        <Typography variant="body2" sx={{ transition: "color 0.3s ease" }}>
          © {new Date().getFullYear()} MeniuMate | Sukūrė Monika Selvenytė
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;

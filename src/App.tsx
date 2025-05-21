import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import GroupsPage from './GroupsPage';
import CreateTransactionPage from './CreateTransactionPage';
import GroupDetailPage from './GroupDetailPage';

function App() {
  return (
    <Router>
      <AppBar
        position="fixed" 
        sx={{
          backgroundColor: '#fff', borderBottom: '1px solid #ccc', height: '60px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '0 20px', zIndex: 1000, color: 'black',
        }}
      >
        <Toolbar
          sx={{
            height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, minHeight: '60px !important', 
          }}
        >
          <Button color="inherit" component={Link} to="/">
            Groups
          </Button>
        </Toolbar>
      </AppBar>

      <Box
      sx={{
        mt: '60px', 
        height: `calc(100vh - 60px)`,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Routes>
          <Route path="/" element={<GroupsPage />} />
          <Route path="/group/:id" element={<GroupDetailPage />} />
          <Route path="/groups/:id/transaction/new" element={<CreateTransactionPage />} />
        </Routes>
      </Box>
    </Box>

    </Router>
  );
}

export default App;

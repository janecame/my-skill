import { useState } from 'react';
import {
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, Tooltip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAuth } from './AuthContext';

// Lock icon in the header: opens a password dialog when locked,
// logs out when already unlocked.
export default function AdminLock() {
  const { isAdmin, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (isAdmin) {
      logout();
    } else {
      setPassword('');
      setError('');
      setOpen(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await login(password);
      setOpen(false);
    } catch {
      setError('Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title={isAdmin ? 'Admin mode — click to lock' : 'Admin login'}>
        <IconButton onClick={handleClick} size="small" aria-label="admin lock">
          {isAdmin ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Admin login</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading || !password}>
            {loading ? 'Checking…' : 'Unlock'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

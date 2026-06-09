import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  fetchTechStackOptions,
  createTechStackOption,
  updateTechStackOption,
  deleteTechStackOption,
} from '../api';
import { TechStackOption } from '../types';

function TechStackSection() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: options, isLoading } = useQuery({ queryKey: ['tech-stack-options'], queryFn: fetchTechStackOptions });

  const cardStyle = {
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1,
    boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
  };

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);
  const [addName, setAddName] = useState('');
  const [addError, setAddError] = useState('');
  const [editTarget, setEditTarget] = useState<TechStackOption | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TechStackOption | null>(null);

  const addMutation = useMutation({
    mutationFn: () => createTechStackOption(addName.trim()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tech-stack-options'] }); setAddName(''); setAddError(''); setPage(1); },
    onError: () => setAddError('Failed to add. Name may already exist.'),
  });

  const editMutation = useMutation({
    mutationFn: () => updateTechStackOption(editTarget!.id, editName.trim()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tech-stack-options'] }); setEditTarget(null); },
    onError: () => setEditError('Failed to save. Name may already exist.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTechStackOption(deleteTarget!.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tech-stack-options'] }); setDeleteTarget(null); },
  });

  function handleAdd() {
    if (!addName.trim()) { setAddError('Name is required'); return; }
    addMutation.mutate();
  }

  function openEdit(opt: TechStackOption) { setEditTarget(opt); setEditName(opt.name); setEditError(''); }

  return (
    <>
      <Box sx={{ ...cardStyle, p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Box sx={{ width: 3, height: 18, bgcolor: 'primary.main', borderRadius: 1 }} />
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
            Tech Stack Options
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 2 }}>
          These options appear in the Tech Stack picker when adding or editing a project.
        </Typography>

        <Stack direction="row" spacing={1} mb={2.5}>
          <TextField value={addName} onChange={(e) => { setAddName(e.target.value); setAddError(''); }} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="e.g. Vue.js" size="small" sx={{ flex: 1 }} error={!!addError} helperText={addError} />
          <Button variant="contained" size="small" onClick={handleAdd} disabled={addMutation.isPending} sx={{ textTransform: 'none', bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' }, flexShrink: 0 }}>
            {addMutation.isPending ? 'Adding…' : '+ Add'}
          </Button>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} color="primary" />
          </Box>
        ) : (() => {
          const all = options ?? [];
          const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
          const safePage = Math.min(page, totalPages);
          const pageItems = all.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

          return (
            <>
              <Stack spacing={0}>
                {pageItems.map((opt, i) => (
                  <Stack key={opt.id} direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ px: 1.5, py: 1, borderRadius: 1, borderBottom: i < pageItems.length - 1 ? `1px solid ${theme.palette.divider}` : 'none', '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}>
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                      {opt.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => openEdit(opt)} sx={{ p: 0.5 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(opt)} sx={{ p: 0.5, '&:hover': { color: 'error.main' } }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
                {all.length === 0 && (
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', textAlign: 'center', py: 3 }}>
                    No options yet — add one above
                  </Typography>
                )}
              </Stack>

              {totalPages > 1 && (
                <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1.5} pt={1.5} sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, all.length)} of {all.length}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton size="small" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} sx={{ p: 0.5 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                    </IconButton>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <ButtonBase key={p} onClick={() => setPage(p)}
                        sx={{ width: 28, height: 28, borderRadius: '50%', fontSize: '0.75rem', fontFamily: '"Google Sans", "Roboto", sans-serif', color: p === safePage ? '#ffffff' : 'text.secondary', bgcolor: p === safePage ? 'primary.main' : 'transparent', '&:hover': { bgcolor: p === safePage ? 'primary.dark' : theme.palette.action.hover } }}>
                        {p}
                      </ButtonBase>
                    ))}
                    <IconButton size="small" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} sx={{ p: 0.5 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </IconButton>
                  </Stack>
                </Stack>
              )}
            </>
          );
        })()}
      </Box>

      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>Edit Tech Stack Option</DialogTitle>
        <DialogContent>
          <TextField value={editName} onChange={(e) => { setEditName(e.target.value); setEditError(''); }} onKeyDown={(e) => e.key === 'Enter' && editMutation.mutate()} size="small" fullWidth autoFocus sx={{ mt: 1 }} error={!!editError} helperText={editError} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTarget(null)} size="small" sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => editMutation.mutate()} variant="contained" size="small" disabled={editMutation.isPending} sx={{ textTransform: 'none', bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}>
            {editMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
          Remove "{deleteTarget?.name}"?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
            This removes it from the picker. Existing projects that use it are not affected.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} size="small" sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={() => deleteMutation.mutate()} variant="contained" size="small" disabled={deleteMutation.isPending} sx={{ textTransform: 'none', bgcolor: '#d93025', '&:hover': { bgcolor: '#b31412' } }}>
            {deleteMutation.isPending ? 'Removing…' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function SettingsPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Box sx={{ width: 3, height: 28, bgcolor: 'text.secondary', borderRadius: 1 }} />
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
            Settings
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>Manage app configuration</Typography>
        </Box>
      </Stack>

      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
          sx={{ minHeight: 40, '& .MuiTab-root': { textTransform: 'none', fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '0.875rem', minHeight: 40, py: 0 }, '& .Mui-selected': { color: 'primary.main !important' }, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}>
          <Tab label="Entries" />
        </Tabs>
      </Box>

      {activeTab === 0 && <TechStackSection />}
    </Box>
  );
}

import { createContext, useContext, useState, useCallback } from 'react';

const EditProfileContext = createContext(null);

export function EditProfileProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);
  return (
    <EditProfileContext.Provider value={{ open, setOpen, openDialog, closeDialog }}>
      {children}
    </EditProfileContext.Provider>
  );
}

export function useEditProfile() {
  const ctx = useContext(EditProfileContext);
  if (!ctx) throw new Error('useEditProfile must be inside EditProfileProvider');
  return ctx;
}

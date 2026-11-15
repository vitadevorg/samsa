import { useContext } from 'react';
import { ForumContext } from './forum-context';

export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum debe usarse dentro de <ForumProvider>');
  }
  return context;
};

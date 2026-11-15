import React, { useCallback, useMemo, useState } from 'react';
import { ForumContext } from './forum-context';
import { createId } from '../utils/ids';

// Publicaciones del foro escritas por médicos. Es un mock en memoria, como el resto de los
// datos de la app: se conserva mientras la página esté abierta y se pierde al recargar.
// Con backend, la verificación de autoría la hace el servidor; acá se repite en el cliente
// para que ninguna pantalla pueda editar o borrar la nota de otro médico.

const sameAuthor = (post, authorEmail) =>
  Boolean(authorEmail) && post.authorEmail === authorEmail.trim().toLowerCase();

// Nota de demostración de otra médica: sirve para comprobar que solo se pueden editar
// o borrar las publicaciones propias.
const SEED_POSTS = [
  {
    id: 'post-demo-1',
    title: 'Hidratación en verano: cuánta agua necesitás realmente',
    category: 'Consejos de salud',
    body: 'Con el calor, el cuerpo pierde más agua de la que solemos registrar. Una buena referencia para adultos sanos es tomar entre 2 y 2,5 litros por día, repartidos a lo largo de la jornada y sin esperar a tener sed.\n\nLas personas mayores, los niños y quienes realizan actividad física necesitan prestar especial atención: la sed aparece tarde y la deshidratación puede provocar mareos, cansancio y dolor de cabeza.\n\nSi tenés una enfermedad renal o cardíaca, consultá con tu médico la cantidad adecuada para vos.',
    image: null,
    authorEmail: 'priscila.gomez@samsa.med',
    authorName: 'Dra. Priscila Gómez',
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: null,
  },
];

export const ForumProvider = ({ children }) => {
  const [posts, setPosts] = useState(SEED_POSTS);

  const addPost = useCallback((data, author) => {
    const post = {
      ...data,
      id: createId(),
      authorEmail: author.email.trim().toLowerCase(),
      authorName: author.name,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  const updatePost = useCallback((id, changes, authorEmail) => {
    setPosts((prev) => prev.map((post) => (
      post.id === id && sameAuthor(post, authorEmail)
        ? { ...post, ...changes, updatedAt: new Date().toISOString() }
        : post
    )));
  }, []);

  const deletePost = useCallback((id, authorEmail) => {
    setPosts((prev) => prev.filter((post) => !(post.id === id && sameAuthor(post, authorEmail))));
  }, []);

  const isOwnPost = useCallback((post, authorEmail) => sameAuthor(post, authorEmail), []);

  const value = useMemo(
    () => ({ posts, addPost, updatePost, deletePost, isOwnPost }),
    [posts, addPost, updatePost, deletePost, isOwnPost]
  );

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
};

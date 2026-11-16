import React, { useCallback, useMemo, useState } from 'react';
import { ForumContext, canModerate } from './forum-context';
import { createId } from '../utils/ids';

// Publicaciones del foro escritas por médicos y por VitaDev, y avisos de moderación. Es un mock en memoria, como el resto de los
// datos de la app: se conserva mientras la página esté abierta y se pierde al recargar.
// Con backend, la verificación de autoría la hace el servidor; acá se repite en el cliente
// para que nadie edite notas ajenas y solo VitaDev pueda borrarlas (con un motivo para el autor).

const normalize = (email) => (email ?? '').trim().toLowerCase();
const sameAuthor = (post, authorEmail) => Boolean(authorEmail) && post.authorEmail === normalize(authorEmail);

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
  // Notas institucionales fijas (las del foro original) que VitaDev quitó. No tienen autor a quien avisar.
  const [hiddenNoteIds, setHiddenNoteIds] = useState(() => new Set());
  // Avisos para el autor de una nota borrada por moderación: { id, authorEmail, postTitle, reason, moderatedAt }.
  const [moderationNotices, setModerationNotices] = useState([]);

  const addPost = useCallback((data, author) => {
    const post = {
      ...data,
      id: createId(),
      authorEmail: normalize(author.email),
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

  // Borrado de la nota de otro autor por parte de VitaDev, con el motivo que verá el autor.
  // `moderator` es el usuario de la sesión: si no puede moderar, no se borra nada.
  const moderatePost = useCallback((id, reason, moderator) => {
    if (!canModerate(moderator)) return;
    const target = posts.find((post) => post.id === id);
    if (!target || sameAuthor(target, moderator.email)) return;
    setPosts((prev) => prev.filter((post) => post.id !== id));
    setModerationNotices((prev) => [...prev, {
      id: createId(),
      authorEmail: target.authorEmail,
      postTitle: target.title,
      reason: reason.trim(),
      moderatedAt: new Date().toISOString(),
    }]);
  }, [posts]);

  // VitaDev quita una nota institucional fija del foro.
  const removeFixedNote = useCallback((noteId, moderator) => {
    if (!canModerate(moderator)) return;
    setHiddenNoteIds((prev) => new Set(prev).add(noteId));
  }, []);

  const noticesFor = useCallback(
    (authorEmail) => moderationNotices.filter((notice) => notice.authorEmail === normalize(authorEmail)),
    [moderationNotices]
  );

  const dismissNotice = useCallback((noticeId, authorEmail) => {
    setModerationNotices((prev) => prev.filter((notice) => !(notice.id === noticeId && notice.authorEmail === normalize(authorEmail))));
  }, []);

  const value = useMemo(
    () => ({ posts, addPost, updatePost, deletePost, isOwnPost, moderatePost, noticesFor, dismissNotice, hiddenNoteIds, removeFixedNote }),
    [posts, addPost, updatePost, deletePost, isOwnPost, moderatePost, noticesFor, dismissNotice, hiddenNoteIds, removeFixedNote]
  );

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
};

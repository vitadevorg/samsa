import React, { useCallback, useMemo, useState } from 'react';
import { ForumContext, canModerate } from './forum-context';
import { createId } from '../utils/ids';
import { useClinicData } from '../pages/clinic/clinicDataContext';

// Publicaciones del foro escritas por médicos, VitaDev y administradores de clínica u hospital, y avisos de moderación. Es un mock en memoria, como el resto de los
// datos de la app: se conserva mientras la página esté abierta y se pierde al recargar.
// Con backend, la verificación de autoría la hace el servidor; acá se repite en el cliente
// para que nadie edite notas ajenas y solo puedan borrarlas quienes moderan (con un motivo para el autor):
// VitaDev, cualquier nota; la clínica o el hospital, las de sus propios médicos.

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
  // Nota de un médico de Clínica del Norte: su administradora la puede moderar.
  {
    id: 'post-demo-2',
    title: 'Controles cardiológicos: cada cuánto hacerlos',
    category: 'Prevención',
    body: 'Después de los 40 años conviene hacer un control cardiológico anual, aunque no haya síntomas. Si hay antecedentes familiares, hipertensión, diabetes o tabaquismo, el control puede empezar antes y ser más frecuente.\n\nEl chequeo básico incluye la toma de presión, un electrocardiograma y un análisis de sangre con perfil de colesterol. Según el caso, se suma una ergometría o una ecografía cardíaca.\n\nAnte un dolor de pecho, falta de aire o palpitaciones, no esperes al control: consultá en el momento.',
    image: null,
    authorEmail: 'jesus.zelarayan@samsa.med',
    authorName: 'Dr. Jesús Zelarayan',
    createdAt: '2026-11-12T09:30:00.000Z',
    updatedAt: null,
  },
];

export const ForumProvider = ({ children }) => {
  const [posts, setPosts] = useState(SEED_POSTS);
  // Médicos de cada institución (ForumProvider está dentro de ClinicDataProvider, ver App.jsx).
  const { allAssignments, findDoctor, institutions } = useClinicData();
  // Notas institucionales fijas (las del foro original) que VitaDev quitó. No tienen autor a quien avisar.
  const [hiddenNoteIds, setHiddenNoteIds] = useState(() => new Set());
  // Avisos para el autor de una nota borrada por moderación: { id, authorEmail, postTitle, moderatorName, reason, moderatedAt }.
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

  // ¿Puede `user` borrar la nota ajena `post`? VitaDev, cualquiera; el administrador de una clínica u hospital,
  // solo las de los médicos que atienden en su institución. Las propias se borran con Borrar, no se moderan.
  const canModeratePost = useCallback((user, post) => {
    if (!user || !post || sameAuthor(post, user.email)) return false;
    if (canModerate(user)) return true;
    if (!user.institutionId) return false;
    return allAssignments.some((a) => a.institutionId === user.institutionId && normalize(findDoctor(a.doctorId)?.email) === post.authorEmail);
  }, [allAssignments, findDoctor]);

  // Borrado de la nota de otro autor por moderación, con el motivo que verá el autor.
  // `moderator` es el usuario de la sesión: si no puede moderar esa nota, no se borra nada.
  const moderatePost = useCallback((id, reason, moderator) => {
    const target = posts.find((post) => post.id === id);
    if (!canModeratePost(moderator, target)) return;
    setPosts((prev) => prev.filter((post) => post.id !== id));
    setModerationNotices((prev) => [...prev, {
      id: createId(),
      authorEmail: target.authorEmail,
      postTitle: target.title,
      // Quién la borró, para el aviso al autor: VitaDev o la institución donde atiende.
      moderatorName: canModerate(moderator) ? 'VitaDev' : institutions.find((i) => i.id === moderator.institutionId)?.name ?? 'La administración',
      reason: reason.trim(),
      moderatedAt: new Date().toISOString(),
    }]);
  }, [posts, canModeratePost, institutions]);

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
    () => ({ posts, addPost, updatePost, deletePost, isOwnPost, canModeratePost, moderatePost, noticesFor, dismissNotice, hiddenNoteIds, removeFixedNote }),
    [posts, addPost, updatePost, deletePost, isOwnPost, canModeratePost, moderatePost, noticesFor, dismissNotice, hiddenNoteIds, removeFixedNote]
  );

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
};

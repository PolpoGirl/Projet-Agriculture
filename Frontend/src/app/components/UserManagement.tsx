import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Edit2,
  MoreVertical,
  Shield,
  Trash2,
  User as UserIcon,
  UserPlus,
  X,
} from 'lucide-react';

import api from '../../api/axios';
import { useAuth } from '../contexts/AuthContext';

interface UserItem {
  id: string;
  username: string;
  role: 'admin' | 'agriculteur';
  date_creation: string;
  receive_notifications?: boolean;
}

interface UserFormState {
  username: string;
  password: string;
  role: 'admin' | 'agriculteur';
}

const defaultCreateForm: UserFormState = {
  username: '',
  password: '',
  role: 'agriculteur',
};

const defaultEditForm: UserFormState = {
  username: '',
  password: '',
  role: 'agriculteur',
};

export default function UserManagement() {
  const { currentUser } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<UserFormState>(defaultCreateForm);
  const [editData, setEditData] = useState<UserFormState>(defaultEditForm);

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('users/users/');
      setUsers(res.data);
      setError('');
    } catch (fetchError) {
      console.error('Erreur fetch users:', fetchError);
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const closeCreateModal = () => {
    setShowCreateForm(false);
    setFormData(defaultCreateForm);
    setError('');
  };

  const handleCreate = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Tous les champs sont requis.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('users/users/', formData);
      closeCreateModal();
      await fetchUsers();
    } catch (createError: any) {
      console.error(createError);
      setError(
        createError?.response?.data?.detail ??
        createError?.response?.data?.username?.[0] ??
        'Erreur création utilisateur.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: string) => {
    const user = users.find((item) => item.id === id);
    if (!user) {
      return;
    }

    setEditingId(id);
    setEditData({
      username: user.username,
      password: '',
      role: user.role,
    });
    setOpenMenuId(null);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(defaultEditForm);
    setError('');
  };

  const handleUpdate = async (id: string) => {
    if (!editData.username.trim()) {
      setError("Le nom d'utilisateur est requis.");
      return;
    }

    const payload = {
      username: editData.username,
      role: editData.role,
      ...(editData.password.trim() ? { password: editData.password } : {}),
    };

    setSubmitting(true);
    try {
      await api.patch(`users/users/${id}/`, payload);
      handleCancelEdit();
      await fetchUsers();
    } catch (updateError: any) {
      console.error(updateError);
      setError(
        updateError?.response?.data?.detail ??
        updateError?.response?.data?.username?.[0] ??
        "Erreur lors de la modification de l'utilisateur.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    setOpenMenuId(null);
    if (!confirm('Êtes-vous sûr ?')) {
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`users/users/${id}/`);
      setError('');
      await fetchUsers();
    } catch (deleteError: any) {
      console.error(deleteError);
      setError(
        deleteError?.response?.data?.detail ??
        "Erreur lors de la suppression de l'utilisateur.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR');
  };

  const RoleBadge = ({ role }: { role: string }) =>
    role === 'admin' ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
        <Shield size={10} /> Admin
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
        <UserIcon size={10} /> Agriculteur
      </span>
    );

  return (
    <div ref={containerRef} className="space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold leading-tight text-green-800">Utilisateurs</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus size={16} />
          <span>Créer</span>
        </button>
      </div>

      {error && !showCreateForm && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <X size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between bg-green-700 px-5 py-4">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <UserPlus size={18} /> Créer un utilisateur
              </h3>
              <button
                type="button"
                onClick={closeCreateModal}
                className="p-1 text-green-200 transition-colors hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <X size={14} className="flex-shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Nom d'utilisateur
                </label>
                <input
                  placeholder="ex: jean_dupont"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'agriculteur' })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="agriculteur">Agriculteur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-5 pb-6">
              <button
                type="button"
                onClick={closeCreateModal}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={15} /> {submitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            Chargement des utilisateurs...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Aucun utilisateur</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {editingId === user.id ? (
                <div className="space-y-3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Modifier l'utilisateur
                  </p>
                  <input
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    placeholder="Nom d'utilisateur"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="password"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    placeholder="Nouveau mot de passe (optionnel)"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'agriculteur' })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="agriculteur">Agriculteur</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUpdate(user.id)}
                      disabled={submitting}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Check size={14} /> {submitting ? 'En cours...' : 'Valider'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-green-200 bg-gradient-to-br from-green-100 to-emerald-200 text-sm font-bold text-green-700">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-800">{user.username}</span>
                      <RoleBadge role={user.role} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      ID #{user.id} · {formatDate(user.date_creation)}
                    </p>
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === user.id ? null : user.id);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                      }}
                      disabled={submitting}
                      className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenuId === user.id && (
                      <div
                        className="absolute right-0 top-10 z-30 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(user.id)}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-amber-700 transition-colors hover:bg-amber-50"
                        >
                          <Edit2 size={14} /> Modifier
                        </button>
                        <div className="h-px bg-gray-100" />
                        <button
                          type="button"
                          onClick={() => void handleDelete(user.id)}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 shadow-sm md:block">
        {loading ? (
          <div className="bg-white px-4 py-10 text-center text-sm text-gray-400">
            Chargement des utilisateurs...
          </div>
        ) : (
          <table className="w-full bg-white text-sm">
            <thead>
              <tr className="bg-green-700 text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="w-12 px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Date d'inscription</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`transition-colors duration-150 hover:bg-green-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {editingId === user.id ? (
                    <>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{user.id}</td>
                      <td className="px-4 py-3">
                        <input
                          value={editData.username}
                          onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editData.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'agriculteur' })}
                          className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="agriculteur">Agriculteur</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDate(user.date_creation)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void handleUpdate(user.id)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-all hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check size={13} /> {submitting ? 'En cours...' : 'Valider'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X size={13} /> Annuler
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-400">{user.id}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">{user.username}</span>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(user.date_creation)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user.id)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Edit2 size={13} /> Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(user.id)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={13} /> Supprimer
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

        <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{users.length}</span> utilisateur{users.length > 1 ? 's' : ''} au total
      </p>
    </div>
  );
}

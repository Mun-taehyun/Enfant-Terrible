// src/containers/admin/CategoriesContainer.tsx
import CategoriesView from '@/views/admin/CategoriesView';
import useAdminCategories from '@/hooks/admin/useAdminCategories';

const CategoriesContainer = () => {
  const {
    categories,
    loading,
    serverMessage,

    creating,
    setCreating,
    creatingLoading,
    createCategory,

    editing,
    setEditing,
    saving,
    startEdit,
    cancelEdit,
    saveEdit,

    deletingId,
    removeCategory,
  } = useAdminCategories();

  return (
    <CategoriesView
      categories={categories}
      loading={loading}
      serverMessage={serverMessage}
      creating={creating}
      setCreating={setCreating}
      creatingLoading={creatingLoading}
      onCreate={createCategory}
      editing={editing}
      setEditing={setEditing}
      saving={saving}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onSaveEdit={saveEdit}
      deletingId={deletingId}
      onDelete={removeCategory}
    />
  );
};

export default CategoriesContainer;

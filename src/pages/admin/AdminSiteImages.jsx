import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Trash2, Upload } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../../components/Toast';
import { ConfirmDialog, PageHeader } from './AdminHelpers';

const placements = [
  { key: 'home', label: 'Home slideshow', description: 'Images rotate on the home page.' },
  { key: 'company', label: 'Company page hero' },
  { key: 'divisions', label: 'Divisions page hero' },
  { key: 'products', label: 'Products page hero' },
  { key: 'responsibility', label: 'Responsibility page hero' },
  { key: 'blog', label: 'Blog page hero' },
  { key: 'careers', label: 'Careers page hero' },
  { key: 'contact', label: 'Contact page hero' },
];

export default function AdminSiteImages() {
  const { error: showError, success: showSuccess } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState('');
  const [confirming, setConfirming] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminSiteImages();
      setImages(data.results || []);
    } catch (error) {
      showError(error.message || 'Failed to load site images.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const imagesByPlacement = useMemo(() => placements.reduce((groups, placement) => {
    groups[placement.key] = images
      .filter((image) => image.placement === placement.key)
      .sort((left, right) => left.order_no - right.order_no);
    return groups;
  }, {}), [images]);

  const upload = async (placement, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(placement);
    try {
      const created = await api.uploadSiteImage(placement, file);
      setImages((current) => placement === 'home'
        ? [...current, created]
        : [...current.filter((image) => image.placement !== placement), created]);
      showSuccess(placement === 'home' ? 'Home slide uploaded.' : 'Page hero image updated.');
    } catch (error) {
      showError(error.message || 'Could not upload the image.');
    } finally {
      setUploading('');
      event.target.value = '';
    }
  };

  const remove = async () => {
    if (!confirming) return;
    try {
      await api.deleteSiteImage(confirming.id);
      setImages((current) => current.filter((image) => image.id !== confirming.id));
      showSuccess('Image removed.');
    } catch (error) {
      showError(error.message || 'Could not remove the image.');
    } finally {
      setConfirming(null);
    }
  };

  const moveHomeImage = async (index, delta) => {
    const homeImages = imagesByPlacement.home || [];
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= homeImages.length) return;
    const reordered = [...homeImages];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setImages((current) => [
      ...current.filter((image) => image.placement !== 'home'),
      ...reordered.map((image, order) => ({ ...image, order_no: order + 1 })),
    ]);
    try {
      const data = await api.reorderSiteImages(reordered.map((image) => image.id));
      setImages((current) => [
        ...current.filter((image) => image.placement !== 'home'),
        ...data.results,
      ]);
    } catch (error) {
      showError(error.message || 'Could not reorder home slides.');
      load();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Images"
        subtitle="Update the home slideshow and images shown in page hero sections."
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Loading images...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {placements.map(({ key, label, description }) => {
            const placementImages = imagesByPlacement[key] || [];
            return (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" key={key}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-black text-slate-900">{label}</h2>
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                    {key !== 'home' && <p className="mt-1 text-xs text-slate-400">Uploading a new image replaces the current hero.</p>}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-white">
                    {key === 'home' ? <ImagePlus size={17} /> : <Upload size={17} />}
                    {uploading === key ? 'Uploading...' : key === 'home' ? 'Add slide' : 'Replace image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={uploading === key}
                      onChange={(event) => upload(key, event)}
                    />
                  </label>
                </div>
                {placementImages.length ? (
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    {placementImages.map((image, index) => (
                      <article className="overflow-hidden rounded-lg border border-slate-200" key={image.id}>
                        <img
                          src={image.url}
                          alt={label}
                          className="aspect-video w-full bg-slate-100 object-cover"
                        />
                        <div className="flex items-center justify-between gap-2 p-3">
                          <span className="min-w-0 truncate text-xs font-semibold text-slate-600" title={image.file_name}>
                            {image.file_name}
                          </span>
                          <div className="flex shrink-0 items-center gap-1">
                            {key === 'home' && (
                              <>
                                <button
                                  type="button"
                                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                  disabled={index === 0}
                                  onClick={() => moveHomeImage(index, -1)}
                                  aria-label="Move slide earlier"
                                >
                                  <ChevronUp size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                  disabled={index === placementImages.length - 1}
                                  onClick={() => moveHomeImage(index, 1)}
                                  aria-label="Move slide later"
                                >
                                  <ChevronDown size={17} />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="rounded p-1 text-red-600 hover:bg-red-50"
                              onClick={() => setConfirming(image)}
                              aria-label={`Delete ${image.file_name}`}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="p-5 text-sm text-slate-500">No uploaded image. The site will use its default image.</p>
                )}
              </section>
            );
          })}
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title="Remove site image?"
          message={`Remove "${confirming.file_name}" from this page?`}
          onConfirm={remove}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GripVertical, ImagePlus, Monitor, Smartphone, Trash2, Upload } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../../components/Toast';
import { ConfirmDialog, PageHeader } from './AdminHelpers';

const placements = [
  { key: 'home', label: 'Home slideshow', description: 'Images rotate on the home page.', webSize: '1920 x 900', mobileSize: '1080 x 1350' },
  { key: 'company', label: 'Company page hero', webSize: '1920 x 720', mobileSize: '1080 x 1350' },
  { key: 'divisions', label: 'Divisions page hero', webSize: '1920 x 720', mobileSize: '1080 x 1350' },
  { key: 'products', label: 'Products page hero', webSize: '1920 x 720', mobileSize: '1080 x 1350' },
  { key: 'responsibility', label: 'Responsibility page hero', webSize: '1920 x 720', mobileSize: '1080 x 1350' },
  { key: 'blog', label: 'Blog page hero', webSize: '1920 x 720', mobileSize: '1080 x 1350' },
  { key: 'careers', label: 'Careers page hero', webSize: '1920 x 720', mobileSize: '1080 x 1350' },
  { key: 'contact', label: 'Contact page hero', webSize: '1920 x 720', mobileSize: '1080 x 1350' },
];

const heroPlacements = placements.filter((placement) => placement.key !== 'home');

function ImageMeta({ src }) {
  const [size, setSize] = useState('');

  useEffect(() => {
    setSize('');
  }, [src]);

  if (!src) return null;

  return (
    <span className="site-image-meta">
      {size || 'Checking size...'}
      <img
        src={src}
        alt=""
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          setSize(`${naturalWidth} x ${naturalHeight}`);
        }}
      />
    </span>
  );
}

function UploadSlot({ title, recommendedSize, imageUrl, fileName, uploading, onFile }) {
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file) onFile(file);
  };

  return (
    <div
      className={`site-image-slot${dragging ? ' is-dragging' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      <div className="site-image-slot__top">
        <div>
          <p className="site-image-slot__title">{title}</p>
          <p className="site-image-slot__size">Recommended {recommendedSize}</p>
        </div>
        {title === 'Web image' ? <Monitor size={18} /> : <Smartphone size={18} />}
      </div>

      <div className="site-image-slot__preview">
        {imageUrl ? (
          <img src={imageUrl} alt={fileName || title} />
        ) : (
          <div>
            <Upload size={22} />
            <span>No image uploaded</span>
          </div>
        )}
      </div>

      <div className="site-image-slot__bottom">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-700" title={fileName || ''}>
            {fileName || 'Waiting for upload'}
          </p>
          <ImageMeta src={imageUrl} />
        </div>
        <label className="site-image-upload-button">
          {uploading ? 'Uploading...' : imageUrl ? 'Replace' : 'Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}

function PlacementTable({
  placement,
  images,
  uploading,
  draggingImageId,
  onAdd,
  onReplace,
  onDelete,
  onDragStart,
  onDrop,
}) {
  return (
    <section className="site-image-section">
      <div className="site-image-section__head">
        <div>
          <h2>{placement.label}</h2>
          <p>{placement.description || 'First image in the order is used on the public page.'}</p>
        </div>
        <label className={`site-image-add-button${uploading === `${placement.key}:new` ? ' is-uploading' : ''}`}>
          <ImagePlus size={17} />
          {uploading === `${placement.key}:new` ? 'Uploading...' : 'Add image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading === `${placement.key}:new`}
            onChange={(event) => {
              onAdd(placement.key, event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      {images.length ? (
        <div className="site-image-table">
          {images.map((image, index) => (
            <article
              className={`site-image-row${draggingImageId === image.id ? ' is-dragging' : ''}`}
              key={image.id}
              draggable
              onDragStart={() => onDragStart(image.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop(placement.key, image.id)}
              onDragEnd={() => onDragStart(null)}
            >
              <div className="site-image-row__handle">
                <span className="site-image-drag-handle" title="Drag to reorder">
                  <GripVertical size={17} />
                </span>
                <strong>#{index + 1}</strong>
                {index === 0 && placement.key !== 'home' && <small>Active hero</small>}
              </div>
              <div className="site-image-row__uploads">
                <UploadSlot
                  title="Web image"
                  recommendedSize={placement.webSize}
                  imageUrl={image.url}
                  fileName={image.file_name}
                  uploading={uploading === `${image.id}:web`}
                  onFile={(file) => onReplace(image, 'web', file)}
                />
                <UploadSlot
                  title="Mobile image"
                  recommendedSize={placement.mobileSize}
                  imageUrl={image.mobile_url}
                  fileName={image.mobile_file_name}
                  uploading={uploading === `${image.id}:mobile`}
                  onFile={(file) => onReplace(image, 'mobile', file)}
                />
              </div>
              <button
                type="button"
                className="site-image-delete"
                onClick={() => onDelete(image)}
                aria-label={`Delete ${image.file_name || 'site image'}`}
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="site-image-empty">
          <ImagePlus size={34} />
          <p>No images uploaded yet.</p>
          <span>Add a web image to start this list.</span>
        </div>
      )}
    </section>
  );
}

export default function AdminSiteImages() {
  const { error: showError, success: showSuccess } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [draggingImageId, setDraggingImageId] = useState(null);
  const [activeView, setActiveView] = useState('home');

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

  const upsertImage = (updated) => {
    setImages((current) => current.some((image) => image.id === updated.id)
      ? current.map((image) => (image.id === updated.id ? updated : image))
      : [...current, updated]);
  };

  const uploadNewImage = async (placement, file) => {
    if (!file) return;
    setUploading(`${placement}:new`);
    try {
      const created = await api.uploadSiteImage(placement, { image: file });
      setImages((current) => [...current, created]);
      showSuccess(placement === 'home' ? 'Home image added.' : 'Hero image added.');
    } catch (error) {
      showError(error.message || 'Could not upload the image.');
    } finally {
      setUploading('');
    }
  };

  const replaceImage = async (image, kind, file) => {
    if (!file || !image?.id) return;
    setUploading(`${image.id}:${kind}`);
    try {
      const updated = await api.updateSiteImage(image.id, kind === 'mobile' ? { mobileImage: file } : { image: file });
      upsertImage(updated);
      showSuccess(kind === 'mobile' ? 'Mobile image updated.' : 'Web image updated.');
    } catch (error) {
      showError(error.message || 'Could not update the image.');
    } finally {
      setUploading('');
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

  const moveImage = async (placement, targetImageId) => {
    if (!draggingImageId || draggingImageId === targetImageId) return;
    const placementImages = imagesByPlacement[placement] || [];
    const fromIndex = placementImages.findIndex((image) => image.id === draggingImageId);
    const toIndex = placementImages.findIndex((image) => image.id === targetImageId);
    if (fromIndex < 0 || toIndex < 0) return;

    const previousImages = placementImages;
    const reordered = [...placementImages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const normalized = reordered.map((image, order) => ({ ...image, order_no: order + 1 }));
    setDraggingImageId(null);
    setImages((current) => [
      ...current.filter((image) => image.placement !== placement),
      ...normalized,
    ]);

    try {
      const data = await api.reorderSiteImages(placement, normalized.map((image) => image.id));
      setImages((current) => [
        ...current.filter((image) => image.placement !== placement),
        ...data.results,
      ]);
      showSuccess('Image order updated.');
    } catch (error) {
      showError(error.message || 'Could not reorder images.');
      setImages((current) => [
        ...current.filter((image) => image.placement !== placement),
        ...previousImages,
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Images"
        subtitle="Manage multiple web and mobile images, then drag rows to control display order."
      />

      <div className="site-image-tabs" role="tablist" aria-label="Site image groups">
        <button
          type="button"
          className={activeView === 'home' ? 'is-active' : ''}
          onClick={() => setActiveView('home')}
        >
          Home Images
        </button>
        <button
          type="button"
          className={activeView === 'heroes' ? 'is-active' : ''}
          onClick={() => setActiveView('heroes')}
        >
          Hero Images
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-500">Loading images...</div>
      ) : activeView === 'home' ? (
        <PlacementTable
          placement={placements[0]}
          images={imagesByPlacement.home || []}
          uploading={uploading}
          draggingImageId={draggingImageId}
          onAdd={uploadNewImage}
          onReplace={replaceImage}
          onDelete={setConfirming}
          onDragStart={setDraggingImageId}
          onDrop={moveImage}
        />
      ) : (
        <div className="space-y-6">
          {heroPlacements.map((placement) => (
            <PlacementTable
              key={placement.key}
              placement={placement}
              images={imagesByPlacement[placement.key] || []}
              uploading={uploading}
              draggingImageId={draggingImageId}
              onAdd={uploadNewImage}
              onReplace={replaceImage}
              onDelete={setConfirming}
              onDragStart={setDraggingImageId}
              onDrop={moveImage}
            />
          ))}
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title="Remove site image?"
          message={`Remove "${confirming.file_name || confirming.mobile_file_name || 'this image'}" from this list?`}
          onConfirm={remove}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

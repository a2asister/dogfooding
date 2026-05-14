import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api, type Album, type Photo } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const sampleAlbums = [
  {
    name: '自然风光',
    photos: Array.from({ length: 8 }, (_, i) => ({
      url: `https://picsum.photos/400/300?random=${i + 1}`,
      title: `风景 ${i + 1}`,
      depth: (i % 3) + 1,
    })),
  },
  {
    name: '城市建筑',
    photos: Array.from({ length: 6 }, (_, i) => ({
      url: `https://picsum.photos/400/300?random=${i + 10}`,
      title: `建筑 ${i + 1}`,
      depth: (i % 3) + 1,
    })),
  },
  {
    name: '人像摄影',
    photos: Array.from({ length: 5 }, (_, i) => ({
      url: `https://picsum.photos/400/300?random=${i + 20}`,
      title: `人像 ${i + 1}`,
      depth: (i % 3) + 1,
    })),
  },
];

export default function Gallery(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewHistory, setViewHistory] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [coverAlbumId, setCoverAlbumId] = useState<number | null>(null);

  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const previewImageRef = useRef<HTMLDivElement>(null);

  const initializeSampleData = useCallback(async () => {
    try {
      for (const albumData of sampleAlbums) {
        const album = await api.createAlbum({ name: albumData.name });
        await api.batchAddPhotos(album.id, albumData.photos);
      }
      const updatedAlbums = await api.getAlbums();
      setAlbums(updatedAlbums);
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [albumsData, historyData] = await Promise.all([
        api.getAlbums(),
        api.getViewHistory(10),
      ]);
      
      setAlbums(albumsData);
      setViewHistory(
        historyData.map((item) => ({
          id: item.photoId,
          url: item.photoUrl,
          title: item.photoTitle,
          albumId: 0,
          depth: 1,
        }))
      );

      if (albumsData.length === 0) {
        await initializeSampleData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [initializeSampleData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!containerRef.current) return;

    ScrollTrigger.getAll().forEach((t) => t.kill());

    const cards = containerRef.current.querySelectorAll('.photo-card');

    cards.forEach((card, index) => {
      const depth = Number((card as HTMLElement).dataset.depth) || 1;
      const speed = 0.5 + depth * 0.3;

      gsap.fromTo(
        card,
        {
          y: 100 + depth * 50,
          opacity: 0,
          scale: 0.8,
          rotateY: -15 + depth * 5,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          delay: index * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 50%',
            scrub: speed,
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [selectedAlbum, albums]);

  const handlePhotoClick = useCallback(
    async (photo: Photo) => {
      setSelectedPhoto(photo);
      setRotation({ x: 0, y: 0 });
      
      const exists = viewHistory.find((p) => p.id === photo.id);
      if (!exists) {
        try {
          await api.addViewHistory({
            photoId: photo.id,
            photoUrl: photo.url,
            photoTitle: photo.title,
          });
          setViewHistory((prev) => [...prev, photo].slice(-10));
        } catch (error) {
          console.error('Failed to add view history:', error);
        }
      }
    },
    [viewHistory]
  );

  const closePhotoPreview = useCallback(() => {
    setSelectedPhoto(null);
    setRotation({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: rotation.x,
      startY: rotation.y,
    };
  }, [rotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    setRotation({
      x: startPosRef.current.startX + deltaY * 0.5,
      y: startPosRef.current.startY - deltaX * 0.5,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    startPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      startX: rotation.x,
      startY: rotation.y,
    };
  }, [rotation]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    
    setRotation({
      x: startPosRef.current.startX + deltaY * 0.5,
      y: startPosRef.current.startY - deltaX * 0.5,
    });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const openCoverSelector = useCallback((albumId: number) => {
    setCoverAlbumId(albumId);
    setShowCoverSelector(true);
  }, []);

  const closeCoverSelector = useCallback(() => {
    setShowCoverSelector(false);
    setCoverAlbumId(null);
  }, []);

  const setAsCover = useCallback(async (photo: Photo) => {
    if (!coverAlbumId) return;
    
    try {
      const updatedAlbum = await api.updateAlbum(coverAlbumId, { cover: photo.url });
      setAlbums((prev) =>
        prev.map((a) => (a.id === coverAlbumId ? updatedAlbum : a))
      );
      closeCoverSelector();
    } catch (error) {
      console.error('Failed to set cover:', error);
    }
  }, [coverAlbumId, closeCoverSelector]);

  const albumsToRender = selectedAlbum ? [selectedAlbum] : albums;
  const coverAlbum = albums.find((a) => a.id === coverAlbumId);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
        <style>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.2);
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="gallery-container" ref={containerRef}>
      <header className="gallery-header">
        <h1 className="gallery-title">多层视差空间相册浏览器</h1>
        <div className="album-tabs">
          <button
            className={`tab-btn ${!selectedAlbum ? 'active' : ''}`}
            onClick={() => setSelectedAlbum(null)}
          >
            全部相册
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              className={`tab-btn ${selectedAlbum?.id === album.id ? 'active' : ''}`}
              onClick={() => setSelectedAlbum(album)}
            >
              {album.name}
            </button>
          ))}
        </div>
      </header>

      {viewHistory.length > 0 && (
        <div className="history-section">
          <h3 className="history-title">最近浏览</h3>
          <div className="history-strip">
            {viewHistory.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.title}
                className="history-thumb"
                onClick={() => handlePhotoClick(photo)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="gallery-space">
        {albumsToRender.map((album) => (
          <div key={album.id} className="album-layer">
            <div className="album-header">
              <div className="album-cover-container" onClick={() => openCoverSelector(album.id)}>
                {album.cover ? (
                  <img src={album.cover} alt={album.name} className="album-cover" />
                ) : (
                  <div className="album-cover-placeholder">设置封面</div>
                )}
                <div className="album-cover-overlay">
                  <span className="cover-edit-icon">✎</span>
                </div>
              </div>
              <h2 className="album-name">{album.name}</h2>
            </div>
            <div className="photo-grid">
              {album.photos?.map((photo, index) => (
                <div
                  key={photo.id}
                  className="photo-card"
                  data-depth={photo.depth}
                  style={{
                    zIndex: photo.depth * 10,
                    transform: `translateZ(${photo.depth * 30}px)`,
                  }}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <div className="card-inner">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="photo-image"
                      loading="lazy"
                    />
                    <div className="photo-overlay">
                      <span className="photo-title">{photo.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="preview-modal" onClick={closePhotoPreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closePhotoPreview}>
              ×
            </button>
            <div
              className="preview-image-wrapper-3d"
              ref={previewImageRef}
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="preview-image"
                draggable={false}
              />
            </div>
            <div className="preview-info">
              <h3 className="preview-title">{selectedPhoto.title}</h3>
              <p className="preview-album">
                所属相册: {albums.find((a) => a.id === selectedPhoto.albumId)?.name}
              </p>
              <p className="rotation-hint">↔ 拖动图片进行3D旋转预览</p>
            </div>
          </div>
        </div>
      )}

      {showCoverSelector && coverAlbum && (
        <div className="cover-selector-modal" onClick={closeCoverSelector}>
          <div className="cover-selector-content" onClick={(e) => e.stopPropagation()}>
            <div className="selector-header">
              <h3>选择相册封面 - {coverAlbum.name}</h3>
              <button className="close-btn" onClick={closeCoverSelector}>
                ×
              </button>
            </div>
            <div className="cover-grid">
              {coverAlbum.photos?.map((photo) => (
                <div
                  key={photo.id}
                  className={`cover-option ${coverAlbum.cover === photo.url ? 'selected' : ''}`}
                  onClick={() => setAsCover(photo)}
                >
                  <img src={photo.url} alt={photo.title} />
                  {coverAlbum.cover === photo.url && (
                    <div className="current-cover-badge">当前封面</div>
                  )}
                </div>
              ))}
              {(!coverAlbum.photos || coverAlbum.photos.length === 0) && (
                <p className="no-photos-message">该相册暂无图片</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-container {
          min-height: 100vh;
          padding: 2rem;
          perspective: 1000px;
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .gallery-title {
          font-size: 2.5rem;
          color: #fff;
          margin-bottom: 1.5rem;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .album-tabs {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
        }

        .history-section {
          max-width: 1200px;
          margin: 0 auto 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
        }

        .history-title {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        .history-strip {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .history-thumb {
          width: 60px;
          height: 45px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          opacity: 0.7;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .history-thumb:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .gallery-space {
          max-width: 1400px;
          margin: 0 auto;
          transform-style: preserve-3d;
        }

        .album-layer {
          margin-bottom: 4rem;
        }

        .album-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .album-cover-container {
          position: relative;
          width: 80px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .album-cover-container:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .album-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .album-cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
        }

        .album-cover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .album-cover-container:hover .album-cover-overlay {
          opacity: 1;
        }

        .cover-edit-icon {
          font-size: 1.5rem;
          color: #fff;
        }

        .album-name {
          color: #fff;
          font-size: 1.5rem;
          margin: 0;
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          transform-style: preserve-3d;
        }

        .photo-card {
          position: relative;
          cursor: pointer;
          transform-style: preserve-3d;
          transition: transform 0.4s ease;
        }

        .photo-card:hover {
          transform: scale(1.08) rotateY(5deg) rotateX(3deg) translateZ(50px) !important;
          z-index: 100 !important;
        }

        .card-inner {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          background: #1a1a2e;
        }

        .photo-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .photo-card:hover .photo-overlay {
          opacity: 1;
        }

        .photo-title {
          color: #fff;
          font-size: 0.95rem;
        }

        .preview-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          overflow: auto;
          padding: 2rem;
        }

        .preview-content {
          position: relative;
          max-width: 90%;
          max-height: 90vh;
          animation: scaleIn 0.4s ease;
          display: flex;
          flex-direction: column;
        }

        .preview-image-wrapper-3d {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
          user-select: none;
        }

        .preview-image {
          max-width: 100%;
          max-height: 60vh;
          display: block;
          pointer-events: none;
        }

        .preview-info {
          margin-top: 1.5rem;
          text-align: center;
        }

        .preview-title {
          color: #fff;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .preview-album {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .rotation-hint {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .close-btn {
          position: absolute;
          top: -3rem;
          right: 0;
          width: 45px;
          height: 45px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 1.8rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .cover-selector-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          overflow: auto;
          padding: 2rem;
        }

        .cover-selector-content {
          position: relative;
          background: #1a1a2e;
          border-radius: 20px;
          padding: 2rem;
          max-width: 90%;
          max-height: 90vh;
          width: 800px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: scaleIn 0.4s ease;
          margin: auto;
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .selector-header h3 {
          color: #fff;
          margin: 0;
          font-size: 1.25rem;
        }

        .selector-header .close-btn {
          position: static;
          width: 35px;
          height: 35px;
          font-size: 1.25rem;
        }

        .cover-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          overflow-y: auto;
          padding-right: 0.5rem;
          max-height: 60vh;
        }

        .cover-option {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 3px solid transparent;
        }

        .cover-option:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .cover-option.selected {
          border-color: #667eea;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
        }

        .cover-option img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .current-cover-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 0.5rem;
          font-size: 0.75rem;
          text-align: center;
        }

        .no-photos-message {
          grid-column: 1 / -1;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          padding: 2rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes rotateIn {
          from { transform: rotateY(-20deg) rotateX(10deg); }
          to { transform: rotateY(0) rotateX(0); }
        }

        @media (max-width: 768px) {
          .gallery-container {
            padding: 1rem;
          }
          .gallery-title {
            font-size: 1.8rem;
          }
          .photo-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
          .photo-image {
            height: 120px;
          }
          .cover-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
          .cover-option img {
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
}

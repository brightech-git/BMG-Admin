import { memo } from 'react';
import { FileVideo, Trash2 } from 'lucide-react';

const MediaItem = memo(({ item, index, type, isDragged, onDragStart, onDragEnd, onDropItem, onRemove }) => (
    <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.style.border = ''; onDropItem(index); }}
        className={`
            group relative aspect-square rounded-lg overflow-hidden cursor-move transition-all duration-200
            ${isDragged ? 'opacity-50 scale-95 ring-2 ring-primary z-10' : 'hover:scale-[1.02] shadow-md hover:shadow-lg border-2 border-transparent'}
        `}
    >
        {type === 'image' ? (
            <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover bg-gray-100"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/fallback.png'; }}
            />
        ) : (
            <div className="relative w-full h-full bg-gray-900">
                <video src={item.src} className="w-full h-full object-cover" preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <FileVideo className="w-8 h-8 text-white/70" />
                </div>
            </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
            <div className="absolute top-1 left-1 bg-primary text-white p-1 rounded-full text-xs font-semibold">
                {index + 1}
            </div>

            {item.isExisting && (
                <div className="absolute bottom-2 left-2 bg-green-600 text-white p-1 rounded text-[6px]">Exists</div>
            )}

            <button
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                className="absolute bottom-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg"
            >
                <Trash2 className="w-2 h-2" />
            </button>
        </div>

        {!item.isExisting && (
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">New</div>
            </div>
        )}
    </div>
));

MediaItem.displayName = 'MediaItem';
export default MediaItem;
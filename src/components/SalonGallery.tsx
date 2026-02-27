import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Play, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
}

interface SalonGalleryProps {
  gallery: GalleryItem[];
  salonName: string;
}

const SalonGallery = ({ gallery, salonName }: SalonGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  if (!gallery || gallery.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ImageIcon className="h-4 w-4" />
          {t('salon.gallery')} ({gallery.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="relative h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{salonName} - {t('salon.gallery')}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {currentIndex + 1} / {gallery.length}
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative h-[calc(100%-80px)] bg-muted rounded-lg overflow-hidden">
            {gallery[currentIndex].type === 'video' ? (
              <video
                src={gallery[currentIndex].url}
                controls
                className="w-full h-full object-contain"
                poster={gallery[currentIndex].thumbnail}
              />
            ) : (
              <img
                src={gallery[currentIndex].url}
                alt={gallery[currentIndex].title}
                className="w-full h-full object-contain"
              />
            )}

            {/* Navigation */}
            {gallery.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevItem}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextItem}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Type Indicator */}
            <div className="absolute top-4 left-4">
              <Badge className="gap-1">
                {gallery[currentIndex].type === 'video' ? (
                  <>
                    <Play className="h-3 w-3" />
                    Video
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-3 w-3" />
                    Image
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {gallery.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalonGallery;
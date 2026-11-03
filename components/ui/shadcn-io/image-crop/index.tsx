'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as Slot from '@radix-ui/react-slot';
import { CropIcon, RotateCcwIcon } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
  type ReactCropProps,
} from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined
): PercentCrop =>
  centerCrop(
    aspect
      ? makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          mediaWidth,
          mediaHeight
        )
      : { x: 0, y: 0, width: 90, height: 90, unit: '%' },
    mediaWidth,
    mediaHeight
  );

// Kadr liczony w pikselach oryginału (naturalWidth/naturalHeight), a nie w rozmiarze
// podglądu na ekranie — inaczej zdjęcie 1920 px zapisywało się np. jako 408×204 px.
const getCropSourceSize = (
  natural: { width: number; height: number },
  crop: PercentCrop
): { width: number; height: number } => ({
  width: Math.round((crop.width / 100) * natural.width),
  height: Math.round((crop.height / 100) * natural.height),
});

const dataUrlBytes = (dataUrl: string) =>
  Math.ceil(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);

const getCroppedImage = (
  image: HTMLImageElement,
  crop: PercentCrop,
  maxOutputWidth: number,
  maxImageSize: number,
  sourceType: string
): string => {
  const sx = (crop.x / 100) * image.naturalWidth;
  const sy = (crop.y / 100) * image.naturalHeight;
  const source = getCropSourceSize(
    { width: image.naturalWidth, height: image.naturalHeight },
    crop
  );

  // Bez powiększania — co najwyżej zmniejszamy do maxOutputWidth
  let scale = Math.min(1, maxOutputWidth / source.width);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context is null, this should never happen.');
  }

  // WebP trzyma przezroczystość (logo) i jest małe; przeglądarki bez enkodera WebP
  // zwracają PNG, wtedy zdjęcia zapisujemy jako JPEG.
  const fallbackType = sourceType === 'image/png' ? 'image/png' : 'image/jpeg';
  const qualities = [0.92, 0.85, 0.78];

  let result = '';
  while (true) {
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      sx,
      sy,
      source.width,
      source.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    for (const quality of qualities) {
      result = canvas.toDataURL('image/webp', quality);
      if (!result.startsWith('data:image/webp')) {
        result = canvas.toDataURL(fallbackType, quality);
      }
      if (dataUrlBytes(result) <= maxImageSize) {
        return result;
      }
    }

    if (canvas.width <= 400) {
      return result;
    }
    scale *= 0.85;
  }
};

type ImageCropContextType = {
  file: File;
  maxImageSize: number;
  cropSourceSize: { width: number; height: number } | null;
  imgSrc: string;
  crop: PercentCrop | undefined;
  completedCrop: PixelCrop | null;
  imgRef: RefObject<HTMLImageElement | null>;
  onCrop?: (croppedImage: string) => void;
  reactCropProps: Omit<ReactCropProps, 'onChange' | 'onComplete' | 'children'>;
  handleChange: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => void;
  handleComplete: (
    pixelCrop: PixelCrop,
    percentCrop: PercentCrop
  ) => Promise<void>;
  onImageLoad: (e: SyntheticEvent<HTMLImageElement>) => void;
  applyCrop: () => Promise<void>;
  resetCrop: () => void;
};

const ImageCropContext = createContext<ImageCropContextType | null>(null);

export const useImageCrop = () => {
  const context = useContext(ImageCropContext);
  if (!context) {
    throw new Error('ImageCrop components must be used within ImageCrop');
  }
  return context;
};

export type ImageCropProps = {
  file: File;
  maxImageSize?: number;
  /** Maksymalna szerokość zapisanego kadru w px (kadr jest zapisywany w pikselach oryginału). */
  maxOutputWidth?: number;
  onCrop?: (croppedImage: string) => void;
  children: ReactNode;
  onChange?: ReactCropProps['onChange'];
  onComplete?: ReactCropProps['onComplete'];
} & Omit<ReactCropProps, 'onChange' | 'onComplete' | 'children'>;

export const ImageCrop = ({
  file,
  maxImageSize = 1024 * 1024 * 5,
  maxOutputWidth = 2560,
  onCrop,
  children,
  onChange,
  onComplete,
  ...reactCropProps
}: ImageCropProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<PercentCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [initialCrop, setInitialCrop] = useState<PercentCrop>();
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener('load', () =>
      setImgSrc(reader.result?.toString() || '')
    );
    reader.readAsDataURL(file);
  }, [file]);

  const onImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
      setNaturalSize({ width: naturalWidth, height: naturalHeight });
      const newCrop = centerAspectCrop(width, height, reactCropProps.aspect);
      setCrop(newCrop);
      setInitialCrop(newCrop);
    },
    [reactCropProps.aspect]
  );

  const handleChange = (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
    setCrop(percentCrop);
    onChange?.(pixelCrop, percentCrop);
  };

  // biome-ignore lint/suspicious/useAwait: "onComplete is async"
  const handleComplete = async (
    pixelCrop: PixelCrop,
    percentCrop: PercentCrop
  ) => {
    setCompletedCrop(pixelCrop);
    onComplete?.(pixelCrop, percentCrop);
  };

  // Procentowy kadr jest ustawiony od razu po wczytaniu obrazka, więc „Kadruj” działa
  // także bez ruszania ramki (completedCrop pojawia się dopiero po interakcji).
  // biome-ignore lint/suspicious/useAwait: "applyCrop is async"
  const applyCrop = async () => {
    if (!(imgRef.current && crop && crop.width > 0 && crop.height > 0)) {
      return;
    }

    const croppedImage = getCroppedImage(
      imgRef.current,
      crop,
      maxOutputWidth,
      maxImageSize,
      file.type
    );

    onCrop?.(croppedImage);
  };

  const cropSourceSize =
    naturalSize && crop ? getCropSourceSize(naturalSize, crop) : null;

  const resetCrop = () => {
    if (initialCrop) {
      setCrop(initialCrop);
      setCompletedCrop(null);
    }
  };

  const contextValue: ImageCropContextType = {
    file,
    maxImageSize,
    cropSourceSize,
    imgSrc,
    crop,
    completedCrop,
    imgRef,
    onCrop,
    reactCropProps,
    handleChange,
    handleComplete,
    onImageLoad,
    applyCrop,
    resetCrop,
  };

  return (
    <ImageCropContext.Provider value={contextValue}>
      {children}
    </ImageCropContext.Provider>
  );
};

export type ImageCropContentProps = {
  style?: CSSProperties;
  className?: string;
};

export const ImageCropContent = ({
  style,
  className,
}: ImageCropContentProps) => {
  const {
    imgSrc,
    crop,
    handleChange,
    handleComplete,
    onImageLoad,
    imgRef,
    reactCropProps,
  } = useImageCrop();

  const shadcnStyle = {
    '--rc-border-color': 'var(--color-border)',
    '--rc-focus-color': 'var(--color-primary)',
  } as CSSProperties;

  return (
    <ReactCrop
      className={cn('max-w-full', className)}
      crop={crop}
      onChange={handleChange}
      onComplete={handleComplete}
      style={{ ...shadcnStyle, ...style }}
      {...reactCropProps}
    >
      {imgSrc && (
        <img
          alt="crop"
          className="max-w-full h-auto"
          onLoad={onImageLoad}
          ref={imgRef}
          src={imgSrc}
          style={{ display: 'block' }}
        />
      )}
    </ReactCrop>
  );
};

export type ImageCropApplyProps = ComponentProps<'button'> & {
  asChild?: boolean;
};

export const ImageCropApply = ({
  asChild = false,
  children,
  onClick,
  ...props
}: ImageCropApplyProps) => {
  const { applyCrop } = useImageCrop();

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    await applyCrop();
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot.Root onClick={handleClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <Button onClick={handleClick} size="icon" variant="ghost" {...props}>
      {children ?? <CropIcon className="size-4" />}
    </Button>
  );
};

export type ImageCropResetProps = ComponentProps<'button'> & {
  asChild?: boolean;
};

export const ImageCropReset = ({
  asChild = false,
  children,
  onClick,
  ...props
}: ImageCropResetProps) => {
  const { resetCrop } = useImageCrop();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    resetCrop();
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot.Root onClick={handleClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <Button onClick={handleClick} size="icon" variant="ghost" {...props}>
      {children ?? <RotateCcwIcon className="size-4" />}
    </Button>
  );
};

// Keep the original Cropper component for backward compatibility
export type CropperProps = Omit<ReactCropProps, 'onChange'> & {
  file: File;
  maxImageSize?: number;
  onCrop?: (croppedImage: string) => void;
  onChange?: ReactCropProps['onChange'];
};

export const Cropper = ({
  onChange,
  onComplete,
  onCrop,
  style,
  className,
  file,
  maxImageSize,
  ...props
}: CropperProps) => (
  <ImageCrop
    file={file}
    maxImageSize={maxImageSize}
    onChange={onChange}
    onComplete={onComplete}
    onCrop={onCrop}
    {...props}
  >
    <ImageCropContent className={className} style={style} />
  </ImageCrop>
);

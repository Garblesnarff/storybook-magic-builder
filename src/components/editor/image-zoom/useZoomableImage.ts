import { useState, useCallback, useRef, useEffect } from 'react';
import { useTransform, useMotionValue, useAnimation } from 'framer-motion';
import { useImageFit } from './hooks/useImageFit';
import { useSettingsSync } from './hooks/useSettingsSync';
import { ImageSettings } from '@/types/book';

interface UseZoomableImageProps {
  src: string;
  initialSettings?: ImageSettings;
  onSettingsChange?: (settings: ImageSettings) => void;
  minScale?: number;
  maxScale?: number;
  containerRef: React.RefObject<HTMLElement>;
  shouldCenterOnLoad?: boolean;
}

export function useZoomableImage({
  src,
  initialSettings,
  onSettingsChange,
  minScale = 0.1,
  maxScale = 10,
  containerRef,
  shouldCenterOnLoad = true
}: UseZoomableImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isInteractionReady, setIsInteractionReady] = useState(false);

  const scale = useMotionValue(initialSettings?.scale || 1);
  const x = useMotionValue(initialSettings?.position?.x || 0);
  const y = useMotionValue(initialSettings?.position?.y || 0);

  const controls = useAnimation();

  const originX = useTransform(x, [0, 1], [0.5, 0]);
  const originY = useTransform(y, [0, 1], [0.5, 0]);

  const isPanning = useRef(false);
  const initialPanPosition = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(scale.get());

  const { fitMethod, setFitMethod, fitMethodRef, toggleFitMethod, fitImageToContainer } =
    useImageFit(initialSettings, onSettingsChange);

  const { saveSettings } = useSettingsSync(
    scale.get(),
    { x: x.get(), y: y.get() },
    fitMethod,
    imageLoaded,
    isInteractionReady,
    initialSettings,
    onSettingsChange
  );

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    const { naturalWidth, naturalHeight } = img;

    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
  }, []);

  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setContainerDimensions({ width: clientWidth, height: clientHeight });
    }
  }, [containerRef]);

  useEffect(() => {
    updateContainerDimensions();
    window.addEventListener('resize', updateContainerDimensions);

    return () => {
      window.removeEventListener('resize', updateContainerDimensions);
    };
  }, [updateContainerDimensions]);

  useEffect(() => {
    if (imageLoaded && containerDimensions.width && containerDimensions.height && shouldCenterOnLoad) {
      fitImageToContainer(
        imageLoaded,
        containerDimensions,
        imageDimensions,
        setIsInteractionReady,
        (newScale) => {
          scale.set(newScale);
          scaleRef.current = newScale;
        },
        (newPosition) => {
          x.set(newPosition.x);
          y.set(newPosition.y);
        },
        scaleRef
      );
      setIsInteractionReady(true);
    }
  }, [imageLoaded, containerDimensions, imageDimensions, fitImageToContainer, scale, x, y, shouldCenterOnLoad]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isInteractionReady) return;

      const delta = event.deltaY * -0.001;
      let newScale = scaleRef.current + delta;

      newScale = Math.max(minScale, Math.min(newScale, maxScale));

      const rect = containerRef.current!.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width;
      const offsetY = (event.clientY - rect.top) / rect.height;

      const deltaX = (offsetX - 0.5) * rect.width * (newScale - scaleRef.current);
      const deltaY = (offsetY - 0.5) * rect.height * (newScale - scaleRef.current);

      scale.set(newScale);
      x.set(x.get() + deltaX);
      y.set(y.get() + deltaY);
      scaleRef.current = newScale;

      saveSettings();
    },
    [scale, x, y, minScale, maxScale, containerRef, saveSettings, isInteractionReady]
  );

  const handlePanStart = useCallback(() => {
    if (!isInteractionReady) return;
    isPanning.current = true;
    initialPanPosition.current = { x: x.get(), y: y.get() };
  }, [x, y, isInteractionReady]);

  const handlePan = useCallback(
    (event: any, info: any) => {
      if (!isInteractionReady) return;
      event.preventDefault();
      event.stopPropagation();

      if (isPanning.current) {
        x.set(initialPanPosition.current.x + info.delta.x);
        y.set(initialPanPosition.current.y + info.delta.y);
        saveSettings();
      }
    },
    [x, y, saveSettings, isInteractionReady]
  );

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleChangeFitMethod = useCallback(
    (newFitMethod: 'contain' | 'cover') => {
      if (newFitMethod === 'contain' || newFitMethod === 'cover') {
        setFitMethod(newFitMethod);
      }
    },
    [setFitMethod]
  );

  useEffect(() => {
    scale.onChange((newScale) => {
      scaleRef.current = newScale;
      saveSettings();
    });
    x.onChange(saveSettings);
    y.onChange(saveSettings);
  }, [scale, x, y, saveSettings]);

  return {
    scale,
    x,
    y,
    originX,
    originY,
    isPanning: isPanning.current,
    controls,
    handleImageLoad,
    handleWheel,
    handlePanStart,
    handlePan,
    handlePanEnd,
    toggleFitMethod,
    fitMethod,
    handleChangeFitMethod,
    imageLoaded,
    containerDimensions,
    imageDimensions,
    isInteractionReady
  };
}

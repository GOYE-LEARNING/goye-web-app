// components/ImageSlider.tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import Image, { StaticImageData } from 'next/image';

// Import styles
import 'swiper/css';
import 'swiper/css/pagination';

interface ImageSliderProps {
  images: (string | StaticImageData)[]; // Accept both string URLs and imported images
}

export const ImageSlider = ({ images }: ImageSliderProps) => {
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      pagination={{ 
        clickable: true,
        dynamicBullets: true
      }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: true,
      }}
      touchRatio={1.2}
      resistance={true}
      resistanceRatio={0.85}
      navigation={false}
      loop={true}
      speed={400}
      simulateTouch={true}
      grabCursor={true}
      touchStartPreventDefault={false}
      className="my-swiper w-full h-[400px]" // Add dimensions
    >
      {images.map((image: string | StaticImageData, index: number) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full flex justify-center items-center gap-5">
            <Image 
              src={image} 
              alt={`Slide ${index + 1}`}
              fill // Use fill instead of fixed dimensions
      
              style={{ 
                objectFit: 'cover',
                pointerEvents: 'none',
                borderRadius: 10,
              }}
              priority={index === 0} // Load first image quickly
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ImageSlider;
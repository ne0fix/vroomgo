"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VeiculoCardCarousel } from "./VeiculoCardCarousel";
import { CarroCategoria, CATEGORIAS_CARROS } from "@/data/carros";

interface CarroCarrousselProps {
  carros?: CarroCategoria[];
  autoPlay?: boolean;
}

export function CarroCarroussel({ carros = CATEGORIAS_CARROS, autoPlay = true }: CarroCarrousselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1200) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(carros.length / itemsPerView));
    }, 5000);

    return () => clearInterval(timer);
  }, [autoPlay, carros.length, itemsPerView]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(carros.length / itemsPerView)) % Math.ceil(carros.length / itemsPerView));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(carros.length / itemsPerView));
  };

  const totalPages = Math.ceil(carros.length / itemsPerView);
  const visibleCarros = carros.slice(currentIndex * itemsPerView, (currentIndex + 1) * itemsPerView);

  return (
    <div className="w-full">
      {/* Carroussel Container */}
      <div className="relative">
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${itemsPerView}, 1fr)` }}>
          {visibleCarros.map((carro) => (
            <VeiculoCardCarousel key={carro.id} veiculo={carro} />
          ))}
        </div>

        {/* Navigation Arrows */}
        {carros.length > itemsPerView && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-[#00d084] text-white rounded-full p-3 hover:bg-[#00c070] transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-[#00d084] text-white rounded-full p-3 hover:bg-[#00c070] transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "bg-[#00d084] w-8" : "bg-gray-300 w-2"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

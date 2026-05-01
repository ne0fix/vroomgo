"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { CarroCategoria } from "@/data/carros";

interface VeiculoCardCarouselProps {
  veiculo: CarroCategoria;
}

export function VeiculoCardCarousel({ veiculo }: VeiculoCardCarouselProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-56 bg-gray-200 overflow-hidden">
        <Image
          src={veiculo.imagem}
          alt={veiculo.nome}
          fill
          className="object-cover hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 500px"
        />
        {/* Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold ${veiculo.id === "premium" ? "bg-yellow-500" : "bg-[#00d084]"}`}>
          Destaque
        </div>
        {/* Wishlist Button */}
        <button className="absolute top-4 left-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-900">{veiculo.nome}</h3>
          <p className="text-sm text-gray-600">{veiculo.descricao}</p>
        </div>

        {/* Características */}
        <div className="my-3 flex flex-wrap gap-2">
          {veiculo.caracteristicas.map((cara, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {cara}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-600 ml-1">(128 avaliações)</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-gray-200">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">
              R$ {veiculo.precoDiaria.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-sm text-gray-600">/dia</span>
          </div>

          <Link
            href={`/veiculos/${veiculo.id}`}
            className="w-full bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors text-center text-sm"
          >
            Conhecer Mais
          </Link>
        </div>
      </div>
    </div>
  );
}

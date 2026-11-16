import React from "react";

export default function CreatureCard({ criatura, onSelect, esActiva }) {
  const porcentajeHp = (criatura.hpActual / criatura.hpMax) * 100;

  return (
    <div
      onClick={onSelect}
      className={`card bg-base-200 shadow-md p-4 cursor-pointer transition-all border-2 ${
        esActiva
          ? "border-primary shadow-primary/30"
          : "border-transparent hover:border-base-content/20"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg">{criatura.nombre}</span>
        <span className="badge badge-sm badge-outline">
          Nv. {criatura.nivel}
        </span>
      </div>

      <div className="text-xs opacity-70 mb-2">Tipo: {criatura.tipo}</div>

      {/* Barra de Vida (HP) */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span>HP</span>
          <span>
            {criatura.hpActual} / {criatura.hpMax}
          </span>
        </div>
        <progress
          className="progress progress-success w-full"
          value={porcentajeHp}
          max="100"
        ></progress>
      </div>
    </div>
  );
}

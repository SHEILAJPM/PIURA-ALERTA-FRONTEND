import React from "react";

function Header() {
    return (
        <header className="bg-[#1976A3] text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                            <span className="text-[#1976A3] font-bold text-lg">
                                <img
                                    src="/images/escudo-piura.png"
                                    alt="Escudo de Piura"
                                    className="w-10 h-10 object-contain"
                                />
                            </span>
                        </div>

                        <div>
                            <h1 className="text-xl font-bold">
                                Río Piura Alerta
                            </h1>

                            <p className="text-sm text-blue-100">
                                Sistema de monitoreo y prevención
                            </p>
                        </div>

                    </div>

                    {/* Navegación */}
                    <nav className="hidden md:flex items-center gap-6">

                        <a
                            href="#inicio"
                            className="hover:text-[#F2C94C] transition"
                        >
                            Inicio
                        </a>

                        <a
                            href="#mapa"
                            className="hover:text-[#F2C94C] transition"
                        >
                            Mapa
                        </a>

                        <a
                            href="#alertas"
                            className="hover:text-[#F2C94C] transition"
                        >
                            Alertas
                        </a>

                        <a
                            href="#recomendaciones"
                            className="hover:text-[#F2C94C] transition"
                        >
                            Recomendaciones
                        </a>

                    </nav>

                </div>
            </div>
        </header>
    );
}

export default Header;
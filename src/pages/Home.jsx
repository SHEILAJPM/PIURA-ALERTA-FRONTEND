import React from "react";

import Header from "../components/Header";
import RiverStatus from "../components/RiverStatus";
import KpiCard from "../components/KpiCard";
import AlertCard from "../components/AlertCard";

function Home() {
    return (
        <div className="min-h-screen bg-[#F5F7F8]">

            <Header />

            <main id="inicio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Bienvenida */}
                <section className="mb-8">

                    <p className="text-[#1976A3] font-semibold text-sm uppercase tracking-wide">
                        Sistema de prevención
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#263238] mt-2">
                        Monitoreo del río Piura
                    </h2>

                    <p className="text-gray-600 mt-3 max-w-2xl">
                        Consulta de manera sencilla el estado del río,
                        los niveles registrados y las posibles alertas
                        durante periodos de lluvia.
                    </p>

                </section>

                {/* Estado principal */}
                <RiverStatus />

                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                    <KpiCard
                        title="Nivel del río"
                        value="1.25 m"
                        description="Registro actual"
                        icon="🌊"
                    />

                    <KpiCard
                        title="Tendencia"
                        value="Estable"
                        description="Últimas mediciones"
                        icon="↔"
                    />

                    <KpiCard
                        title="Puntos activos"
                        value="3"
                        description="Puntos monitoreados"
                        icon="📍"
                    />

                    <KpiCard
                        title="Actualización"
                        value="10:35"
                        description="Último registro"
                        icon="🕐"
                    />

                </section>

                {/* Alertas */}
                <section className="mt-8">

                    <div className="flex items-center justify-between mb-4">

                        <div>
                            <h2 className="text-xl font-bold text-[#263238]">
                                Estado de alertas
                            </h2>

                            <p className="text-sm text-gray-500">
                                Información importante para la población
                            </p>
                        </div>

                    </div>

                    <AlertCard />

                </section>

                {/* Mapa */}
                <section
                    id="mapa"
                    className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >

                    <h2 className="text-xl font-bold text-[#263238]">
                        Mapa del río Piura
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Aquí se mostrará posteriormente el mapa
                        interactivo y los puntos de monitoreo.
                    </p>

                    <div className="mt-5 h-72 rounded-xl bg-[#E3F2FD] flex items-center justify-center">

                        <div className="text-center">

                            <div className="text-4xl mb-3">
                                🗺️
                            </div>

                            <p className="font-semibold text-[#1976A3]">
                                Mapa interactivo
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Próximamente con Leaflet.js
                            </p>

                        </div>

                    </div>

                </section>

                {/* Recomendaciones */}
                <section
                    id="recomendaciones"
                    className="mt-8 mb-10 bg-[#FFF9E6] rounded-2xl p-6 border border-[#F2C94C]"
                >

                    <h2 className="text-xl font-bold text-[#263238]">
                        ⚠️ Recomendaciones ante lluvias
                    </h2>

                    <ul className="mt-4 space-y-3 text-gray-700">

                        <li>• Mantente informado sobre el estado del río.</li>

                        <li>• Evita acercarte al cauce durante lluvias intensas.</li>

                        <li>• Identifica las zonas seguras de tu sector.</li>

                        <li>• Sigue las indicaciones de las autoridades.</li>

                    </ul>

                </section>

            </main>

            {/* Footer */}
            <footer className="bg-[#263238] text-white py-6">

                <div className="max-w-7xl mx-auto px-4 text-center">

                    <p className="font-semibold">
                        Río Piura Alerta
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                        Sistema de monitoreo y prevención ante peligros por lluvias
                    </p>

                </div>

            </footer>

        </div>
    );
}

export default Home;
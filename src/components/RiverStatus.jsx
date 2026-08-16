import React from "react";
import StatusBadge from "./StatusBadge";

function RiverStatus() {
    return (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                    <p className="text-sm font-medium text-gray-500">
                        ESTADO ACTUAL DEL RÍO PIURA
                    </p>

                    <h2 className="text-4xl font-bold text-[#263238] mt-2">
                        1.25 m
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Nivel registrado actualmente
                    </p>

                </div>

                <StatusBadge status="normal" />

            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">

                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">

                    <span className="text-gray-500">
                        Última actualización
                    </span>

                    <span className="font-semibold text-[#263238]">
                        Hoy, 10:35 AM
                    </span>

                </div>

            </div>

        </section>
    );
}

export default RiverStatus;
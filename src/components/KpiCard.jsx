import React from "react";

function KpiCard({ title, value, description, icon }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <h3 className="text-2xl font-bold text-[#263238] mt-2">
                        {value}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                        {description}
                    </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-[#E3F2FD] flex items-center justify-center text-[#1976A3] text-xl">
                    {icon}
                </div>

            </div>

        </div>
    );
}

export default KpiCard;
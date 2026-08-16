import React from "react";

function AlertCard() {
    return (
        <div
            id="alertas"
            className="bg-white rounded-2xl border-l-4 border-[#4F8A5B] shadow-sm p-5"
        >

            <div className="flex gap-4">

                <div className="text-2xl">
                    ✓
                </div>

                <div>

                    <h3 className="font-bold text-[#263238]">
                        No existen alertas activas
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                        El sistema no ha detectado actualmente
                        condiciones que representen peligro para
                        la población.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default AlertCard;
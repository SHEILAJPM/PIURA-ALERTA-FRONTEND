import React from "react";

function StatusBadge({ status = "normal" }) {

  const styles = {
    normal: {
      color: "#4F8A5B",
      background: "#E8F5E9",
      text: "Nivel normal",
    },

    precaucion: {
      color: "#F2994A",
      background: "#FFF3E0",
      text: "Precaución",
    },

    alerta: {
      color: "#D64545",
      background: "#FDECEC",
      text: "Alerta",
    },

    peligro: {
      color: "#8B0000",
      background: "#F8D7DA",
      text: "Peligro alto",
    },
  };

  const current = styles[status] || styles.normal;

  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
      style={{
        color: current.color,
        backgroundColor: current.background,
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: current.color,
        }}
      />

      {current.text}
    </span>
  );
}

export default StatusBadge;
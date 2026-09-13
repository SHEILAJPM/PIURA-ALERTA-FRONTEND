import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "../contexto/ThemeContext";

// Mismos hex que --color-primary en index.css: un shader de Three.js no
// puede leer variables CSS, así que se duplican acá a propósito.
const COLOR_PRIMARIO = { light: "#0a2f52", dark: "#4a7ba6" };

// La "nube" 3D: un racimo de esferas superpuestas (el truco clásico para
// dibujar nubes, en 2D o en 3D) en vez de un modelo importado -- no hay
// archivo .glb que mantener, y a este tamaño (un botón flotante) el detalle
// extra no se nota.
const BULTOS = [
  { pos: [0, -0.08, 0], r: 0.42 },
  { pos: [-0.42, -0.15, -0.05], r: 0.3 },
  { pos: [0.42, -0.15, -0.05], r: 0.3 },
  { pos: [-0.2, 0.22, 0.05], r: 0.32 },
  { pos: [0.22, 0.2, 0], r: 0.3 },
];

function Nube() {
  const grupoRef = useRef();
  const { theme } = useTheme();
  const color = COLOR_PRIMARIO[theme] ?? COLOR_PRIMARIO.light;

  // "Que se mueva": un balanceo suave (como si flotara) más un leve giro de
  // lado a lado (como si mirara alrededor), no una vuelta completa -- así la
  // cara sigue viéndose casi siempre de frente.
  useFrame(({ clock }) => {
    if (!grupoRef.current) return;
    const t = clock.getElapsedTime();
    grupoRef.current.position.y = Math.sin(t * 1.6) * 0.08;
    grupoRef.current.rotation.y = Math.sin(t * 0.8) * 0.35;
  });

  return (
    <group ref={grupoRef}>
      {BULTOS.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.r, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
        </mesh>
      ))}

      {/* ojos */}
      {[-0.2, 0.2].map((x) => (
        <group key={x}>
          <mesh position={[x, 0, 0.42]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[x, 0, 0.48]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#0a2f52" />
          </mesh>
        </group>
      ))}

      {/* sonrisa: medio anillo, rotado para que quede como un arco hacia abajo */}
      <mesh position={[0, -0.16, 0.44]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.14, 0.016, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#0a2f52" />
      </mesh>
    </group>
  );
}

function MascotaAsistente3D({ size = 40 }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      // flat: sin tone mapping -- con las unidades de luz "físicamente
      // correctas" que trae Three.js por defecto, esta escena tan chica se
      // veía casi negra a menos de subir las intensidades a números enormes.
      flat
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 3.1], fov: 35 }}
      style={{ width: size, height: size }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} />
      <directionalLight position={[-2, -1, 2]} intensity={0.8} />
      <Nube />
    </Canvas>
  );
}

export default MascotaAsistente3D;

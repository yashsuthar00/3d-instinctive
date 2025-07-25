"use client";

import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
// import { useControls } from "leva";

function Model({ rotation, position }: { rotation: [number, number, number], position: [number, number, number] }) {
  const { scene } = useGLTF('./SmartSight Product Model.glb');
  return <primitive object={scene} rotation={rotation} scale={3.2} position={position} />;
}

export default function ModelCanvas() {
  const steps = [
    {
      rotation: { x: 0.02539816339744827, y: -0.6546018366025517, z: -1.01 },
      position: { px: 0.24, py: 0.12, pz: -0.07 },
      info: (
        <>
          <strong>MandlacX Edge Processor</strong><br />
          <span style={{ fontWeight: 400 }}>
            A multi-domain, first-generation AI-powered device designed for real-time threat detection.
          </span>
        </>
      ),
      align: 'left',
    },
    {
      rotation: { x: 0.3653981633974483, y: -0.46460183660255167, z: -0.09999999999999998 },
      position: { px: 0.16999999999999998, py: 0.07999999999999999, pz: -0.07 },
      info: (
        <>
          <strong>Key Specifications</strong><br />
          <ul style={{ margin: 0, paddingLeft: 18, fontWeight: 400, textAlign: 'left' }}>
            <li>USB 3.0 Support</li>
            <li>16 GB RAM</li>
            <li>A7 Cortex Processor</li>
            <li>Three multi-axis surveillance lenses</li>
          </ul>
        </>
      ),
      align: 'right',
    },
    {
      rotation: { x: 0.14539816339744827, y: -1.8046018366025518, z: -0.42000000000000004 },
      position: { px: 0.62, py: 0.039999999999999994, pz: 0.34 },
      info: (
        <>
          <strong>On-Device Intelligence</strong><br />
          <span style={{ fontWeight: 400 }}>
            Engineered to deliver intelligent surveillance without relying on the cloud, it gives you control, speed, and reliability right where you need it.
          </span>
        </>
      ),
      align: 'right',
    },
  ];

  // Leva controls for manual rotation/position checking (commented out for production)
  /*
  const leva = useControls('Manual', {
    x: { value: steps[0].rotation.x, min: -Math.PI, max: Math.PI, step: 0.01 },
    y: { value: steps[0].rotation.y, min: -Math.PI, max: Math.PI, step: 0.01 },
    z: { value: steps[0].rotation.z, min: -Math.PI, max: Math.PI, step: 0.01 },
    px: { value: steps[0].position.px, min: -2, max: 2, step: 0.01 },
    py: { value: steps[0].position.py, min: -2, max: 2, step: 0.01 },
    pz: { value: steps[0].position.pz, min: -2, max: 2, step: 0.01 },
  });
  */

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const prog = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
      setProgress(prog);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getStepData = (progress: number) => {
    const n = steps.length;
    const seg = 1 / (n - 1);
    let idx = Math.floor(progress / seg);
    if (idx >= n - 1) idx = n - 2;
    const localProg = (progress - idx * seg) / seg;
    const from = steps[idx];
    const to = steps[idx + 1];
    const lerp = (a: number, b: number) => a + (b - a) * localProg;
    return {
      rotation: {
        x: lerp(from.rotation.x, to.rotation.x),
        y: lerp(from.rotation.y, to.rotation.y),
        z: lerp(from.rotation.z, to.rotation.z),
      },
      position: {
        px: lerp(from.position.px, to.position.px),
        py: lerp(from.position.py, to.position.py),
        pz: lerp(from.position.pz, to.position.pz),
      },
      stepIdx: idx,
      nextIdx: idx + 1,
      localProg,
    };
  };
  const interp = getStepData(progress);
  const coords = {
    rotation: interp.rotation,
    position: interp.position,
  };

  // Use leva values for the model if any of them are changed from their initial value
  /*
  const rotKeys = ['x','y','z'] as const;
  const posKeys = ['px','py','pz'] as const;
  const isLevaActive =
    rotKeys.some((key) => leva[key] !== steps[0].rotation[key]) ||
    posKeys.some((key) => leva[key] !== steps[0].position[key]);
  const modelRotation = (isLevaActive ? [leva.x, leva.y, leva.z] : [coords.rotation.x, coords.rotation.y, coords.rotation.z]) as [number, number, number];
  const modelPosition = (isLevaActive ? [leva.px, leva.py, leva.pz] : [coords.position.px, coords.position.py, coords.position.pz]) as [number, number, number];
  */
  // Use scroll-based animation only
  const modelRotation = [coords.rotation.x, coords.rotation.y, coords.rotation.z] as [number, number, number];
  const modelPosition = [coords.position.px, coords.position.py, coords.position.pz] as [number, number, number];

  const infoBoxPositions = {
    left: '28%',
    right: '80%',
    center: '50%',
  } as const;

  const gap = 0.3;
  const infoBoxOpacities = steps.map((step, i) => {
    const n = steps.length;
    const seg = 1 / (n - 1);
    let idx = Math.floor(progress / seg);
    if (idx >= n - 1) idx = n - 2;
    const localProg = (progress - idx * seg) / seg;
    if (i === idx) {
      if (localProg < 1 - gap) {
        return 1 - localProg / (1 - gap);
      } else {
        return 0;
      }
    }
    if (i === idx + 1) {
      if (localProg > gap) {
        return (localProg - gap) / (1 - gap);
      } else {
        return 0;
      }
    }
    return 0;
  });

  return (
    <div style={{ minHeight: '500dvh', width: '100vw', position: 'relative' }}>
      <div style={{ width: '100vw', height: '100vh', position: 'sticky', top: 0, left: 0, overflow: 'hidden' }}>
        <motion.h2
          initial={false}
          animate={{ opacity: 1 - progress, y: 0 }}
          transition={{ duration: 0.3, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '13%',
            left: '27%',
            transform: 'translate(-50%, -100%)',
            fontFamily: 'var(--font-primary, sans-serif)',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '1.5rem',
            lineHeight: '120%',
            letterSpacing: '-2%',
            color: '#FFD600',
            zIndex: 11,
            textAlign: 'center',
            width: '100%',
            maxWidth: '900px',
            pointerEvents: 'none',
          }}
        >
          The Future of On-Site AI Surveillance
        </motion.h2>
        <motion.h1
          initial={false}
          animate={{ opacity: 1 - progress, y: 0 }}
          transition={{ duration: 0.3, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '20%',
            left: '27%',
            transform: 'translate(-50%, -100%)',
            fontFamily: 'var(--font-primary, sans-serif)',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '5rem',
            lineHeight: '120%',
            letterSpacing: '-7%',
            color: '#fff',
            zIndex: 10,
            textShadow: '0 4px 32px rgba(0,0,0,0.35)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '900px',
            pointerEvents: 'none',
          }}
        >
          MandlacX Edge Processor
        </motion.h1>
        <Canvas shadows camera={{ position: [0.5, 0.1, 1], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 7.5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <Environment preset="city" />
          <Model rotation={modelRotation} position={modelPosition} />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} blur={2.5} far={4.5} />
        </Canvas>
        {progress > 0.08 && steps.map((step, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: infoBoxOpacities[i] }}
            transition={{ duration: 0.3, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: infoBoxPositions[step.align as keyof typeof infoBoxPositions],
              transform: 'translate(-50%, -50%)',
              border: '0.1px solid #fff',
              color: '#fff',
              padding: '1.2rem 2rem',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.5)',
              fontSize: '1.1rem',
              zIndex: 20,
              maxWidth: 340,
              textAlign: 'center',
              pointerEvents: infoBoxOpacities[i] > 0.01 ? 'auto' : 'none',
            }}
          >
            {step.info}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

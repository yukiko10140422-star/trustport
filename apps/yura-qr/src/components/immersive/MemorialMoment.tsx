'use client';

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import * as THREE from 'three';

function useParticleCount(): number {
  const [count, setCount] = useState(80); // SSR-safe default
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 4;
    if (isMobile || isLowEnd) {
      setCount(60);
    } else {
      setCount(200);
    }
  }, []);
  return count;
}

function Lanterns({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize particle positions & velocities
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread across a wide area
      positions[i * 3] = (Math.random() - 0.5) * 20;     // x
      positions[i * 3 + 1] = Math.random() * -2;          // y (start below)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;  // z

      // Gentle upward drift
      velocities[i * 3] = (Math.random() - 0.5) * 0.003;  // x drift
      velocities[i * 3 + 1] = 0.005 + Math.random() * 0.008; // y rise
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002; // z drift

      scales[i] = 0.03 + Math.random() * 0.06;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, velocities, scales, phases };
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Update position
      particles.positions[idx] += particles.velocities[idx];
      particles.positions[idx + 1] += particles.velocities[idx + 1];
      particles.positions[idx + 2] += particles.velocities[idx + 2];

      // Gentle sway
      const sway = Math.sin(t * 0.5 + particles.phases[i]) * 0.01;
      particles.positions[idx] += sway;

      // Reset when too high
      if (particles.positions[idx + 1] > 8) {
        particles.positions[idx] = (Math.random() - 0.5) * 20;
        particles.positions[idx + 1] = -2;
        particles.positions[idx + 2] = (Math.random() - 0.5) * 10;
      }

      // Pulse scale
      const pulse = 1 + Math.sin(t * 1.5 + particles.phases[i]) * 0.15;
      const s = particles.scales[i] * pulse;

      dummy.position.set(
        particles.positions[idx],
        particles.positions[idx + 1],
        particles.positions[idx + 2],
      );
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#C4A882"
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function Scene({ particleCount }: { particleCount: number }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <fog attach="fog" args={['#0A0A0A', 5, 20]} />
      <Lanterns count={particleCount} />
    </>
  );
}

export function MemorialMoment() {
  const t = useTranslations('memorial');
  const particleCount = useParticleCount();

  return (
    <section className="relative h-[80vh] md:h-screen overflow-hidden">
      {/* Three.js Canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 2, 8], fov: 60 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <Scene particleCount={particleCount} />
          </Canvas>
        </Suspense>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Text overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
        >
          <div className="w-12 h-[1px] bg-accent/30 mx-auto mb-8" />

          <p className="font-serif text-foreground/40 text-sm md:text-base leading-[2] max-w-md mx-auto mb-8">
            {t('memorialMessage')}
          </p>

          <p className="text-foreground/15 text-[10px] tracking-[0.4em] uppercase">
            {t('inMemory')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

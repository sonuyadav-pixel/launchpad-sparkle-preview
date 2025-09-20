import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Box, Torus, Cone } from '@react-three/drei';
import * as THREE from 'three';

interface Floating3DElementProps {
  type?: 'sphere' | 'box' | 'torus' | 'cone';
  position?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  intensity?: number;
}

const Floating3DElement = ({ 
  type = 'sphere', 
  position = [0, 0, 0], 
  color = '#2196F3', 
  size = 1, 
  speed = 1.5,
  intensity = 0.5 
}: Floating3DElementProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  const renderShape = () => {
    switch (type) {
      case 'box':
        return <Box args={[size, size, size]} />;
      case 'torus':
        return <Torus args={[size, size * 0.4, 16, 100]} />;
      case 'cone':
        return <Cone args={[size, size * 1.5, 8]} />;
      default:
        return <Sphere args={[size, 32, 32]} />;
    }
  };

  return (
    <Float speed={speed} rotationIntensity={intensity} floatIntensity={intensity}>
      <mesh 
        ref={meshRef} 
        position={position}
        castShadow
        receiveShadow
      >
        {renderShape()}
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    </Float>
  );
};

const ParticleField = ({ count = 50, color = '#2196F3' }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const particles = new Array(count).fill(null).map(() => ({
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    ] as [number, number, number],
  }));

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.flatMap(p => p.position))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.6} />
    </points>
  );
};

interface Section3DBackgroundProps {
  type?: 'work' | 'features' | 'testimonials' | 'cta';
  className?: string;
  children?: React.ReactNode;
}

const Section3DBackground = ({ type = 'work', className = "", children }: Section3DBackgroundProps) => {
  const getElements = () => {
    switch (type) {
      case 'work':
        return (
          <>
            <Floating3DElement type="sphere" position={[-3, 2, -2]} color="#2196F3" size={0.8} />
            <Floating3DElement type="box" position={[3, -1, -3]} color="#ffffff" size={0.6} speed={2} />
            <Floating3DElement type="torus" position={[0, 3, -4]} color="#2196F3" size={0.5} speed={1.2} />
            <ParticleField count={30} color="#2196F3" />
          </>
        );
      case 'features':
        return (
          <>
            <Floating3DElement type="cone" position={[-2, 2, -2]} color="#2196F3" size={0.7} />
            <Floating3DElement type="sphere" position={[2, -1, -3]} color="#ffffff" size={0.5} speed={1.8} />
            <Floating3DElement type="box" position={[-1, 3, -4]} color="#2196F3" size={0.4} speed={2.2} />
            <ParticleField count={40} color="#ffffff" />
          </>
        );
      case 'testimonials':
        return (
          <>
            <Floating3DElement type="torus" position={[-2.5, 1, -2]} color="#2196F3" size={0.6} />
            <Floating3DElement type="cone" position={[2.5, -2, -3]} color="#ffffff" size={0.5} speed={1.5} />
            <Floating3DElement type="sphere" position={[0, 2.5, -4]} color="#2196F3" size={0.4} speed={2.5} />
            <ParticleField count={35} color="#2196F3" />
          </>
        );
      case 'cta':
        return (
          <>
            <Floating3DElement type="box" position={[-2, 2, -2]} color="#ffffff" size={0.8} />
            <Floating3DElement type="torus" position={[2, -1, -3]} color="#ffffff" size={0.6} speed={1.7} />
            <Floating3DElement type="sphere" position={[0, 3, -4]} color="#ffffff" size={0.5} speed={2.1} />
            <ParticleField count={45} color="#ffffff" />
          </>
        );
      default:
        return <ParticleField count={30} color="#2196F3" />;
    }
  };

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        {getElements()}
      </Canvas>
      {children}
    </div>
  );
};

export default Section3DBackground;
export { Floating3DElement, ParticleField };
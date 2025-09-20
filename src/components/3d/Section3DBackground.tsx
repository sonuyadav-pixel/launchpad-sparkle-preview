import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple floating sphere component
const FloatingSphere = ({ position, color, size }: { position: [number, number, number], color: string, size: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
};

// Simple particle field
const SimpleParticles = ({ count = 30 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Create particle positions
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#2196F3" transparent opacity={0.6} />
    </points>
  );
};

interface Section3DBackgroundProps {
  type?: 'work' | 'features' | 'testimonials' | 'cta';
  className?: string;
  children?: React.ReactNode;
}

const Section3DBackground = ({ type = 'work', className = "", children }: Section3DBackgroundProps) => {
  const getSpheres = () => {
    switch (type) {
      case 'work':
        return [
          <FloatingSphere key="1" position={[-3, 2, -2]} color="#2196F3" size={0.8} />,
          <FloatingSphere key="2" position={[3, -1, -3]} color="#ffffff" size={0.6} />,
          <FloatingSphere key="3" position={[0, 3, -4]} color="#2196F3" size={0.5} />
        ];
      case 'features':
        return [
          <FloatingSphere key="1" position={[-2, 2, -2]} color="#2196F3" size={0.7} />,
          <FloatingSphere key="2" position={[2, -1, -3]} color="#ffffff" size={0.5} />,
          <FloatingSphere key="3" position={[-1, 3, -4]} color="#2196F3" size={0.4} />
        ];
      case 'testimonials':
        return [
          <FloatingSphere key="1" position={[-2.5, 1, -2]} color="#2196F3" size={0.6} />,
          <FloatingSphere key="2" position={[2.5, -2, -3]} color="#ffffff" size={0.5} />,
          <FloatingSphere key="3" position={[0, 2.5, -4]} color="#2196F3" size={0.4} />
        ];
      case 'cta':
        return [
          <FloatingSphere key="1" position={[-2, 2, -2]} color="#ffffff" size={0.8} />,
          <FloatingSphere key="2" position={[2, -1, -3]} color="#ffffff" size={0.6} />,
          <FloatingSphere key="3" position={[0, 3, -4]} color="#ffffff" size={0.5} />
        ];
      default:
        return [<FloatingSphere key="1" position={[0, 0, -2]} color="#2196F3" size={0.5} />];
    }
  };

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        {getSpheres()}
        <SimpleParticles count={30} />
      </Canvas>
      {children}
    </div>
  );
};

export default Section3DBackground;
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Floating AI Brain Component
const AIBrain = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#2196F3" wireframe transparent opacity={0.6} />
      </mesh>
    </Float>
  );
};

// Floating Data Particles
const DataParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const particles = new Array(100).fill(null).map(() => ({
    position: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
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
      <pointsMaterial size={0.1} color="#2196F3" transparent opacity={0.6} />
    </points>
  );
};

// Neural Network Connections
const NeuralNetwork = () => {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const connections = [
    { start: [-3, 2, 0], end: [3, 1, 0] },
    { start: [-2, -1, 0], end: [2, 2, 0] },
    { start: [-1, 0, 0], end: [1, -1, 0] },
    { start: [0, 2, 0], end: [0, -2, 0] },
  ];

  return (
    <group ref={linesRef}>
      {connections.map((connection, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...connection.start, ...connection.end])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#2196F3" transparent opacity={0.4} />
        </line>
      ))}
    </group>
  );
};

// Main 3D Scene Component
const AI3DScene = () => {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#2196F3" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
        
        {/* AI Brain Elements */}
        <AIBrain position={[-4, 2, -2]} />
        <AIBrain position={[4, -1, -3]} />
        <AIBrain position={[0, 3, -4]} />
        
        {/* Neural Network */}
        <NeuralNetwork />
        
        {/* Data Particles */}
        <DataParticles />
        
        {/* Floating Geometric Text Elements */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={[-2, -3, 0]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[1.5, 0.3, 0.2]} />
            <meshStandardMaterial color="#2196F3" />
          </mesh>
        </Float>
        
        <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh position={[2, -2, 1]} rotation={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </Float>
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default AI3DScene;
import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Preview component for each puzzle type
const PuzzlePreview = ({ type, color, isHovered, isActive, progress }) => {
  const scale = isHovered ? 1.1 : 1;
  const yOffset = isHovered ? 0.1 : 0;
  const rotation = useRef(0);
  
  useFrame(() => {
    rotation.current += 0.01;
  });
  
  switch (type) {
    case 'shape':
      return (
        <mesh position={[0, yOffset, 0]} scale={scale} rotation={[0, rotation.current, 0]}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
        </mesh>
      );
    case 'logic':
      return (
        <group position={[0, yOffset, 0]} scale={scale} rotation={[0, rotation.current, 0]}>
          <mesh position={[0, 0, 0]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI/4, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, -Math.PI/4, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    case 'memory':
      return (
        <group position={[0, yOffset, 0]} scale={scale} rotation={[0, rotation.current, 0]}>
          <mesh position={[-0.25, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.6, 0.05]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>
          <mesh position={[0.25, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.6, 0.05]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh position={[0, yOffset, 0]} scale={scale} rotation={[0, rotation.current, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
        </mesh>
      );
  }
};

// Pedestal with hovering puzzle
const PuzzleStation = ({ position, rotation, title, puzzleType, color, onActivate, isActive, progress = 0, facts = [] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const pedestalRef = useRef();
  const shapeRef = useRef();
  
  // Add a spotlight to illuminate the station
  useEffect(() => {
    const spotlight = new THREE.SpotLight("#ffffff", 1.5);
    spotlight.position.set(position[0], position[1] + 3, position[2]);
    spotlight.target.position.set(position[0], position[1], position[2]);
    spotlight.angle = 0.5;
    spotlight.penumbra = 0.5;
    spotlight.distance = 6;
    
    if (pedestalRef.current) {
      pedestalRef.current.add(spotlight);
      pedestalRef.current.add(spotlight.target);
    }
    
    return () => {
      if (pedestalRef.current) {
        pedestalRef.current.remove(spotlight);
        pedestalRef.current.remove(spotlight.target);
      }
    };
  }, [position]);
  
  // Floating animation with brighter materials
  useFrame(({ clock }) => {
    if (shapeRef.current && !isActive) {
      shapeRef.current.position.y = 0.3 + Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
    }
  });
  
  // Handle click
  const handleClick = () => {
    if (!isActive && onActivate) {
      onActivate(puzzleType, facts);
    }
  };
  
  // Calculate text rotation based on pedestal position
  const getTextRotation = () => {
    // Rotate text 90 degrees clockwise (PI/2) to face the same direction as welcome text
    return [0, Math.PI/2, 0];
  };
  
  // Add instruction text to puzzle stations
  const getHoverText = (puzzleType) => {
    switch(puzzleType) {
      case 'shape':
        return "Click to solve the Shape Puzzle";
      case 'logic':
        return "Click to solve the Logic Puzzle";
      case 'memory':
        return "Click to solve the Memory Puzzle";
      default:
        return "Click to interact";
    }
  };
  
  return (
    <group 
      ref={pedestalRef}
      position={position} 
      rotation={rotation}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Base/Pedestal - brighter material */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.8, 1, 16]} />
        <meshStandardMaterial 
          color="#4a4a4a" 
          metalness={0.5} 
          roughness={0.2}
          emissive="#2a2a2a"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Add glow effect around the pedestal */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.1, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.15} 
        />
      </mesh>
      
      {/* Puzzle Preview with enhanced materials */}
      <group ref={shapeRef} position={[0, 0.3, 0]}>
        <PuzzlePreview 
          type={puzzleType} 
          color={color} 
          isHovered={isHovered} 
          isActive={isActive}
          progress={progress}
        />
        
        {/* Add subtle glow around the preview */}
        <pointLight 
          color={color} 
          intensity={0.8} 
          distance={2}
        />
      </group>
      
      {/* Title text with fixed rotation */}
      <group rotation={getTextRotation()}>
        <Text
          position={[0, 1.2, 0]}
          color="#ffffff"
          fontSize={0.25}
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          textAlign="center"
          outlineWidth={0.04}
          outlineColor="#000000"
          outlineOpacity={0.8}
        >
          {title}
        </Text>
      </group>
      
      {/* Instruction text - only show when hovered */}
      {isHovered && (
        <group position={[0, -1.2, 0]} rotation={getTextRotation()}>
          {/* Background for better text visibility */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[2.2, 0.5]} />
            <meshBasicMaterial color="#000000" opacity={0.85} transparent />
          </mesh>
          
          <Text
            position={[0, 0, 0]}
            color="#ffffff"
            fontSize={0.18}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            outlineOpacity={0.9}
          >
            {getHoverText(puzzleType)}
          </Text>
        </group>
      )}
      
      {/* For skill puzzle, add clear instructions */}
      {isHovered && puzzleType === 'skill' && (
        <group position={[0, 2, 1]}>
          <Text
            position={[0, 0, 0]}
            color="white"
            fontSize={0.2}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            Drag the 3D shapes to their matching positions
          </Text>
        </group>
      )}
    </group>
  );
};

export default PuzzleStation; 
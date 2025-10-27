import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { a, useSpring } from '@react-spring/three';

// Facts to reveal progressively
const progressFacts = [
  "I'm a creative developer specializing in immersive 3D web experiences",
  "I have expertise in React, Three.js, WebGL, and interactive 3D animations",
  "I've developed both frontend and backend systems for various applications",
  "I enjoy solving complex problems using modern web technologies",
  "I'm proficient in JavaScript/TypeScript, CSS, and responsive web design"
];

// Simple draggable puzzle piece
const PuzzlePiece = ({ index, position, color, onDragEnd, isPlaced, shape, targetPosition }) => {
  const [isDragging, setIsDragging] = useState(false);
  const currentPosition = useRef({ x: position[0], y: position[1], z: position[2] });
  const meshRef = useRef();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const raycaster = new THREE.Raycaster();
  
  // Drag animation
  const { scale, glow } = useSpring({
    scale: isDragging ? 1.2 : isPlaced ? 1.0 : 1.1,
    glow: isDragging ? 0.5 : isPlaced ? 0.2 : 0.3
  });
  
  // Handle drag start
  const handlePointerDown = (e) => {
    if (isPlaced) return; // Don't allow dragging if already placed
    
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    
    // Notify parent that we started interacting (helps maintain puzzle type)
    if (e.object.userData && e.object.userData.onPieceInteraction) {
      e.object.userData.onPieceInteraction("start-drag");
    }
  };
  
  // Handle drag end
  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = 'auto';
      
      // Notify parent about drag end with current position
      onDragEnd(index, currentPosition.current, targetPosition);
    }
  };
  
  // Shape geometry based on type
  const renderShape = () => {
    switch(shape) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.6, 16, 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 16]} />;
      case 'cone':
        return <coneGeometry args={[0.6, 1, 16]} />;
      case 'torus':
        return <torusGeometry args={[0.4, 0.2, 16, 16]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  return (
    <a.mesh
      ref={meshRef}
      position={isPlaced ? targetPosition : position}
      scale={scale}
      onPointerOver={() => !isDragging && !isPlaced && setIsDragging(true)}
      onPointerOut={() => setIsDragging(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      castShadow
      userData={{ onPieceInteraction: handlePointerDown }}
    >
      {renderShape()}
      <meshStandardMaterial 
        color={color} 
        metalness={0.4} 
        roughness={0.5}
        emissive={color}
        emissiveIntensity={isDragging ? 0.8 : isPlaced ? 0.5 : 0.3} 
      />
    </a.mesh>
  );
};

// Target position marker
const TargetMarker = ({ position, shape, isPlaced }) => {
  const renderShape = () => {
    switch(shape) {
      case 'box':
        return <boxGeometry args={[1.1, 1.1, 1.1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.65, 16, 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.55, 0.55, 1.1, 16]} />;
      case 'cone':
        return <coneGeometry args={[0.65, 1.1, 16]} />;
      case 'torus':
        return <torusGeometry args={[0.45, 0.22, 16, 16]} />;
      default:
        return <boxGeometry args={[1.1, 1.1, 1.1]} />;
    }
  };
  
  return (
    <mesh position={position}>
      {renderShape()}
      <meshStandardMaterial 
        color={isPlaced ? "#4CAF50" : "#FFFFFF"} 
        wireframe={!isPlaced}
        opacity={0.5}
        transparent
        emissive={isPlaced ? "#4CAF50" : "#FFFFFF"}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

// Simple celebration particles
const Particles = ({ position, color }) => {
  const particlesRef = useRef();
  const [started, setStarted] = useState(false);
  const particleCount = 20;
  
  // Create particle positions and velocities once
  const particleData = useRef(null);
  
  useEffect(() => {
    // Initialize particle data only once
    if (!particleData.current) {
      const positions = new Float32Array(particleCount * 3);
      const velocities = [];
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // All particles start at the same position
        positions[i3] = position[0];
        positions[i3 + 1] = position[1];
        positions[i3 + 2] = position[2];
        
        // Random velocity in all directions
        velocities.push({
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05 + 0.02,
          z: (Math.random() - 0.5) * 0.05
        });
      }
      
      particleData.current = {
        positions,
        velocities,
        time: 0
      };
    }
    
    // Reset positions when position prop changes
    if (particleData.current && position) {
      const positions = particleData.current.positions;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = position[0];
        positions[i3 + 1] = position[1];
        positions[i3 + 2] = position[2];
      }
      particleData.current.time = 0;
      setStarted(true);
    }
  }, [position, particleCount]);
  
  useFrame(() => {
    if (!particlesRef.current || !particleData.current || !started) return;
    
    const { positions, velocities } = particleData.current;
    particleData.current.time += 0.01;
    
    // Max 2 second lifetime
    if (particleData.current.time > 2) {
      setStarted(false);
      return;
    }
    
    // Update particle positions based on velocities
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i].x;
      positions[i3 + 1] += velocities[i].y;
      positions[i3 + 2] += velocities[i].z;
    }
    
    // Update the geometry
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return started ? (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particleData.current?.positions || new Float32Array(particleCount * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color={color} />
    </points>
  ) : null;
};

const PuzzleGame = ({ onProgress, puzzleColor = '#1E88E5', setErrorMsg }) => {
  const { camera } = useThree();
  const [pieces, setPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState([]);
  const [progress, setProgress] = useState(0);
  const [recentlyPlaced, setRecentlyPlaced] = useState(null);
  
  // Define shapes and target positions
  const shapes = ['box', 'sphere', 'cylinder', 'cone', 'torus'];
  const targetPositions = [
    [-2, 1, 0],
    [-1, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
    [2, 1, 0]
  ];
  const initialPositions = [
    [-2, -1, 0],
    [-1, -1, 0],
    [0, -1, 0],
    [1, -1, 0],
    [2, -1, 0]
  ];
  const colors = [
    '#FF5252', // Red
    '#FFEB3B', // Yellow
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0'  // Purple
  ];
  
  // Initialize pieces
  useEffect(() => {
    const newPieces = shapes.map((shape, i) => ({
      id: i,
      shape,
      position: initialPositions[i],
      targetPosition: targetPositions[i],
      color: colors[i],
      isPlaced: false
    }));
    setPieces(newPieces);
    
    // Position camera to see the puzzle
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Handle when a piece is dropped
  const handleDragEnd = (id, position, targetPosition) => {
    // Calculate distance to target
    const distance = Math.sqrt(
      Math.pow(position.x - targetPosition[0], 2) +
      Math.pow(position.y - targetPosition[1], 2)
    );
    
    // If close enough to target, snap to position
    if (distance < 1.0) {
      // Mark piece as placed
      const newPieces = [...pieces];
      newPieces[id].isPlaced = true;
      setPieces(newPieces);
      
      // Add to placed pieces if not already there
      if (!placedPieces.includes(id)) {
        const newPlacedPieces = [...placedPieces, id];
        setPlacedPieces(newPlacedPieces);
        setRecentlyPlaced(id);
        
        // Calculate progress
        const progressPercent = Math.round((newPlacedPieces.length / pieces.length) * 100);
        setProgress(progressPercent);
        
        // Update facts
        if (onProgress) {
          const factsToShow = progressFacts.slice(0, newPlacedPieces.length);
          onProgress(factsToShow, "shape");
        }
        
        // Clear celebration after a delay
        setTimeout(() => {
          setRecentlyPlaced(null);
        }, 2000);
      }
    }
  };
  
  // Calculate and report progress
  useEffect(() => {
    const correctPieces = placedPieces.filter(p => p.isCorrect).length;
    const progressPercent = Math.floor((correctPieces / pieces.length) * 100);
    setProgress(progressPercent);
    
    // Determine how many facts to show based on progress
    let factsToShow = [];
    if (progressPercent >= 20) factsToShow.push(progressFacts[0]);
    if (progressPercent >= 40) factsToShow.push(progressFacts[1]);
    if (progressPercent >= 60) factsToShow.push(progressFacts[2]);
    if (progressPercent >= 80) factsToShow.push(progressFacts[3]);
    if (progressPercent >= 100) factsToShow.push(progressFacts[4]);
    
    // Pass progress to parent
    if (onProgress) {
      onProgress(factsToShow, "shape");
    }
  }, [placedPieces, pieces.length, onProgress]);
  
  // Handle piece interaction (drag start/end)
  const handlePieceInteraction = (action) => {
    // When interaction starts, ensure we're in the shape puzzle
    if (action === "start-drag" && onProgress) {
      // Pass current progress with the puzzle type
      const factsToShow = progressFacts.slice(0, placedPieces.length);
      onProgress(factsToShow, "shape");
    }
  };
  
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={0.5} />
      
      {/* Background grid */}
      <gridHelper 
        args={[10, 10, '#888888', '#444444']} 
        position={[0, 0, -0.1]} 
      />
      
      {/* Target positions */}
      {pieces.map((piece) => (
        <TargetMarker
          key={`target-${piece.id}`}
          position={piece.targetPosition}
          shape={piece.shape}
          isPlaced={piece.isPlaced}
        />
      ))}
      
      {/* Puzzle pieces */}
      {pieces.map((piece) => (
        <PuzzlePiece
          key={piece.id}
          index={piece.id}
          position={piece.isPlaced ? piece.targetPosition : piece.position}
          targetPosition={piece.targetPosition}
          color={piece.color}
          shape={piece.shape}
          isPlaced={piece.isPlaced}
          onDragEnd={handleDragEnd}
          userData={{ onPieceInteraction: handlePieceInteraction }}
        />
      ))}
      
      {/* Celebration particles for recently placed piece */}
      {recentlyPlaced !== null && (
        <Particles
          position={pieces[recentlyPlaced].targetPosition}
          color={pieces[recentlyPlaced].color}
        />
      )}
      
      {/* Progress indicator */}
      <Text
        position={[0, 3, 0]}
        color="#ffffff"
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
        outlineOpacity={0.8}
      >
        {`Skills Puzzle: ${progress}% Complete`}
      </Text>
      
      {/* Instructions background */}
      <mesh position={[0, -3, 0]}>
        <planeGeometry args={[6, 1]} />
        <meshBasicMaterial color="#000000" opacity={0.8} transparent />
      </mesh>
      
      {/* Instructions */}
      <Text
        position={[0, -3, 0.1]}
        color="#ffffff"
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
        maxWidth={5.5}
        textAlign="center"
      >
        Drag the colored shapes to their matching outlines
      </Text>
    </group>
  );
};

export default PuzzleGame; 
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Box, SpotLight, useKeyboardControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import PuzzleGame from './PuzzleGame';
import LogicPuzzle from './LogicPuzzle';
import MemoryPuzzle from './MemoryPuzzle';
import PuzzleScreen from './PuzzleScreen';

// About me facts for each puzzle
const puzzlesData = [
  {
    id: 1,
    title: "Skills",
    type: "shape", // Original shape puzzle
    facts: [
      "I'm a creative developer specializing in immersive 3D web experiences",
      "I have expertise in React, Three.js, WebGL, and interactive 3D animations",
      "I've developed both frontend and backend systems for various applications",
      "I enjoy solving complex problems using modern web technologies",
      "I'm proficient in JavaScript/TypeScript, CSS, and responsive web design"
    ],
    position: [-6, 0, -2],
    color: "#1E88E5"
  },
  {
    id: 2,
    title: "Experience",
    type: "logic", // Logic puzzle
    facts: [
      "I've worked on projects for brands in e-commerce, education, and entertainment",
      "I've built interactive data visualizations for business analytics platforms",
      "I've developed engaging user interfaces for mobile and web applications",
      "I've collaborated with design teams to implement pixel-perfect interfaces",
      "I've optimized web applications for performance and accessibility"
    ],
    position: [0, 0, -6],
    color: "#FFA000"
  },
  {
    id: 3,
    title: "Interests",
    type: "memory", // Memory puzzle
    facts: [
      "I enjoy combining design thinking with technical implementation",
      "I'm passionate about creating memorable user experiences",
      "Outside of coding, I love photography and exploring new technologies",
      "I regularly contribute to open-source projects in my free time",
      "I'm interested in the intersection of art and technology"
    ],
    position: [6, 0, -2],
    color: "#43A047"
  }
];

// Flickering candle effect
const Candle = ({ position, intensity = 0.8, size = 0.08 }) => {
  const lightRef = useRef();
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      // Flickering effect
      const t = clock.getElapsedTime();
      const flicker = Math.sin(t * 10) * 0.05 + Math.sin(t * 7) * 0.03 + Math.sin(t * 13) * 0.02;
      lightRef.current.intensity = intensity * (0.9 + flicker);
    }
  });
  
  return (
    <group position={position}>
      {/* Candle body */}
      <mesh position={[0, size * 2, 0]}>
        <cylinderGeometry args={[size * 0.5, size * 0.7, size * 5, 16]} />
        <meshStandardMaterial color="#e3d9c6" />
      </mesh>
      
      {/* Flame */}
      <mesh position={[0, size * 4.5, 0]}>
        <sphereGeometry args={[size * 0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffcc33" emissive="#ff9933" emissiveIntensity={1} />
      </mesh>
      
      {/* Candlelight */}
      <primitive 
        ref={lightRef}
        object={new THREE.PointLight("#ff9933", intensity, 5)} 
        position={[0, size * 4.5, 0]} 
      />
    </group>
  );
};

// Book pile decoration
const BookPile = ({ position, rotation = [0, 0, 0], count = 3 }) => {
  const bookColors = ["#8B4513", "#A52A2A", "#800000", "#4B0082", "#000080"];
  
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 0.1, 
            0.1 * i, 
            (Math.random() - 0.5) * 0.1
          ]}
          rotation={[0, Math.random() * Math.PI * 0.1, 0]}
          castShadow
        >
          <boxGeometry args={[0.5, 0.1, 0.7]} />
          <meshStandardMaterial 
            color={bookColors[i % bookColors.length]} 
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Room walls, floor, and decorations
const Room = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#463229" 
          roughness={0.7}
          metalness={0.2}
          emissive="#2a1f1a"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          emissive="#1a1a1a"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Walls - lighter colors */}
      <mesh position={[0, 2, -10]} receiveShadow>
        <boxGeometry args={[20, 8, 0.2]} />
        <meshStandardMaterial color="#3d3630" roughness={0.75} />
      </mesh>
      
      <mesh position={[0, 2, 10]} receiveShadow>
        <boxGeometry args={[20, 8, 0.2]} />
        <meshStandardMaterial color="#3a3630" roughness={0.75} />
      </mesh>
      
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 8, 0.2]} />
        <meshStandardMaterial color="#403630" roughness={0.75} />
      </mesh>
      
      <mesh position={[10, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 8, 0.2]} />
        <meshStandardMaterial color="#3b3630" roughness={0.75} />
      </mesh>
      
      {/* Atmospheric decorations */}
      {/* Old carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#571f19" 
          roughness={1}
          opacity={0.9}
          transparent
        />
      </mesh>
      
      {/* Chandelier */}
      <group position={[0, 5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
          <meshStandardMaterial color="#6d5624" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 1, 16]} />
          <meshStandardMaterial color="#6d5624" metalness={0.6} roughness={0.4} />
        </mesh>
        
        <Candle position={[0.3, -0.5, 0.3]} intensity={0.8} />
        <Candle position={[-0.3, -0.5, 0.3]} intensity={0.8} />
        <Candle position={[0.3, -0.5, -0.3]} intensity={0.8} />
        <Candle position={[-0.3, -0.5, -0.3]} intensity={0.8} />
      </group>
      
      {/* Wall torch brackets */}
      <Candle position={[-9, 3, -5]} intensity={1.2} />
      <Candle position={[9, 3, -5]} intensity={1.2} />
      <Candle position={[-9, 3, 5]} intensity={1.2} />
      <Candle position={[9, 3, 5]} intensity={1.2} />
      
      {/* Decorative items */}
      {/* Bookshelf left */}
      <mesh position={[-9.8, 0, -5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3, 4, 0.5]} />
        <meshStandardMaterial color="#3b2d1d" roughness={0.9} />
      </mesh>
      
      <BookPile position={[-9.5, 0.2, -4]} rotation={[0, Math.PI / 6, 0]} count={5} />
      <BookPile position={[-9.5, 0.2, -5]} rotation={[0, -Math.PI / 8, 0]} count={3} />
      <BookPile position={[-9.5, 0.2, -6]} rotation={[0, Math.PI / 12, 0]} count={4} />
      
      {/* Table with mysterious artifacts */}
      <mesh position={[0, -1, 4]} castShadow>
        <boxGeometry args={[3, 0.2, 1.5]} />
        <meshStandardMaterial color="#43342c" roughness={0.7} />
      </mesh>
      <mesh position={[0.8, -1.4, 3.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#3b2d1d" roughness={0.7} />
      </mesh>
      <mesh position={[-0.8, -1.4, 3.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#3b2d1d" roughness={0.7} />
      </mesh>
      <mesh position={[0.8, -1.4, 4.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#3b2d1d" roughness={0.7} />
      </mesh>
      <mesh position={[-0.8, -1.4, 4.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#3b2d1d" roughness={0.7} />
      </mesh>
      
      {/* Crystal ball */}
      <group position={[0, -0.8, 4]}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshPhysicalMaterial 
            color="#a7c4e5" 
            roughness={0}
            transmission={0.95}
            thickness={0.5}
            ior={1.5}
          />
        </mesh>
        <primitive 
          object={new THREE.PointLight("#a7c4e5", 0.2, 2)}
          position={[0, 0, 0]}
        />
      </group>
      
      {/* Old scroll */}
      <mesh position={[1.5, -0.8, 4]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
        <meshStandardMaterial color="#d6c1a8" roughness={0.9} />
      </mesh>
      
      {/* Mysterious symbols on the wall */}
      <mesh position={[0, 3, -9.9]}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial 
          color="#2d2620" 
          roughness={0.8}
          emissive="#291300"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

// Puzzle station (display for selecting a puzzle)
const PuzzleStation = ({ position, rotation, title, puzzleType, color, completionPercentage, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const pedestalRef = useRef();
  const shapeRef = useRef();
  
  // Animation for the pedestal and preview shape
  useFrame(({ clock }) => {
    if (pedestalRef.current && shapeRef.current) {
      // Gentle floating animation for the shape
      const t = clock.getElapsedTime();
      shapeRef.current.position.y = 2.0 + Math.sin(t * 1.5) * 0.1;
      
      // Make the shape rotate slowly
      shapeRef.current.rotation.y += 0.01;
      
      // Pulse effect when hovered
      if (hovered) {
        shapeRef.current.scale.x = 0.6 + Math.sin(t * 5) * 0.05;
        shapeRef.current.scale.y = 0.6 + Math.sin(t * 5) * 0.05;
        shapeRef.current.scale.z = 0.6 + Math.sin(t * 5) * 0.05;
      } else {
        shapeRef.current.scale.x = THREE.MathUtils.lerp(shapeRef.current.scale.x, 0.5, 0.1);
        shapeRef.current.scale.y = THREE.MathUtils.lerp(shapeRef.current.scale.y, 0.5, 0.1);
        shapeRef.current.scale.z = THREE.MathUtils.lerp(shapeRef.current.scale.z, 0.5, 0.1);
      }
      
      // Adjust the glow intensity based on hover and completion
      const material = pedestalRef.current.material;
      if (material) {
        material.emissiveIntensity = hovered ? 0.7 : completionPercentage > 0 ? 0.5 : 0.2;
      }
    }
  });
  
  // Preview shape based on puzzle type
  const renderPreviewShape = () => {
    switch (puzzleType) {
      case 'shape':
        return (
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.3} 
              metalness={0.8} 
              roughness={0.2} 
            />
          </mesh>
        );
      case 'logic':
        return (
          <group>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={0.3} 
                metalness={0.8} 
                roughness={0.2} 
              />
            </mesh>
            {/* Connection lines */}
            {[1, 2, 3].map((index) => (
              <mesh 
                key={index} 
                position={[Math.cos(index * 2 * Math.PI / 3) * 0.4, Math.sin(index * 2 * Math.PI / 3) * 0.4, 0]}
                scale={[0.15, 0.15, 0.15]}
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial 
                  color={color} 
                  emissive={color} 
                  emissiveIntensity={0.3} 
                />
              </mesh>
            ))}
          </group>
        );
      case 'memory':
        return (
          <group>
            {/* Card stack */}
            {[0, 1, 2].map((index) => (
              <mesh 
                key={index} 
                position={[0, -0.05 * index, 0]} 
                rotation={[0, index * 0.2, 0]}
              >
                <boxGeometry args={[0.7, 0.1, 0.7]} />
                <meshStandardMaterial 
                  color={index === 0 ? color : '#111'} 
                  metalness={0.5} 
                  roughness={0.3} 
                  emissive={index === 0 ? color : '#000'} 
                  emissiveIntensity={index === 0 ? 0.3 : 0} 
                />
              </mesh>
            ))}
          </group>
        );
      default:
        return (
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };
  
  // Calculate the completion bar fill amount
  const completionFill = Math.max(0.01, completionPercentage / 100);
  
  // Larger invisible hitbox for better click detection
  const handleStationClick = (e) => {
    e.stopPropagation();
    console.log(`Clicked on ${title} puzzle station (${puzzleType})`);
    onClick(puzzleType);
  };
  
  return (
    <group position={position} rotation={rotation}>
      {/* Invisible larger hitbox for better click detection */}
      <mesh 
        position={[0, 1.5, 0]} 
        onClick={handleStationClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        visible={false} // Invisible but interactive
      >
        <boxGeometry args={[2, 3, 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Pedestal */}
      <mesh 
        ref={pedestalRef} 
        position={[0, 0.5, 0]}
      >
        <cylinderGeometry args={[0.5, 0.7, 1, 16]} />
        <meshStandardMaterial 
          color={'#333'} 
          metalness={0.7} 
          roughness={0.2} 
          emissive={color} 
          emissiveIntensity={hovered ? 0.7 : 0.2} 
        />
      </mesh>
      
      {/* Preview shape with animation */}
      <group ref={shapeRef} position={[0, 2, 0]}>
        {renderPreviewShape()}
      </group>
      
      {/* Title text */}
      <Text
        position={[0, 3.2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        textAlign="center"
      >
        {title}
      </Text>
      
      {/* Completion indicator */}
      <group position={[0, 0.05, 0]}>
        {/* Base */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.2} />
        </mesh>
        
        {/* Progress indicator */}
        {completionPercentage > 0 && (
          <mesh position={[0, 0.06, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.7 * completionFill, 0.7 * completionFill, 0.1, 32]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.5} 
              metalness={0.8} 
              roughness={0.2} 
            />
          </mesh>
        )}
      </group>
    </group>
  );
};

// Player controls with camera look movement
const Player = ({ position, setPosition, lookAt, setLookAt, activePuzzle, setActivePuzzle, playerRef, lookControlsRef }) => {
  const speed = 0.1;
  const lookSpeed = 0.02;
  const keysPressed = useRef({});
  const mouseDown = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const { camera, gl } = useThree();
  const meshRef = useRef();
  
  // Connect the external ref to our internal ref
  useEffect(() => {
    if (playerRef) {
      playerRef.current = meshRef.current;
    }
    
    // Setup the lookControls ref for external access
    if (lookControlsRef) {
      lookControlsRef.current = {
        lookAt: (target) => {
          const direction = new THREE.Vector3();
          direction.subVectors(target, new THREE.Vector3(...position));
          
          // Calculate horizontal and vertical angles
          const horizontal = Math.atan2(direction.x, -direction.z);
          const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
          const vertical = Math.atan2(direction.y, distance);
          
          setLookAt({
            horizontal: horizontal,
            vertical: vertical
          });
        }
      };
    }
  }, [position, setLookAt, playerRef, lookControlsRef]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
    };
    
    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };
    
    const handleMouseDown = (e) => {
      mouseDown.current = true;
      lastMousePosition.current.x = e.clientX;
      lastMousePosition.current.y = e.clientY;
      gl.domElement.style.cursor = 'grabbing';
    };
    
    const handleMouseUp = () => {
      mouseDown.current = false;
      gl.domElement.style.cursor = 'auto';
    };
    
    const handleMouseMove = (e) => {
      if (mouseDown.current && activePuzzle === null) {
        // Calculate mouse movement delta
        const deltaX = e.clientX - lastMousePosition.current.x;
        const deltaY = e.clientY - lastMousePosition.current.y;
        
        // Update look direction
        const newLookAt = { ...lookAt };
        newLookAt.horizontal -= deltaX * lookSpeed;
        newLookAt.vertical = Math.max(
          -Math.PI / 3, 
          Math.min(Math.PI / 3, newLookAt.vertical - deltaY * lookSpeed)
        );
        
        setLookAt(newLookAt);
        
        // Update last position
        lastMousePosition.current.x = e.clientX;
        lastMousePosition.current.y = e.clientY;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, lookAt, setLookAt, activePuzzle]);
  
  useFrame(() => {
    // Only allow movement when not actively solving a puzzle
    if (activePuzzle === null) {
      const directionVector = new THREE.Vector3();
      
      // Calculate forward direction based on camera look
      const forwardX = Math.sin(lookAt.horizontal);
      const forwardZ = -Math.cos(lookAt.horizontal);
      
      // Calculate sideways direction (90 degrees to forward)
      const rightX = Math.sin(lookAt.horizontal + Math.PI / 2);
      const rightZ = -Math.cos(lookAt.horizontal + Math.PI / 2);
      
      if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) {
        directionVector.x += forwardX;
        directionVector.z += forwardZ;
      }
      if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) {
        directionVector.x -= forwardX;
        directionVector.z -= forwardZ;
      }
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
        directionVector.x -= rightX;
        directionVector.z -= rightZ;
      }
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
        directionVector.x += rightX;
        directionVector.z += rightZ;
      }
      
      // Normalize vector to ensure consistent speed in all directions
      if (directionVector.length() > 0) {
        directionVector.normalize();
        
        const newPosition = [
          position[0] + directionVector.x * speed,
          position[1],
          position[2] + directionVector.z * speed
        ];
        
        // Constrain to room boundaries
        newPosition[0] = Math.max(-9, Math.min(9, newPosition[0]));
        newPosition[2] = Math.max(-9, Math.min(9, newPosition[2]));
        
        setPosition(newPosition);
      }
    }
    
    // Exit puzzle mode with Escape key
    if (keysPressed.current['Escape'] && activePuzzle !== null) {
      setActivePuzzle(null);
    }
  });
  
  return (
    <mesh 
      ref={meshRef}
      position={[...position, 0]} 
      visible={false}
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="red" wireframe />
    </mesh>
  );
};

// Main puzzle room component
const PuzzleRoom = ({ onPuzzleProgress }) => {
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
  const [lookDirection, setLookDirection] = useState({ horizontal: 0, vertical: 0 });
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [puzzleLocked, setPuzzleLocked] = useState(false);
  const [completedPuzzles, setCompletedPuzzles] = useState([]);
  const [puzzleProgress, setPuzzleProgress] = useState({});
  const { camera, scene } = useThree();
  
  // Define refs correctly
  const playerRef = useRef(null);
  const lookControlsRef = useRef(null);
  
  // Store the camera position before activating a puzzle
  const prevCameraState = useRef({ position: null, lookAt: null });
  
  // Move camera based on player position and look direction
  useEffect(() => {
    if (activePuzzle === null) {
      // First-person camera position
      camera.position.x = playerPosition[0];
      camera.position.y = 1.7; // Fixed height (like eye level)
      camera.position.z = playerPosition[2];
      
      // Calculate look target position
      const targetX = playerPosition[0] + Math.sin(lookDirection.horizontal) * Math.cos(lookDirection.vertical);
      const targetY = playerPosition[1] + 1.7 + Math.sin(lookDirection.vertical);
      const targetZ = playerPosition[2] - Math.cos(lookDirection.horizontal) * Math.cos(lookDirection.vertical);
      
      camera.lookAt(targetX, targetY, targetZ);
    }
  }, [playerPosition, lookDirection, activePuzzle, camera]);
  
  // Handle puzzle activation - save camera state
  const handleActivatePuzzle = (puzzleType) => {
    // Don't allow switching puzzles if one is already active and locked
    if (puzzleLocked) {
      console.log("Cannot switch puzzles - current puzzle is locked");
      return;
    }
    
    if (!playerRef.current) {
      console.error("Player reference is not available");
      return;
    }
    
    // Store previous player position and rotation
    prevCameraState.current = {
      position: playerPosition.slice(), // Make a copy of the array
      lookAt: { ...lookDirection }
    };
    
    // Find the puzzle station
    const puzzleStation = puzzlesData.find(p => p.type === puzzleType);
    if (puzzleStation) {
      // Create a direction vector pointing from the station to the player
      const stationPosition = new THREE.Vector3(...puzzleStation.position);
      const currentPosition = new THREE.Vector3(...playerPosition);
      
      const direction = new THREE.Vector3()
        .subVectors(currentPosition, stationPosition)
        .normalize();
      
      // Position the player 3 units away from the puzzle in that direction
      const newPosition = new THREE.Vector3()
        .copy(stationPosition)
        .add(direction.multiplyScalar(3));
      
      // Set the height to eye level
      newPosition.y = 1.7;
      
      // Update player position
      setPlayerPosition([newPosition.x, newPosition.y, newPosition.z]);
      
      // Look at the puzzle station
      const lookTarget = new THREE.Vector3(...puzzleStation.position);
      lookTarget.y = 1.7; // Set to eye level
      
      // Calculate the look direction angles
      const lookDir = new THREE.Vector3().subVectors(lookTarget, newPosition).normalize();
      const horizontal = Math.atan2(lookDir.x, -lookDir.z);
      const vertical = Math.atan2(lookDir.y, Math.sqrt(lookDir.x * lookDir.x + lookDir.z * lookDir.z));
      
      // Update look direction
      setLookDirection({
        horizontal: horizontal,
        vertical: vertical
      });
      
      // If we have lookControlsRef, use it to look at the target
      if (lookControlsRef.current && lookControlsRef.current.lookAt) {
        lookControlsRef.current.lookAt(lookTarget);
      }
      
      // Activate puzzle after a short delay to allow camera to position
      setTimeout(() => {
        // Set locked state to prevent switching puzzles
        setPuzzleLocked(true);
        
        setActivePuzzle({
          type: puzzleType,
          title: puzzleStation.title,
          color: puzzleStation.color,
          size: 5,
          shapes: ['cube', 'sphere', 'cylinder', 'cone', 'torus'],
          theme: 'circuits',
          difficulty: 'medium',
          cardCount: 6
        });
      }, 300);
    }
  };
  
  // Handle puzzle deactivation - restore camera state
  const handlePuzzleDeactivation = () => {
    // Reset the active puzzle
    setActivePuzzle(null);
    
    // Unlock puzzle switching
    setPuzzleLocked(false);
    
    // Restore previous camera position immediately
    if (prevCameraState.current && prevCameraState.current.position) {
      setPlayerPosition(prevCameraState.current.position);
      setLookDirection(prevCameraState.current.lookAt);
    }
    
    // Make sure all objects are visible again in case some weren't restored
    setTimeout(() => {
      if (scene) {
        // Clear any scene modifications
        scene.background = null;
        scene.fog = null;
        
        // Ensure all objects are properly restored
        scene.traverse((object) => {
          if (object.isMesh && object !== camera && !object.userData.isPuzzleScreen) {
            object.visible = true;
          }
        });
      }
      
      // Reset camera position and look direction again as a fallback
      if (prevCameraState.current && prevCameraState.current.position) {
        camera.position.set(
          prevCameraState.current.position[0],
          1.7, // Fixed eye level height
          prevCameraState.current.position[2]
        );
        
        // Force camera to look in the correct direction
        const lookTarget = new THREE.Vector3(
          prevCameraState.current.position[0] + Math.sin(prevCameraState.current.lookAt.horizontal),
          1.7 + Math.sin(prevCameraState.current.lookAt.vertical),
          prevCameraState.current.position[2] - Math.cos(prevCameraState.current.lookAt.horizontal)
        );
        camera.lookAt(lookTarget);
      }
    }, 100);
  };
  
  // Handle individual puzzle progress
  const handlePuzzleProgress = (facts, puzzleType) => {
    // Error handling for missing puzzle type
    if (!puzzleType) {
      console.error("Missing puzzle type in handlePuzzleProgress");
      return;
    }
    
    // Verify that we have an active puzzle and it matches the type
    if (activePuzzle && activePuzzle.type !== puzzleType) {
      console.error(`Puzzle type mismatch: active=${activePuzzle.type}, received=${puzzleType}`);
      return; // Don't process mismatched puzzle types
    }
    
    // Find the puzzle ID based on the puzzle type
    const puzzle = puzzlesData.find(p => p.type === puzzleType);
    if (!puzzle) {
      console.error(`Unknown puzzle type: ${puzzleType}`);
      return;
    }
    
    const id = puzzle.id;
    
    // Calculate progress percentage for this puzzle
    const factsCount = facts.length;
    const totalFacts = puzzlesData.find(p => p.id === id)?.facts.length || 0;
    const progressPercent = Math.min(100, Math.round((factsCount / totalFacts) * 100));
    
    // Update progress for the specific puzzle
    setPuzzleProgress(prev => ({
      ...prev,
      [id]: {
        facts,
        progress: progressPercent
      }
    }));
    
    // When all facts revealed, mark puzzle as completed
    if (factsCount === totalFacts) {
      setCompletedPuzzles(prev => prev.includes(id) ? prev : [...prev, id]);
    }
    
    // Pass all facts from all puzzles to parent component
    let allRevealedFacts = [];
    
    // First collect all existing facts from the current state
    Object.entries(puzzleProgress).forEach(([puzzleId, puzzleData]) => {
      if (puzzleData && puzzleData.facts && puzzleId != id.toString()) {
        allRevealedFacts = [...allRevealedFacts, ...puzzleData.facts];
      }
    });
    
    // Add the current puzzle facts (to ensure the latest state is used)
    allRevealedFacts = [...allRevealedFacts, ...facts];
    
    // Ensure we're not passing duplicate facts
    const uniqueFacts = [...new Set(allRevealedFacts)];
    
    onPuzzleProgress(uniqueFacts);
  };
  
  const getEnhancedPuzzleData = () => {
    return puzzlesData.map(puzzle => ({
      ...puzzle,
      progress: puzzleProgress[puzzle.id]?.progress || 0,
      isCompleted: completedPuzzles.includes(puzzle.id)
    }));
  };
  
  return (
    <group>
      <Room />
      
      {/* Main ambient light - increased intensity */}
      <ambientLight intensity={1.2} color="#f0e6d2" />
      
      {/* Brighter central light */}
      <primitive object={new THREE.PointLight("#f5e9d0", 1.2, 20)} position={[0, 5, 0]} />
      
      {/* Brighter corner lights */}
      <primitive object={new THREE.PointLight("#e8ddc7", 0.8, 15)} position={[-8, 3, -8]} />
      <primitive object={new THREE.PointLight("#e8ddc7", 0.8, 15)} position={[8, 3, -8]} />
      <primitive object={new THREE.PointLight("#e8ddc7", 0.8, 15)} position={[-8, 3, 8]} />
      <primitive object={new THREE.PointLight("#e8ddc7", 0.8, 15)} position={[8, 3, 8]} />
      
      {/* Additional fill lights for better visibility */}
      <primitive object={new THREE.PointLight("#f0e6d2", 0.6, 10)} position={[0, 3, -5]} />
      <primitive object={new THREE.PointLight("#f0e6d2", 0.6, 10)} position={[0, 3, 5]} />
      <primitive object={new THREE.PointLight("#f0e6d2", 0.6, 10)} position={[-5, 3, 0]} />
      <primitive object={new THREE.PointLight("#f0e6d2", 0.6, 10)} position={[5, 3, 0]} />
      
      {/* Brighter candles */}
      <Candle position={[-4, 0, -4]} intensity={0.8} />
      <Candle position={[4, 0, -4]} intensity={0.8} />
      <Candle position={[-4, 0, 4]} intensity={0.8} />
      <Candle position={[4, 0, 4]} intensity={0.8} />
      <Candle position={[0, 0, -4.5]} intensity={1.0} />
      
      {/* Player controller */}
      <Player 
        position={playerPosition} 
        setPosition={setPlayerPosition} 
        lookAt={lookDirection}
        setLookAt={setLookDirection}
        activePuzzle={activePuzzle}
        setActivePuzzle={handlePuzzleDeactivation}
        playerRef={playerRef}
        lookControlsRef={lookControlsRef}
      />
      
      {/* Instructions */}
      {activePuzzle === null && (
        <group position={[0, 2.5, -7]}>
          {/* Background for better readability */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <planeGeometry args={[6, 1.5]} />
            <meshBasicMaterial color="#000000" opacity={0.8} transparent />
          </mesh>
          
          {/* Title */}
          <Text
            position={[0, 0.5, 0.1]}
            color="#FFD700" 
            fontSize={0.35}
            anchorX="center"
            anchorY="middle"
            maxWidth={5.5}
            textAlign="center"
            outlineWidth={0.03}
            outlineColor="#000000"
            outlineOpacity={0.8}
          >
            Welcome to the Mystery Room
          </Text>
          
          {/* Instructions */}
          <Text
            position={[0, -0.2, 0.1]}
            color="#FFFFFF"
            fontSize={0.25}
            anchorX="center"
            anchorY="middle"
            maxWidth={5.5}
            textAlign="center"
            outlineWidth={0.02}
            outlineColor="#000000"
            outlineOpacity={0.8}
          >
            Move your mouse to look around{'\n'}
            Use WASD to move{'\n'}
            (Click puzzle stations to interact)
          </Text>
        </group>
      )}
      
      {/* Puzzle stations */}
      {puzzlesData.map(puzzle => (
        <PuzzleStation
          key={puzzle.id}
          position={puzzle.position}
          rotation={[0, 0, 0]}
          title={puzzle.title}
          puzzleType={puzzle.type}
          color={puzzle.color}
          completionPercentage={puzzleProgress[puzzle.id]?.progress || 0}
          onClick={handleActivatePuzzle}
        />
      ))}
      
      {/* Active puzzle */}
      {activePuzzle !== null && (
        <PuzzleScreen
          isActive={activePuzzle !== null}
          puzzle={activePuzzle}
          onBack={handlePuzzleDeactivation}
          onProgress={(facts, puzzleType) => {
            // Ensure we're using the correct puzzle type
            const currentPuzzleType = puzzleType || activePuzzle.type;
            
            // Find the puzzle ID from the type
            const puzzleId = puzzlesData.find(p => p.type === currentPuzzleType)?.id;
            if (puzzleId) {
              handlePuzzleProgress(facts, currentPuzzleType);
            }
          }}
        />
      )}
    </group>
  );
};

// Add a new MysteryElements component to include decorative elements
const MysteryElements = () => {
  return (
    <group>
      {/* Mysterious floating crystals - more muted colors */}
      <FloatingCrystal position={[-3.5, 2.5, -3.5]} color="#675681" scale={0.6} />
      <FloatingCrystal position={[3.5, 2.7, -3.2]} color="#3a6964" scale={0.5} />
      <FloatingCrystal position={[0, 3.5, -4]} color="#8b5d5b" scale={0.7} />
      <FloatingCrystal position={[-2.5, 2.2, 3.3]} color="#9a856b" scale={0.4} />
      <FloatingCrystal position={[2.5, 2.3, 3.5]} color="#5f6783" scale={0.5} />
      
      {/* Ancient symbols on the floor with more subtle glow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3, 32]} />
        <meshStandardMaterial color="#3d313d" emissive="#4b3849" emissiveIntensity={0.15} />
      </mesh>
      
      {/* Alchemical circle with reduced glow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.6, 32]} />
        <meshStandardMaterial color="#3d313d" emissive="#3d4c64" emissiveIntensity={0.15} />
      </mesh>
      
      {/* Add mysterious lines connecting to puzzle stations with reduced glow */}
      {[[-3, 0, 0], [0, 0, -3], [3, 0, 0]].map((position, i) => (
        <group key={`line-${i}`}>
          <mesh 
            position={[position[0] / 3, 0.03, position[2] / 3]} 
            rotation={[-Math.PI / 2, 0, Math.atan2(position[0], position[2])]}
          >
            <planeGeometry args={[Math.sqrt(position[0] * position[0] + position[2] * position[2]) * 0.95, 0.1]} />
            <meshStandardMaterial 
              color="#1e1c2a" 
              emissive={["#9a8555", "#5580a0", "#955880"][i]} 
              emissiveIntensity={0.15} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        </group>
      ))}
      
      {/* Mysterious symbols at intersections of lines */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 6]} />
        <meshStandardMaterial color="#1e1c2a" emissive="#d0cbc5" emissiveIntensity={0.15} />
      </mesh>
      
      {/* Wall runes - softer glow */}
      <group position={[-4.99, 2, 0]}>
        {[-3, -1, 1, 3].map((z, i) => (
          <mesh key={i} position={[0, Math.sin(i * 0.7) * 0.5, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.7, 0.7]} />
            <meshStandardMaterial 
              color="#1e1c2a" 
              emissive={["#675681", "#3a6964", "#8b5d5b", "#9a856b"][i]} 
              emissiveIntensity={0.2} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Opposite wall runes - softer glow */}
      <group position={[4.99, 2, 0]}>
        {[-3, -1, 1, 3].map((z, i) => (
          <mesh key={i} position={[0, Math.cos(i * 0.7) * 0.5, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.7, 0.7]} />
            <meshStandardMaterial 
              color="#1e1c2a" 
              emissive={["#9a856b", "#8b5d5b", "#3a6964", "#675681"][i]} 
              emissiveIntensity={0.2} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Add subtle dust particles */}
      <DustParticles />
    </group>
  );
};

// Floating crystal component with subtle animation
const FloatingCrystal = ({ position, color, scale = 1 }) => {
  const crystalRef = useRef();
  
  useFrame(({ clock }) => {
    if (crystalRef.current) {
      const t = clock.getElapsedTime();
      
      // Gentle floating motion
      crystalRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
      
      // Slow rotation
      crystalRef.current.rotation.y = t * 0.2;
      crystalRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    }
  });
  
  return (
    <group ref={crystalRef} position={position} scale={scale}>
      <mesh>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.15} 
          metalness={0.2} 
          roughness={0.7} 
        />
      </mesh>
      
      {/* Reduced glow effect */}
      <primitive 
        object={new THREE.PointLight(color, 0.2, 2)} 
        position={[0, 0, 0]} 
      />
    </group>
  );
};

// Add dust particles for atmosphere
const DustParticles = () => {
  const particles = useRef();
  const count = 30;
  const positions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 10, // x
        Math.random() * 5,          // y
        (Math.random() - 0.5) * 10  // z
      );
    }
    return new Float32Array(positions);
  }, [count]);
  
  useFrame(({ clock }) => {
    if (particles.current) {
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const positionArray = particles.current.geometry.attributes.position.array;
        
        // Slow rising movement
        positionArray[i3 + 1] += 0.005;
        
        // Gentle random horizontal drift
        positionArray[i3] += Math.sin(clock.getElapsedTime() * 0.1 + i) * 0.002;
        positionArray[i3 + 2] += Math.cos(clock.getElapsedTime() * 0.1 + i) * 0.002;
        
        // Reset if too high
        if (positionArray[i3 + 1] > 5) {
          positionArray[i3 + 1] = 0;
          positionArray[i3] = (Math.random() - 0.5) * 10;
          positionArray[i3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#d8c78e"
        transparent
        opacity={0.2}
        sizeAttenuation
      />
    </points>
  );
};

export default PuzzleRoom; 
import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { a, useSpring } from '@react-spring/three';

// Create a pair matching memory game
const MemoryPuzzle = ({ onProgress, puzzleColor = '#43A047', setErrorMsg }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [locked, setLocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recentMatch, setRecentMatch] = useState(null);
  
  // Card content pairs
  const cardSymbols = [
    { symbol: "diamond", label: "React", color: "#FF5722" },
    { symbol: "heart", label: "Web", color: "#F44336" },
    { symbol: "spade", label: "Design", color: "#333333" },
    { symbol: "club", label: "Mobile", color: "#4CAF50" },
    { symbol: "star", label: "Games", color: "#2196F3" }
  ];
  
  // Facts to reveal progressively
  const progressFacts = [
    "I enjoy combining design thinking with technical implementation",
    "I'm passionate about creating memorable user experiences",
    "Outside of coding, I love photography and exploring new technologies",
    "I regularly contribute to open-source projects in my free time",
    "I'm interested in the intersection of art and technology"
  ];
  
  // Initialize game
  useEffect(() => {
    // Create pairs of cards
    const cardPairs = cardSymbols.flatMap(card => [
      { ...card, id: Math.random() },
      { ...card, id: Math.random() }
    ]);
    
    // Shuffle cards
    const shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
    
    // Create a grid layout
    const gridCards = shuffled.map((card, index) => {
      // Calculate grid position (2x5 grid)
      const col = index % 5;
      const row = Math.floor(index / 5);
      
      return {
        ...card,
        position: [
          (col - 2) * 1.2, // Centered horizontally
          1 - row * 1.5,   // Start from top
          0
        ],
        matched: false,
        flipped: false
      };
    });
    
    setCards(gridCards);
  }, [puzzleColor]);
  
  // Handle card click
  const handleCardClick = (index) => {
    // Prevent clicking if the game is locked or the card is already flipped/matched
    if (locked || flippedIndices.includes(index) || cards[index].matched) {
      return;
    }
    
    // Flip the card
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // Notify parent component that we're still in the memory puzzle (to prevent switching)
    if (onProgress && newFlippedIndices.length === 1) {
      // Pass the current facts with the puzzle type to maintain state
      const factsToShow = progressFacts.slice(0, matchedPairs.length);
      onProgress(factsToShow, "memory");
    }
    
    // If we have 2 flipped cards, check for a match
    if (newFlippedIndices.length === 2) {
      setLocked(true);
      
      const firstIndex = newFlippedIndices[0];
      const secondIndex = newFlippedIndices[1];
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      // Check if they match
      if (firstCard.symbol === secondCard.symbol) {
        // Set cards as matched
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) => 
            idx === firstIndex || idx === secondIndex
              ? { ...card, matched: true }
              : card
          ));
          
          // Add to matched pairs
          const newPair = firstCard.symbol;
          setMatchedPairs(prev => [...prev, newPair]);
          setRecentMatch({ indices: [firstIndex, secondIndex], time: Date.now() });
          
          // Reset flipped
          setFlippedIndices([]);
          setLocked(false);
          
          // Hide recent match after animation
          setTimeout(() => setRecentMatch(null), 2000);
          
          // Calculate progress and update facts displayed
          const newProgress = Math.min(100, Math.round((matchedPairs.length + 1) / cardSymbols.length * 100));
          setProgress(newProgress);
          
          // Reveal facts based on pairs matched
          if (onProgress) {
            // Send puzzle type identifier to prevent switching puzzles
            const factsToShow = progressFacts.slice(0, matchedPairs.length + 1);
            onProgress(factsToShow, "memory"); // Add puzzle type identifier
          }
        }, 500);
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setFlippedIndices([]);
          setLocked(false);
        }, 1000);
      }
    }
  };
  
  // Card component with flip animation
  const Card = ({ index, card }) => {
    const isFlipped = flippedIndices.includes(index) || card.matched;
    const [hovered, setHovered] = useState(false);
    
    // Flip animation
    const { rotation, scale, color } = useSpring({
      rotation: isFlipped ? [0, Math.PI, 0] : [0, 0, 0],
      scale: hovered && !isFlipped && !locked ? 1.1 : 1,
      color: card.matched ? "#4CAF50" : puzzleColor,
      config: { mass: 1, tension: 200, friction: 20 }
    });
    
    // Render different shape based on symbol
    const renderCardShape = () => {
      switch(card.symbol) {
        case 'diamond':
          return (
            <mesh rotation={[0, 0, Math.PI/4]}>
              <boxGeometry args={[0.4, 0.4, 0.05]} />
              <meshStandardMaterial color={card.color} />
            </mesh>
          );
        case 'heart':
          return (
            <group>
              <mesh position={[-0.1, 0, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[0.1, 0, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.3, 0.5, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
            </group>
          );
        case 'spade':
          return (
            <group>
              <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[-0.15, -0.1, 0]} rotation={[0, 0, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[0.15, -0.1, 0]} rotation={[0, 0, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
            </group>
          );
        case 'club':
          return (
            <group>
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[-0.15, -0.05, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[0.15, -0.05, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
            </group>
          );
        case 'star':
          return (
            <group>
              {[0, 1, 2, 3, 4].map(i => {
                const angle = (i * Math.PI * 2) / 5;
                return (
                  <mesh key={i} position={[Math.sin(angle) * 0.3, Math.cos(angle) * 0.3, 0]} rotation={[0, 0, -angle]}>
                    <coneGeometry args={[0.08, 0.3, 4]} />
                    <meshStandardMaterial color={card.color} />
                  </mesh>
                );
              })}
              <mesh>
                <circleGeometry args={[0.15, 32]} />
                <meshStandardMaterial color={card.color} />
              </mesh>
            </group>
          );
        default:
          return (
            <mesh>
              <boxGeometry args={[0.3, 0.3, 0.05]} />
              <meshStandardMaterial color={card.color} />
            </mesh>
          );
      }
    };
    
    return (
      <a.group 
        position={card.position}
        scale={scale}
        onPointerOver={() => !isFlipped && !locked && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => handleCardClick(index)}
      >
        {/* Card back */}
        <a.mesh
          rotation={rotation}
          visible={!isFlipped}
        >
          <boxGeometry args={[1, 1.4, 0.1]} />
          <a.meshStandardMaterial 
            color={color}
            roughness={0.5}
            metalness={0.2}
            emissive={hovered ? puzzleColor : "#000000"}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
          
          {/* Question mark background */}
          <mesh position={[0, 0, 0.051]}>
            <circleGeometry args={[0.4, 32]} />
            <meshBasicMaterial color="#ffffff" opacity={0.15} transparent />
          </mesh>
          
          {/* Question mark on back */}
          <Text
            position={[0, 0, 0.06]}
            color="#ffffff"
            fontSize={0.8}
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
            renderOrder={2}
            depthTest={false}
          >
            ?
          </Text>
        </a.mesh>
        
        {/* Card front */}
        <a.mesh
          rotation={[0, Math.PI, 0]}
          rotation-y={rotation.to(r => Math.PI - r)}
          visible={isFlipped}
        >
          <boxGeometry args={[1, 1.4, 0.1]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.4}
            metalness={0.1}
            emissive={card.matched ? "#4CAF50" : "#000000"}
            emissiveIntensity={card.matched ? 0.3 : 0}
          />
          
          {/* Symbol as 3D geometry shape */}
          <group position={[0, 0, 0.06]}>
            {renderCardShape()}
          </group>
          
          {/* Label background */}
          <mesh position={[0, -0.5, 0.055]} renderOrder={2}>
            <planeGeometry args={[0.9, 0.4]} />
            <meshBasicMaterial color={card.matched ? "#e6f7e6" : "#f0f0f0"} />
          </mesh>
          
          {/* Label on front */}
          <Text
            position={[0, -0.5, 0.06]}
            color="#333333"
            fontSize={0.25}
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.9}
            textAlign="center"
            renderOrder={3}
            depthTest={false}
          >
            {card.label}
          </Text>
        </a.mesh>
      </a.group>
    );
  };
  
  // Celebration particles for matched cards
  const MatchParticles = ({ symbol }) => {
    const particles = useRef();
    const count = 50;
    const positions = useRef(new Float32Array(count * 3));
    const velocities = useRef([]);
    const colors = useRef([]);
    
    // Different colors for different symbols
    const getColorForSymbol = () => {
      switch (symbol) {
        case "diamond": return new THREE.Color("#FF5722");
        case "heart": return new THREE.Color("#F44336");
        case "spade": return new THREE.Color("#333333");
        case "club": return new THREE.Color("#4CAF50");
        case "star": return new THREE.Color("#2196F3");
        default: return new THREE.Color("#ffffff");
      }
    };
    
    useEffect(() => {
      // Initialize velocities and positions
      velocities.current = [];
      colors.current = [];
      
      for (let i = 0; i < count; i++) {
        // Random positions in the center
        positions.current[i * 3] = (Math.random() - 0.5) * 2;
        positions.current[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions.current[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        
        // Random velocities
        velocities.current.push({
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05 + 0.02, // Slight upward bias
          z: (Math.random() - 0.5) * 0.01
        });
        
        // Color with slight variation
        const baseColor = getColorForSymbol();
        const hsl = { h: 0, s: 0, l: 0 };
        baseColor.getHSL(hsl);
        hsl.h += (Math.random() - 0.5) * 0.1;
        hsl.s += (Math.random() - 0.5) * 0.2;
        hsl.l += (Math.random() - 0.5) * 0.2;
        
        const color = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
        colors.current.push(color.r, color.g, color.b);
      }
    }, [symbol]);
    
    useFrame(() => {
      if (particles.current) {
        const posArray = positions.current;
        
        for (let i = 0; i < count; i++) {
          // Update position
          posArray[i * 3] += velocities.current[i].x;
          posArray[i * 3 + 1] += velocities.current[i].y;
          posArray[i * 3 + 2] += velocities.current[i].z;
          
          // Gravity effect
          velocities.current[i].y -= 0.001;
        }
        
        // Update the geometry
        particles.current.geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(posArray, 3)
        );
        particles.current.geometry.attributes.position.needsUpdate = true;
      }
    });
    
    return (
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions.current}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={new Float32Array(colors.current)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.08} 
          vertexColors
          transparent 
          opacity={0.8}
          depthWrite={false}
        />
      </points>
    );
  };
  
  return (
    <group>
      {/* Brighter background */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[7, 5]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Enhanced lighting for better visibility */}
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 3]} intensity={1.2} color="#ffffff" />
      <spotLight position={[0, 3, 2]} intensity={0.5} angle={0.5} penumbra={0.5} color="#ffffff" />
      
      {/* Cards */}
      {cards.map((card, index) => (
        <Card key={card.id} index={index} card={card} />
      ))}
      
      {/* Celebration particles for recent match */}
      {recentMatch && (
        <MatchParticles symbol={cards[recentMatch.indices[0]]?.symbol || "diamond"} />
      )}
      
      {/* Instructions */}
      <Text
        position={[0, 2.2, 0]}
        color="#ffffff"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        renderOrder={2}
        depthTest={false}
      >
        {`Memory Puzzle: ${progress}%`}
      </Text>
      
      <Text
        position={[0, -2.2, 0]}
        color="#ffffff"
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
        maxWidth={6}
        textAlign="center"
        outlineWidth={0.02}
        outlineColor="#000000"
        renderOrder={2}
        depthTest={false}
      >
        Find matching pairs to reveal information about my interests
      </Text>
    </group>
  );
};

export default MemoryPuzzle; 
import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { a, useSpring } from '@react-spring/three';

const LogicPuzzle = ({ onProgress, puzzleColor = '#FFA000', setErrorMsg }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [progress, setProgress] = useState(0);
  const [recentlySolved, setRecentlySolved] = useState(null);
  const [localErrorMsg, setLocalErrorMsg] = useState(null);
  
  const handleErrorMsg = (msg) => {
    if (setErrorMsg) {
      setErrorMsg(msg);
    } else {
      setLocalErrorMsg(msg);
    }
  };
  
  // Define puzzle nodes and target connections
  useEffect(() => {
    // Create nodes
    const newNodes = [
      { id: 1, label: "Start", position: [-3, 2, 0], isFixed: true, color: puzzleColor },
      { id: 2, label: "Analysis", position: [-2, 0.5, 0], isFixed: false, color: shiftHue(puzzleColor, 20) },
      { id: 3, label: "Design", position: [0, 1.5, 0], isFixed: false, color: shiftHue(puzzleColor, 40) },
      { id: 4, label: "Development", position: [1, -0.5, 0], isFixed: false, color: shiftHue(puzzleColor, 60) },
      { id: 5, label: "Testing", position: [2, 0.5, 0], isFixed: false, color: shiftHue(puzzleColor, 80) },
      { id: 6, label: "End", position: [3, 2, 0], isFixed: true, color: shiftHue(puzzleColor, 100) }
    ];
    
    // Instead of random positions, use fixed positions that don't overlap
    const fixedPositions = [
      [-2, -1.5, 0],  // Position for node 2
      [0, -1.2, 0],   // Position for node 3
      [1.5, -1.8, 0], // Position for node 4
      [2.5, -1, 0]    // Position for node 5
    ];
    
    let posIndex = 0;
    newNodes.forEach(node => {
      if (!node.isFixed && posIndex < fixedPositions.length) {
        node.position = fixedPositions[posIndex];
        posIndex++;
      }
    });
    
    // Empty connections array - we'll build it based on user actions
    setNodes(newNodes);
    setConnections([]);
  }, [puzzleColor]);
  
  // Function to shift hue of a color
  function shiftHue(hexColor, degrees) {
    // Add a null check and default value
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#') || hexColor.length !== 7) {
      hexColor = '#FFA000'; // Default orange color
    }
    
    // Convert hex to RGB
    let r = parseInt(hexColor.substr(1, 2), 16) / 255;
    let g = parseInt(hexColor.substr(3, 2), 16) / 255;
    let b = parseInt(hexColor.substr(5, 2), 16) / 255;
    
    // Convert RGB to HSL
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      
      h /= 6;
    }
    
    // Shift hue
    h = (h * 360 + degrees) % 360 / 360;
    
    // Convert back to RGB
    let r1, g1, b1;
    
    if (s === 0) {
      r1 = g1 = b1 = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      
      r1 = hue2rgb(p, q, h + 1/3);
      g1 = hue2rgb(p, q, h);
      b1 = hue2rgb(p, q, h - 1/3);
    }
    
    // Convert to hex
    return `#${Math.round(r1 * 255).toString(16).padStart(2, '0')}${Math.round(g1 * 255).toString(16).padStart(2, '0')}${Math.round(b1 * 255).toString(16).padStart(2, '0')}`;
  }
  
  // Handle node selection - now works as a toggle
  const handleNodeClick = (id) => {
    // Clear any error messages when user interacts
    handleErrorMsg(null);
    
    // If no node selected previously, select this one
    if (selectedNode === null) {
      setSelectedNode(id);
      
      // When a node is first clicked, ensure we maintain puzzle type
      if (onProgress) {
        // Count current correct connections
        let correctCount = connections.filter(conn => isCorrectConnection(conn.from, conn.to)).length;
        
        // Pass current progress with puzzle type identifier
        const progressFacts = [
          "I've worked on projects for brands in e-commerce, education, and entertainment",
          "I've built interactive data visualizations for business analytics platforms",
          "I've developed engaging user interfaces for mobile and web applications",
          "I've collaborated with design teams to implement pixel-perfect interfaces",
          "I've optimized web applications for performance and accessibility"
        ];
        
        const factsToShow = progressFacts.slice(0, correctCount);
        onProgress(factsToShow, "logic");
      }
    } 
    // If same node selected, deselect it
    else if (selectedNode === id) {
      setSelectedNode(null);
    } 
    // If different node selected, try to create a connection
    else {
      // Don't allow self-connections
      if (selectedNode !== id) {
        const fromNode = nodes.find(n => n.id === selectedNode);
        const toNode = nodes.find(n => n.id === id);
        
        if (fromNode && toNode) {
          // Check if connection already exists
          const connectionExists = connections.some(
            conn => (conn.from === selectedNode && conn.to === id) || 
                   (conn.from === id && conn.to === selectedNode)
          );
          
          if (!connectionExists) {
            // Create a new connection
            const newConnection = {
              from: selectedNode,
              to: id,
              color: fromNode.color
            };
            
            const newConnections = [...connections, newConnection];
            setConnections(newConnections);
            
            // Show celebration effect
            setRecentlySolved(connections.length);
            setTimeout(() => setRecentlySolved(null), 2000);
            
            // Check if the puzzle is solved
            checkSolution(newConnections);
          }
        }
        
        // Reset selection
        setSelectedNode(null);
      }
    }
  };
  
  // Check if the current connections form a correct solution
  const checkSolution = (currentConnections) => {
    // Clear any existing error message
    handleErrorMsg(null);
    
    // Check if we have connections from start to end
    let hasStartConnection = false;
    let hasEndConnection = false;
    let correctConnections = 0;
    
    // Check each connection
    for (const conn of currentConnections) {
      // If connection is from start node
      if (conn.from === 1) {
        hasStartConnection = true;
      }
      
      // If connection is to end node
      if (conn.to === 6) {
        hasEndConnection = true;
      }
      
      // Check if this is a correct connection per our solution logic
      if (isCorrectConnection(conn.from, conn.to)) {
        correctConnections++;
      }
    }
    
    // Update progress based on correct connections
    const progressPercent = Math.min(100, Math.round((correctConnections / 5) * 100));
    setProgress(progressPercent);
    
    // Array of facts to reveal progressively
    const progressFacts = [
      "I've worked on projects for brands in e-commerce, education, and entertainment",
      "I've built interactive data visualizations for business analytics platforms",
      "I've developed engaging user interfaces for mobile and web applications",
      "I've collaborated with design teams to implement pixel-perfect interfaces",
      "I've optimized web applications for performance and accessibility"
    ];
    
    // Reveal facts based on number of correct connections
    const revealedFacts = progressFacts.slice(0, correctConnections);
    
    // If fully connected correctly
    if (hasStartConnection && hasEndConnection && correctConnections === 5) {
      setRecentlySolved(Date.now());
      onProgress(revealedFacts, "logic");
      return true;
    } 
    // If has connections but missing start or end
    else if (currentConnections.length > 0 && (!hasStartConnection || !hasEndConnection)) {
      handleErrorMsg("Your path must connect from Start to End");
    }
    // If has incorrect connections
    else if (currentConnections.length > 0 && correctConnections < currentConnections.length) {
      handleErrorMsg("Some connections aren't correct");
    }
    
    // Still update progress with partial facts
    if (correctConnections > 0) {
      onProgress(revealedFacts, "logic");
    }
    
    return false;
  };
  
  // Particle effect for new connections
  const ConnectionParticles = ({ fromPos, toPos, color }) => {
    const particles = useRef();
    const count = 20;
    const positions = useRef(new Array(count * 3).fill(0));
    const velocities = useRef([]);
    
    useEffect(() => {
      // Initialize velocities
      velocities.current = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01
      }));
      
      // Initialize positions along the connection line
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        positions.current[i * 3] = fromPos[0] * (1 - t) + toPos[0] * t;
        positions.current[i * 3 + 1] = fromPos[1] * (1 - t) + toPos[1] * t + (Math.random() - 0.5) * 0.2;
        positions.current[i * 3 + 2] = fromPos[2] * (1 - t) + toPos[2] * t;
      }
    }, [fromPos, toPos]);
    
    useFrame(() => {
      if (particles.current) {
        const posArray = positions.current;
        
        for (let i = 0; i < count; i++) {
          // Update position
          posArray[i * 3] += velocities.current[i].x;
          posArray[i * 3 + 1] += velocities.current[i].y;
          posArray[i * 3 + 2] += velocities.current[i].z;
          
          // Gravity
          velocities.current[i].y -= 0.001;
          
          // Check if particle is too far from line and reset
          const t = Math.random();
          const distX = Math.abs(posArray[i * 3] - (fromPos[0] * (1 - t) + toPos[0] * t));
          const distY = Math.abs(posArray[i * 3 + 1] - (fromPos[1] * (1 - t) + toPos[1] * t));
          
          if (distX > 1 || distY > 1 || posArray[i * 3 + 1] < -3) {
            posArray[i * 3] = fromPos[0] * (1 - t) + toPos[0] * t;
            posArray[i * 3 + 1] = fromPos[1] * (1 - t) + toPos[1] * t + (Math.random() - 0.5) * 0.2;
            posArray[i * 3 + 2] = fromPos[2] * (1 - t) + toPos[2] * t;
            
            velocities.current[i] = {
              x: (Math.random() - 0.5) * 0.02,
              y: (Math.random() - 0.5) * 0.02,
              z: (Math.random() - 0.5) * 0.01
            };
          }
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
            array={new Float32Array(positions.current)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color={color} transparent opacity={0.8} />
      </points>
    );
  };
  
  // Visual node component
  const Node = ({ id, label, position, isFixed, color }) => {
    const [hovered, setHovered] = useState(false);
    const isSelected = selectedNode === id;
    const nodeRef = useRef();
    
    // Check if this node is part of correct connections
    const isConnected = connections.some(conn => conn.from === id || conn.to === id);
    
    // Animation
    const { scale, emissiveIntensity } = useSpring({
      scale: isSelected ? 1.3 : hovered ? 1.2 : 1,
      emissiveIntensity: isSelected ? 0.8 : hovered ? 0.5 : isConnected ? 0.3 : 0.1,
      config: { tension: 300, friction: 10 }
    });
    
    return (
      <a.group
        ref={nodeRef}
        position={position}
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => handleNodeClick(id)}
      >
        {/* Invisible larger hitbox for better click target */}
        <mesh visible={false}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <a.meshStandardMaterial 
            color={color}
            metalness={0.3}
            roughness={0.7}
            emissive={isSelected ? "#ffffff" : color}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        
        {/* Selection indicator */}
        {isSelected && (
          <mesh position={[0, 0, -0.1]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )}
        
        <Text
          position={[0, -0.6, 0]}
          color="#ffffff"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </a.group>
    );
  };
  
  // Check if a connection is correct according to the solution
  const isCorrectConnection = (from, to) => {
    const correctSequence = [
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 }
    ];
    
    return correctSequence.some(
      conn => conn.from === from && conn.to === to
    );
  };
  
  // Add ability to remove connections and show path hints
  
  // Add this function to handle removing a connection
  const handleRemoveConnection = (index) => {
    // Remove the connection at the given index
    const newConnections = [...connections];
    newConnections.splice(index, 1);
    setConnections(newConnections);
    
    // Update progress after removing
    checkSolution(newConnections);
  };
  
  // Add this component to show the path hint
  const PathHints = () => {
    const correctSequence = [
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 }
    ];
    
    return (
      <group>
        {correctSequence.map((seq, idx) => {
          const fromNode = nodes.find(n => n.id === seq.from);
          const toNode = nodes.find(n => n.id === seq.to);
          
          // Only show hint if this connection doesn't already exist
          const alreadyConnected = connections.some(
            conn => conn.from === seq.from && conn.to === seq.to
          );
          
          if (fromNode && toNode && !alreadyConnected) {
            return (
              <Line
                key={`hint-${idx}`}
                points={[fromNode.position, toNode.position]}
                color="#ffffff"
                lineWidth={1}
                opacity={0.15}
                transparent
                dashed
                dashSize={0.1}
                gapSize={0.1}
              />
            );
          }
          return null;
        })}
      </group>
    );
  };
  
  return (
    <group>
      {/* Background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[7, 5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Connections */}
      {connections.map((connection, idx) => {
        const fromNode = nodes.find(n => n.id === connection.from);
        const toNode = nodes.find(n => n.id === connection.to);
        
        if (fromNode && toNode) {
          const isCorrect = isCorrectConnection(connection.from, connection.to);
          
          return (
            <group key={`conn-${idx}`}>
              {/* Add onClick to remove the connection */}
              <Line
                points={[fromNode.position, toNode.position]}
                color={isCorrect ? "#4CAF50" : "#ff5252"}
                lineWidth={isCorrect ? 3 : 2}
                opacity={isCorrect ? 1 : 0.7}
                transparent
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveConnection(idx);
                }}
              />
              
              {/* Visual cue that connection is clickable */}
              <mesh 
                position={[
                  (fromNode.position[0] + toNode.position[0]) / 2,
                  (fromNode.position[1] + toNode.position[1]) / 2,
                  0.01
                ]}
                scale={0.15}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveConnection(idx);
                }}
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
              </mesh>
              
              {recentlySolved === idx && (
                <ConnectionParticles
                  fromPos={fromNode.position}
                  toPos={toNode.position}
                  color={fromNode.color}
                />
              )}
            </group>
          );
        }
        return null;
      })}
      
      {/* Path Hints */}
      <PathHints />
      
      {/* Nodes */}
      {nodes.map(node => (
        <Node
          key={node.id}
          id={node.id}
          label={node.label}
          position={node.position}
          isFixed={node.isFixed}
          color={node.color}
        />
      ))}
      
      {/* Instructions */}
      <Text
        position={[0, 2.2, 0]}
        color="#ffffff"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`Logic Puzzle: ${progress}%`}
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
      >
        Connect the nodes in logical order
      </Text>
      
      <group position={[0, -2.6, 0]}>
        <Text
          position={[0, 0, 0]}
          color="#aaaaaa"
          fontSize={0.15}
          anchorX="center"
          anchorY="middle"
          maxWidth={6}
          textAlign="center"
        >
          Click one node, then another to connect them. Create correct connections from Start to End.
        </Text>
      </group>
      
      {/* Selection hint - only show when a node is selected */}
      {selectedNode !== null && (
        <group position={[0, 3, 0]}>
          <Text
            position={[0, 0, 0]}
            color="#ffffff"
            fontSize={0.2}
            anchorX="center"
            anchorY="middle"
          >
            Click another node to connect
          </Text>
        </group>
      )}
      
      {/* Add instruction about removing connections */}
      <group position={[0, -2.9, 0]}>
        <Text
          position={[0, 0, 0]}
          color="#aaaaaa"
          fontSize={0.12}
          anchorX="center"
          anchorY="middle"
          maxWidth={6}
          textAlign="center"
        >
          Click on a connection line to remove it
        </Text>
      </group>
      
      {/* Error message - only display when there is an error */}
      {localErrorMsg && (
        <group position={[3, 0, 0.5]}>
          <mesh>
            <boxGeometry args={[0, 0, 0]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default LogicPuzzle; 
import React, { useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import PuzzleGame from './PuzzleGame';
import LogicPuzzle from './LogicPuzzle';
import MemoryPuzzle from './MemoryPuzzle';

// Component for displaying active puzzle (full screen overlay)
const PuzzleScreen = ({ isActive, puzzle, onBack, onProgress }) => {
  const { camera, scene } = useThree();
  const [progressPercent, setProgressPercent] = useState(0);
  const [revealedFacts, setRevealedFacts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const initialPuzzleType = useRef(null); // Store the initial puzzle type
  
  // Save original scene state
  const originalSceneState = useRef({
    background: null,
    fog: null,
    visibleObjects: []
  });
  
  // Set up the puzzle environment and store initial puzzle type
  useEffect(() => {
    if (isActive && puzzle) {
      console.log("PuzzleScreen active: ", puzzle.type);
      
      // Store the initial puzzle type to ensure consistency
      if (puzzle.type && !initialPuzzleType.current) {
        initialPuzzleType.current = puzzle.type;
        console.log("Initial puzzle type set to:", initialPuzzleType.current);
      }
      
      // Save current scene state
      originalSceneState.current = {
        background: scene.background,
        fog: scene.fog,
        visibleObjects: []
      };
      
      // Hide other scene objects
      scene.traverse((object) => {
        if (object.isMesh && object !== camera) {
          originalSceneState.current.visibleObjects.push({
            object,
            wasVisible: object.visible
          });
          
          // Only hide if not part of this puzzle screen
          if (!object.userData.isPuzzleScreen) {
            object.visible = false;
          }
        }
      });
      
      // Set dark background
      scene.background = new THREE.Color('#111111');
      scene.fog = new THREE.FogExp2('#111111', 0.05);
      
      // Position camera for puzzle view
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
      
      // Reset error message and facts
      setErrorMsg('');
      setRevealedFacts([]);
      setProgressPercent(0);
    }
    
    return () => {
      // Restore original scene state when unmounting
      if (originalSceneState.current.background !== null) {
        scene.background = originalSceneState.current.background;
        scene.fog = originalSceneState.current.fog;
        
        // Restore visibility of scene objects
        originalSceneState.current.visibleObjects.forEach(({ object, wasVisible }) => {
          object.visible = wasVisible;
        });
      }
    };
  }, [isActive, puzzle, camera, scene]);
  
  // Handle revealing facts as puzzle progresses
  const handlePuzzleProgress = (facts, puzzleTypeFromChild) => {
    if (!facts || !Array.isArray(facts)) return;
    
    // Get the puzzle type - prioritize the initial type to prevent switching
    const expectedPuzzleType = initialPuzzleType.current || puzzle.type;
    
    // Ensure we're maintaining the correct puzzle type
    if (puzzleTypeFromChild && puzzleTypeFromChild !== expectedPuzzleType) {
      console.warn(`Puzzle type mismatch: expected ${expectedPuzzleType}, got ${puzzleTypeFromChild}`);
      return; // Don't update if puzzle types don't match
    }
    
    // Always ensure we're using the initial puzzle type when passing to parent
    const currentPuzzleType = expectedPuzzleType;
    
    setRevealedFacts(facts);
    
    // Calculate progress percentage
    let totalRequired = 5; // Default max facts
    if (currentPuzzleType === 'memory') {
      totalRequired = 5; // Memory puzzle has 5 facts
    } else if (currentPuzzleType === 'logic') {
      totalRequired = 5; // Logic puzzle has 5 facts
    } else if (currentPuzzleType === 'shape') {
      totalRequired = 5; // Shape puzzle has 5 facts
    }
    
    const progress = Math.min(100, Math.round((facts.length / totalRequired) * 100));
    setProgressPercent(progress);
    
    // Pass progress to parent with puzzle type identifier
    if (onProgress) {
      onProgress(facts, currentPuzzleType);
    }
  };
  
  // Reset when puzzle is deactivated
  useEffect(() => {
    if (!isActive) {
      // Reset the initial puzzle type when the screen is deactivated
      initialPuzzleType.current = null;
    }
  }, [isActive]);
  
  // Error handling timeout
  useEffect(() => {
    let errorTimeout;
    if (errorMsg) {
      errorTimeout = setTimeout(() => {
        setErrorMsg('');
      }, 3000);
    }
    
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [errorMsg]);
  
  // Only render when active
  if (!isActive || !puzzle) return null;
  
  // Render the appropriate puzzle
  const renderPuzzle = () => {
    const sharedProps = {
      onProgress: handlePuzzleProgress,
      setErrorMsg: setErrorMsg
    };
    
    // Check the puzzle type to determine which component to render
    const puzzleType = puzzle.type || '';
    
    switch (puzzleType) {
      case 'memory':
        return <MemoryPuzzle {...sharedProps} puzzleColor={puzzle.color} />;
      case 'logic':
        return (
          <LogicPuzzle 
            {...sharedProps} 
            puzzleColor={puzzle.color} 
            difficulty={puzzle.difficulty || 'medium'} 
            theme={puzzle.theme || 'circuits'} 
          />
        );
      case 'shape':
        return (
          <PuzzleGame 
            {...sharedProps} 
            puzzleColor={puzzle.color}
            size={puzzle.size || 5}
            shapes={puzzle.shapes || ['cube', 'sphere', 'cylinder', 'cone', 'torus']}
          />
        );
      default:
        return <Text color="white">Unknown puzzle type: {puzzleType}</Text>;
    }
  };
  
  return (
    <group userData={{ isPuzzleScreen: true }}>
      {/* Background */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      
      {/* Active puzzle */}
      {renderPuzzle()}
      
      {/* Back button */}
      <group position={[-5.5, 3.3, 0]}>
        <mesh
          position={[0, 0, 0]}
          onClick={onBack}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <planeGeometry args={[1.2, 0.5]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        <Text
          position={[0, 0, 0.1]}
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          renderOrder={2}
          depthTest={false}
        >
          ← Back
        </Text>
      </group>
      
      {/* Progress bar - enhanced visibility */}
      <group position={[0, -3.3, 1]} renderOrder={10}>
        {/* Background */}
        <mesh position={[0, 0, 0]} renderOrder={11}>
          <planeGeometry args={[6, 0.4]} />
          <meshBasicMaterial color="#333333" depthTest={false} />
        </mesh>
        
        {/* Progress fill */}
        {progressPercent > 0 && (
          <mesh position={[((progressPercent / 100) * 6 - 6) / 2, 0, 0.01]} renderOrder={12}>
            <planeGeometry args={[progressPercent / 100 * 6, 0.4]} />
            <meshBasicMaterial color={puzzle.color || "#4CAF50"} depthTest={false} />
          </mesh>
        )}
        
        {/* Progress text */}
        <Text
          position={[0, 0, 0.02]}
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          renderOrder={13}
          depthTest={false}
        >
          {`Progress: ${progressPercent}%`}
        </Text>
      </group>
      
      {/* Error message */}
      {errorMsg && (
        <group position={[0, 0, 5]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[6, 1]} />
            <meshBasicMaterial color="#AA0000" transparent opacity={0.9} />
          </mesh>
          
          <Text
            position={[0, 0, 0.1]}
            color="white"
            fontSize={0.2}
            anchorX="center"
            anchorY="middle"
            maxWidth={5.5}
            textAlign="center"
          >
            {errorMsg}
          </Text>
        </group>
      )}
    </group>
  );
};

export default PuzzleScreen; 
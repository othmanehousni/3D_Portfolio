import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const PlayerController = ({ 
  position, 
  setPosition, 
  lookDirection, 
  setLookDirection,
  enabled = true 
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const [firstPersonActive, setFirstPersonActive] = useState(false);
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 0.15
  });

  // Set initial camera position
  useEffect(() => {
    if (position.current) {
      camera.position.set(position.current.x, 1.7, position.current.z);
    }
  }, [camera, position]);

  // Configure controls when they're ready
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      // Configure for FPS-like experience
      controls.enableDamping = true;
      controls.dampingFactor = 0.15;
      controls.rotateSpeed = 0.6;
      controls.panSpeed = 0.5;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.minPolarAngle = 0.1;
      controls.maxPolarAngle = Math.PI - 0.1;
      controls.target.set(
        position.current.x + 0.1, // Slight offset to look forward
        1.7,
        position.current.z - 0.1
      );
      
      // Unlock controls when component mounts
      controls.domElement.style.cursor = 'default';
      controls.autoRotate = false;
    }
  }, [position]);

  // Set up key controls for movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!enabled) return;
      switch (e.code) {
        case 'KeyW':
          moveState.current.forward = true;
          break;
        case 'KeyS':
          moveState.current.backward = true;
          break;
        case 'KeyA':
          moveState.current.left = true;
          break;
        case 'KeyD':
          moveState.current.right = true;
          break;
        case 'Escape':
          if (firstPersonActive) {
            document.exitPointerLock();
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (!enabled) return;
      switch (e.code) {
        case 'KeyW':
          moveState.current.forward = false;
          break;
        case 'KeyS':
          moveState.current.backward = false;
          break;
        case 'KeyA':
          moveState.current.left = false;
          break;
        case 'KeyD':
          moveState.current.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, firstPersonActive]);

  // First-person mouse control setup
  useEffect(() => {
    const canvas = gl.domElement;
    
    // Handle pointer lock changes
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvas;
      setFirstPersonActive(isLocked);
      
      // Enable/disable orbit controls based on first-person mode
      if (controlsRef.current) {
        controlsRef.current.enabled = !isLocked;
      }
    };
    
    // Handle mouse movement for camera rotation
    const handleMouseMove = (event) => {
      if (!firstPersonActive || !enabled) return;
      
      const sensitivity = 0.002;
      camera.rotation.y -= event.movementX * sensitivity;
      camera.rotation.x -= event.movementY * sensitivity;
      
      // Clamp vertical rotation to avoid camera flipping
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
      
      // Update look direction
      if (setLookDirection) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        setLookDirection(direction);
      }
    };
    
    // Enter first-person mode on canvas click
    const enterFirstPerson = () => {
      if (!firstPersonActive && enabled) {
        canvas.requestPointerLock();
      }
    };
    
    // Add event listeners
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', enterFirstPerson);
    
    // Cleanup
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', enterFirstPerson);
      
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [camera, gl, enabled, firstPersonActive, setLookDirection]);

  // Handle movement logic
  useFrame(() => {
    if (!enabled) return;
    
    if (controlsRef.current && position.current) {
      // Update camera target position when not in first-person mode
      if (!firstPersonActive) {
        controlsRef.current.target.set(
          position.current.x + 0.1,
          1.7,
          position.current.z - 0.1
        );
      }

      const { forward, backward, left, right, speed } = moveState.current;
      
      if (forward || backward || left || right) {
        // Get camera direction
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0; // Keep movement on xz plane
        direction.normalize();
        
        // Calculate movement vector
        const moveVector = new THREE.Vector3();
        
        if (forward) moveVector.add(direction);
        if (backward) moveVector.sub(direction);
        
        // Get right vector (perpendicular to direction)
        const rightVector = new THREE.Vector3(direction.z, 0, -direction.x).normalize();
        
        if (right) moveVector.add(rightVector);
        if (left) moveVector.sub(rightVector);
        
        if (moveVector.length() > 0) {
          moveVector.normalize().multiplyScalar(speed);
          position.current.x += moveVector.x;
          position.current.z += moveVector.z;
          
          // Update camera position
          camera.position.x = position.current.x;
          camera.position.z = position.current.z;
          
          if (setPosition) {
            setPosition(position.current);
          }
        }
      }
      
      controlsRef.current.update();
    }
  });

  return (
    <>
      <OrbitControls ref={controlsRef} />
      
      {firstPersonActive && (
        <div style={{ 
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          pointerEvents: 'none'
        }}>
          First-person mode active. Press ESC to exit.
        </div>
      )}
    </>
  );
};

export default PlayerController;
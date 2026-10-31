import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Materials
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xFF4D00,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xF5F5F7,
      transparent: true,
      opacity: 0.04,
      roughness: 0.1,
      metalness: 0.2,
    });

    // Geometries
    const shapes = [];
    const geos = [
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.TorusGeometry(0.7, 0.25, 16, 32),
      new THREE.OctahedronGeometry(0.8, 0),
      new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8),
    ];

    geos.forEach((geo, i) => {
      const wire = new THREE.Mesh(geo, wireMat.clone());
      const solid = new THREE.Mesh(geo, glassMat.clone());
      const group = new THREE.Group();
      group.add(wire);
      group.add(solid);

      const angle = (i / geos.length) * Math.PI * 2;
      group.position.set(
        Math.cos(angle) * 3,
        Math.sin(angle) * 1.5,
        -2 + Math.random() * -2
      );
      group.scale.setScalar(0.6 + Math.random() * 0.5);
      scene.add(group);
      shapes.push({ group, speedX: 0.001 + Math.random() * 0.003, speedY: 0.002 + Math.random() * 0.002 });
    });

    // Light
    const ambientLight = new THREE.AmbientLight(0xF5F5F7, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xFF4D00, 0.5, 20);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!prefersReducedMotion) {
        shapes.forEach(({ group, speedX, speedY }) => {
          group.rotation.x += speedX;
          group.rotation.y += speedY;
        });
        camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, -2);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
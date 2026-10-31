import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Wireframe icosahedron
    const geo = new THREE.IcosahedronGeometry(1.8, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xFF4D00,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const mesh = new THREE.Mesh(geo, wireMat);
    scene.add(mesh);

    // Solid inner
    const innerGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x161618,
      transparent: true,
      opacity: 0.3,
      roughness: 0.2,
      metalness: 0.8
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    const ambientLight = new THREE.AmbientLight(0xF5F5F7, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xFF4D00, 1, 20);
    pointLight.position.set(3, 2, 4);
    scene.add(pointLight);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!prefersReducedMotion) {
        mesh.rotation.x += 0.002;
        mesh.rotation.y += 0.003;
        innerMesh.rotation.x -= 0.001;
        innerMesh.rotation.y -= 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div ref={canvasRef} className="absolute inset-0" />
      
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}>
          
          <p className="font-mono text-xs tracking-[0.4em] text-primary mb-6 uppercase">
            Vallée de Joux, Suisse
          </p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-6">
            PRECISION
            <br />
            <span className="text-primary">PRINTING.</span>
            <br />
            SWISS SOUL.
          </h1>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed mb-10">
            Chaque pièce est imprimée couche par couche avec une précision artisanale, 
            au cœur des montagnes suisses.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}>
          
          <Link
            to="/catalogue"
            className="group inline-flex items-center gap-3 bg-primary/10 border border-primary/30 text-primary px-8 py-4 font-mono text-xs tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-500 hover:scale-105 rounded-[14px]">EXPLORER LE CATALOGUE
→


          </Link>
        </motion.div>
      </div>

      {/* Scan line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>);

}
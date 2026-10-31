import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';

// Season color map for the holographic tint
const SEASON_COLORS = {
  ete: 0xFFB800,
  hiver: 0xBBDDFF,
  automne: 0xFF5500,
};

function createHolographicMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0.8,
    wireframe: false,
    side: THREE.DoubleSide,
  });
}

function createWireMaterial(color) {
  return new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
}

// Build a palm tree group
function buildPalmTree(color) {
  const group = new THREE.Group();
  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.06, 0.1, 1.2, 8);
  group.add(new THREE.Mesh(trunkGeo, createHolographicMaterial(color)));
  group.add(new THREE.Mesh(trunkGeo, createWireMaterial(color)));
  // Leaves (6 cones around top)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const leafGeo = new THREE.ConeGeometry(0.05, 0.6, 6);
    const leaf = new THREE.Group();
    leaf.add(new THREE.Mesh(leafGeo, createHolographicMaterial(color)));
    leaf.add(new THREE.Mesh(leafGeo, createWireMaterial(color)));
    leaf.position.set(Math.cos(angle) * 0.35, 0.7, Math.sin(angle) * 0.35);
    leaf.rotation.z = -Math.PI / 4 * Math.cos(angle);
    leaf.rotation.x = -Math.PI / 4 * Math.sin(angle);
    group.add(leaf);
  }
  // Top ball
  const ballGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const ball = new THREE.Group();
  ball.add(new THREE.Mesh(ballGeo, createHolographicMaterial(color)));
  ball.add(new THREE.Mesh(ballGeo, createWireMaterial(color)));
  ball.position.y = 0.7;
  group.add(ball);
  return group;
}

// Build a starfish group
function buildStarfish(color) {
  const group = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const armGeo = new THREE.CapsuleGeometry(0.07, 0.4, 4, 8);
    const arm = new THREE.Group();
    arm.add(new THREE.Mesh(armGeo, createHolographicMaterial(color)));
    arm.add(new THREE.Mesh(armGeo, createWireMaterial(color)));
    arm.rotation.z = angle;
    arm.position.set(Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0);
    group.add(arm);
  }
  const centerGeo = new THREE.SphereGeometry(0.14, 8, 8);
  group.add(new THREE.Mesh(centerGeo, createHolographicMaterial(color)));
  group.add(new THREE.Mesh(centerGeo, createWireMaterial(color)));
  return group;
}

// Build a snowflake group
function buildSnowflake(color) {
  const group = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const armGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6);
    const arm = new THREE.Group();
    arm.add(new THREE.Mesh(armGeo, createHolographicMaterial(color)));
    arm.add(new THREE.Mesh(armGeo, createWireMaterial(color)));
    arm.rotation.z = angle;
    group.add(arm);
    // Small branches
    for (let b = -1; b <= 1; b += 2) {
      const branchGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
      const branch = new THREE.Group();
      branch.add(new THREE.Mesh(branchGeo, createHolographicMaterial(color)));
      branch.add(new THREE.Mesh(branchGeo, createWireMaterial(color)));
      branch.rotation.z = angle + Math.PI / 4 * b;
      branch.position.set(Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0);
      group.add(branch);
    }
  }
  return group;
}

// Build a gingerbread man
function buildGingerbread(color) {
  const group = new THREE.Group();
  // Body
  const bodyGeo = new THREE.SphereGeometry(0.22, 8, 8);
  bodyGeo.scale(1, 1.2, 0.5);
  group.add(new THREE.Mesh(bodyGeo, createHolographicMaterial(color)));
  group.add(new THREE.Mesh(bodyGeo, createWireMaterial(color)));
  // Head
  const headGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const head = new THREE.Group();
  head.add(new THREE.Mesh(headGeo, createHolographicMaterial(color)));
  head.add(new THREE.Mesh(headGeo, createWireMaterial(color)));
  head.position.y = 0.38;
  group.add(head);
  // Arms
  for (let s of [-1, 1]) {
    const armGeo = new THREE.CapsuleGeometry(0.05, 0.3, 4, 6);
    const arm = new THREE.Group();
    arm.add(new THREE.Mesh(armGeo, createHolographicMaterial(color)));
    arm.add(new THREE.Mesh(armGeo, createWireMaterial(color)));
    arm.rotation.z = s * Math.PI / 3;
    arm.position.set(s * 0.35, 0.1, 0);
    group.add(arm);
  }
  // Legs
  for (let s of [-1, 1]) {
    const legGeo = new THREE.CapsuleGeometry(0.05, 0.35, 4, 6);
    const leg = new THREE.Group();
    leg.add(new THREE.Mesh(legGeo, createHolographicMaterial(color)));
    leg.add(new THREE.Mesh(legGeo, createWireMaterial(color)));
    leg.rotation.z = s * Math.PI / 6;
    leg.position.set(s * 0.12, -0.38, 0);
    group.add(leg);
  }
  return group;
}

// Build a leaf
function buildLeaf(color) {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.2, 0.3, 0, 0.6);
  shape.quadraticCurveTo(-0.2, 0.3, 0, 0);
  const geo = new THREE.ShapeGeometry(shape);
  group.add(new THREE.Mesh(geo, createHolographicMaterial(color)));
  const edges = new THREE.EdgesGeometry(geo);
  group.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })));
  return group;
}

// Page-based position offsets
function getPageOffset(pathname) {
  if (pathname === '/') return { x: 1.5, y: -0.5 };
  if (pathname === '/catalogue') return { x: -1.5, y: 0.5 };
  if (pathname === '/infos') return { x: 0.8, y: 1.0 };
  if (pathname === '/demande') return { x: -0.8, y: -1.0 };
  if (pathname === '/vote') return { x: 1.0, y: 0.8 };
  return { x: 0, y: 0 };
}

export default function SeasonalDecorations({ season }) {
  const mountRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!season || season === 'none') return;
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const color = SEASON_COLORS[season] || 0xFF4D00;
    const offset = getPageOffset(location.pathname);
    const objects = [];

    if (season === 'ete') {
      // 2 palmiers + 1 étoile de mer
      const palm1 = buildPalmTree(color);
      palm1.position.set(-3 + offset.x, -1.5 + offset.y, 1);
      palm1.scale.setScalar(0.9);
      scene.add(palm1);
      objects.push({ group: palm1, speedX: 0.003, speedY: 0.002 });

      const palm2 = buildPalmTree(color);
      palm2.position.set(3.5 + offset.x, -1.2 + offset.y, 1.2);
      palm2.scale.setScalar(0.7);
      scene.add(palm2);
      objects.push({ group: palm2, speedX: 0.002, speedY: 0.003 });

      const star = buildStarfish(color);
      star.position.set(1.5 + offset.x, 2.2 + offset.y, 1);
      star.scale.setScalar(0.8);
      scene.add(star);
      objects.push({ group: star, speedX: 0.004, speedY: 0.002 });

    } else if (season === 'hiver') {
      // 1 pain d'épices + 2 flocons
      const ginger = buildGingerbread(color);
      ginger.position.set(-2.5 + offset.x, -0.5 + offset.y, 1);
      ginger.scale.setScalar(1.0);
      scene.add(ginger);
      objects.push({ group: ginger, speedX: 0.002, speedY: 0.003 });

      const flake1 = buildSnowflake(color);
      flake1.position.set(3 + offset.x, 1.5 + offset.y, 1.5);
      flake1.scale.setScalar(0.7);
      scene.add(flake1);
      objects.push({ group: flake1, speedX: 0.005, speedY: 0.003 });

      const flake2 = buildSnowflake(color);
      flake2.position.set(-3.5 + offset.x, 2 + offset.y, 1);
      flake2.scale.setScalar(0.5);
      scene.add(flake2);
      objects.push({ group: flake2, speedX: 0.003, speedY: 0.005 });

    } else if (season === 'automne') {
      // 4 feuilles mortes
      const positions = [
        [-3, 1.5, 1.2], [2.8, 2, 1], [-1, -2, 1.5], [3.5, -1, 1]
      ];
      positions.forEach(([x, y, z], i) => {
        const leaf = buildLeaf(color);
        leaf.position.set(x + offset.x * 0.5, y + offset.y * 0.5, z);
        leaf.scale.setScalar(0.9 + i * 0.1);
        leaf.rotation.z = Math.random() * Math.PI;
        scene.add(leaf);
        objects.push({ group: leaf, speedX: 0.002 + i * 0.001, speedY: 0.003 + i * 0.001 });
      });
    }

    // Ambient light
    scene.add(new THREE.AmbientLight(color, 0.5));
    const pointLight = new THREE.PointLight(color, 1.0, 20);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      objects.forEach(({ group, speedX, speedY }) => {
        group.rotation.x += speedX;
        group.rotation.y += speedY;
      });
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
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
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [season, location.pathname]);

  if (!season || season === 'none') return null;

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 60 }}
    />
  );
}
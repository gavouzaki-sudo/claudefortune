import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Bridge } from '../bridge';
import { isChantMuted } from '../utils/chantAudio';
import { getSharedAudioContextSync } from '../utils/audioContext';

interface LoyKrathong3DProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onLaunchFireworks?: (count?: number) => void;
}

type KrathongStyle = 'classic' | 'lotus' | 'gold';

interface KrathongConfig {
  id: KrathongStyle;
  name: string;
  icon: string;
  desc: string;
  leafColor: number;
  innerLeafColor: number;
  flowerPrimary: number;
  flowerSecondary: number;
  candleColor: number;
}

const KRATHONG_STYLES: KrathongConfig[] = [
  {
    id: 'classic',
    name: 'ใบตองมงคล',
    icon: '🌿',
    desc: 'ใบตองธรรมชาติ ดอกดาวเรืองทอง บูชาพระแม่คงคาดั้งเดิม',
    leafColor: 0x2e7d32,
    innerLeafColor: 0x4caf50,
    flowerPrimary: 0xffb300,
    flowerSecondary: 0xff8f00,
    candleColor: 0xfff176,
  },
  {
    id: 'lotus',
    name: 'บัวสวรรค์',
    icon: '🪷',
    desc: 'กลีบบัวหลวงสีชมพู เสริมความสงบ ร่มเย็น และความรักบริสุทธิ์',
    leafColor: 0x1b5e20,
    innerLeafColor: 0x388e3c,
    flowerPrimary: 0xf06292,
    flowerSecondary: 0xe91e63,
    candleColor: 0xfff9c4,
  },
  {
    id: 'gold',
    name: 'ทองมหาลาภ',
    icon: '✨',
    desc: 'กลีบทองอร่าม ดอกไม้แก้ว เสริมบารมี ทรัพย์สินเงินทองทวีคูณ',
    leafColor: 0xd4af37,
    innerLeafColor: 0xffd700,
    flowerPrimary: 0xffd54f,
    flowerSecondary: 0xffa726,
    candleColor: 0xffeb3b,
  },
];

const WISH_PRESETS = [
  'ขอขมาพระแม่คงคา ชำระล้างเคราะห์ภัย',
  'ขอให้ชีวิตร่มเย็น มีแต่ความสุข ความเจริญ',
  'ขอให้เงินทองไหลมาเทมา ค้าขายร่ำรวย',
  'ขอให้พบเจอความรักที่ดี ครอบครัวอบอุ่น',
  'ขอให้สุขภาพร่างกายแข็งแรง ไร้โรคาพยาธิ',
];

export const LoyKrathong3D: React.FC<LoyKrathong3DProps> = ({
  bridge,
  onToast,
  onLaunchFireworks,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedStyle, setSelectedStyle] = useState<KrathongStyle>('classic');
  const [selectedWish, setSelectedWish] = useState<string>(WISH_PRESETS[0]);
  const [customWish, setCustomWish] = useState<string>('');
  const [isFloating, setIsFloating] = useState<boolean>(false);
  const [krathongCount, setKrathongCount] = useState<number>(0);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // References for 3D state & animation loop
  const krathongGroupRef = useRef<THREE.Group | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const distantKrathongsRef = useRef<THREE.Group[]>([]);
  const skyLanternsRef = useRef<THREE.Group[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Floating physics animation parameters
  const floatProgressRef = useRef<number>(0);
  const isFloatingRef = useRef<boolean>(false);
  isFloatingRef.current = isFloating;

  const disposeGroupResources = useCallback((obj: THREE.Object3D) => {
    const disposedGeos = new Set<THREE.BufferGeometry>();
    const disposedMats = new Set<THREE.Material>();
    obj.traverse((child) => {
      const mesh = child as THREE.Mesh | THREE.Points;
      if (mesh.geometry && !disposedGeos.has(mesh.geometry)) {
        disposedGeos.add(mesh.geometry);
        mesh.geometry.dispose();
      }
      const mat = (mesh as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => {
          if (m && !disposedMats.has(m)) {
            disposedMats.add(m);
            m.dispose();
          }
        });
      } else if (mat && !disposedMats.has(mat)) {
        disposedMats.add(mat);
        mat.dispose();
      }
    });
  }, []);

  // Sound generator using Web Audio API (Zero external mp3 files)
  const playWaterSplashSound = useCallback(() => {
    if (isChantMuted()) return;
    try {
      const ctx = getSharedAudioContextSync();
      if (!ctx) return;

      // Soft water ripple sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch {
      // AudioContext not allowed before user gesture or unavailable
    }
  }, []);

  // Procedural 3D Krathong Builder (Composite 3-12 distinct parts)
  const buildKrathongModel = useCallback((styleId: KrathongStyle): THREE.Group => {
    const config = KRATHONG_STYLES.find((s) => s.id === styleId) || KRATHONG_STYLES[0];
    const group = new THREE.Group();
    group.name = 'HeroKrathong';

    // 1. Banana Trunk Base (ฐานหยวกกล้วย)
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.35, 0.38, 32);
    // Procedural trunk top & bark material
    const baseMat = new THREE.MeshStandardMaterial({
      color: styleId === 'gold' ? 0xb8860b : 0x33691e,
      roughness: 0.75,
      metalness: styleId === 'gold' ? 0.6 : 0.08,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.19;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Outer Layer Folded Banana Leaf Petals (กลีบพับชั้นนอก)
    const outerPetalCount = 14;
    const outerPetalGeo = new THREE.ConeGeometry(0.35, 0.85, 4);
    outerPetalGeo.scale(1.2, 1, 0.45); // flatten to look like folded leaf petal
    const outerPetalMat = new THREE.MeshStandardMaterial({
      color: config.leafColor,
      roughness: 0.45,
      metalness: styleId === 'gold' ? 0.75 : 0.05,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < outerPetalCount; i++) {
      const angle = (i / outerPetalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(outerPetalGeo, outerPetalMat);
      const r = 1.38;
      petal.position.set(Math.cos(angle) * r, 0.45, Math.sin(angle) * r);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.z = -0.42; // flare outward
      petal.castShadow = true;
      group.add(petal);
    }

    // 3. Inner Layer Folded Banana Leaf Petals (กลีบพับชั้นใน)
    const innerPetalCount = 12;
    const innerPetalGeo = new THREE.ConeGeometry(0.3, 0.7, 4);
    innerPetalGeo.scale(1.1, 1, 0.4);
    const innerPetalMat = new THREE.MeshStandardMaterial({
      color: config.innerLeafColor,
      roughness: 0.38,
      metalness: styleId === 'gold' ? 0.85 : 0.05,
    });

    for (let i = 0; i < innerPetalCount; i++) {
      const angle = (i / innerPetalCount) * Math.PI * 2 + Math.PI / innerPetalCount;
      const petal = new THREE.Mesh(innerPetalGeo, innerPetalMat);
      const r = 1.05;
      petal.position.set(Math.cos(angle) * r, 0.48, Math.sin(angle) * r);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.z = -0.22; // slightly more upright
      petal.castShadow = true;
      group.add(petal);
    }

    // 4. Marigold Flower Ring (ดอกดาวเรืองมงคลสีทอง/ส้ม)
    const flowerMat = new THREE.MeshStandardMaterial({
      color: config.flowerPrimary,
      roughness: 0.85,
      metalness: 0.05,
    });
    const flowerGeo = new THREE.DodecahedronGeometry(0.24, 1);

    const flowerCount = 9;
    for (let i = 0; i < flowerCount; i++) {
      const angle = (i / flowerCount) * Math.PI * 2;
      const flower = new THREE.Mesh(flowerGeo, flowerMat);
      const r = 0.72;
      flower.position.set(Math.cos(angle) * r, 0.48, Math.sin(angle) * r);
      flower.scale.set(1.1, 0.75, 1.1);
      flower.rotation.set(Math.random() * 0.4, angle, Math.random() * 0.4);
      flower.castShadow = true;
      group.add(flower);
    }

    // 5. Center Lotus Petals / Accent Flowers (ดอกบัวหลวง / ดอกไม้ประดับกลาง)
    const centerFlowerMat = new THREE.MeshStandardMaterial({
      color: config.flowerSecondary,
      roughness: 0.5,
      metalness: 0.1,
    });
    const centerFlowerGeo = new THREE.DodecahedronGeometry(0.18, 1);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 0.3;
      const f = new THREE.Mesh(centerFlowerGeo, centerFlowerMat);
      f.position.set(Math.cos(angle) * 0.38, 0.54, Math.sin(angle) * 0.38);
      f.scale.set(1, 0.65, 1);
      group.add(f);
    }

    // 6. Sacred Candle (เทียนชัยสีเหลืองนวล)
    const candleGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.95, 16);
    const candleMat = new THREE.MeshStandardMaterial({
      color: config.candleColor,
      roughness: 0.3,
      metalness: 0.02,
    });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(0, 0.95, -0.05);
    candle.castShadow = true;
    group.add(candle);

    // Candle wick
    const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const wick = new THREE.Mesh(wickGeo, wickMat);
    wick.position.set(0, 1.48, -0.05);
    group.add(wick);

    // 7. Glowing Candle Flame (เปลวเทียนเรืองรอง)
    const flameGeo = new THREE.ConeGeometry(0.08, 0.28, 16);
    flameGeo.translate(0, 0.14, 0);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffd54f,
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 1.54, -0.05);
    flameMeshRef.current = flame;
    group.add(flame);

    // Candle PointLight that casts a warm glow on the flowers and water
    const flameLight = new THREE.PointLight(0xffa726, 3.2, 7.5, 2);
    flameLight.position.set(0, 1.62, -0.05);
    flameLight.castShadow = false;
    flameLightRef.current = flameLight;
    group.add(flameLight);

    // 8. Three Incense Sticks (ธูปทอง 3 ดอก บูชาพระรัตนตรัย)
    const incenseGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.15, 8);
    const incenseMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.9,
    });

    const tipGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });

    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(incenseGeo, incenseMat);
      stick.position.set(i * 0.08, 0.92, 0.25);
      stick.rotation.x = -0.18;
      stick.rotation.z = i * 0.06;
      group.add(stick);

      // Glowing ember tip
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(i * 0.08, 1.48, 0.16);
      group.add(tip);
    }

    // 9. Auspicious Gold Coins in the flower bed (เหรียญมงคลขอขมาแม่คงคา)
    const coinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.92,
      roughness: 0.18,
    });
    const coin1 = new THREE.Mesh(coinGeo, coinMat);
    coin1.position.set(-0.25, 0.52, 0.28);
    coin1.rotation.set(0.15, 0.4, 0.1);
    group.add(coin1);

    const coin2 = new THREE.Mesh(coinGeo, coinMat);
    coin2.position.set(0.3, 0.52, 0.22);
    coin2.rotation.set(-0.1, -0.3, 0.15);
    group.add(coin2);

    return group;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    scene.fog = new THREE.FogExp2(0x060914, 0.035);

    // Camera: Elevated perspective overlooking the river
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 5.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(renderer.domElement);

    // OrbitControls: Allow fluid 360 inspection
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip below water level
    controls.minDistance = 2.4;
    controls.maxDistance = 14;
    controls.target.set(0, 0.6, 0);
    controlsRef.current = controls;

    // Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting: Cool Moonlit River Night + Warm Candle Key Light
    const hemiLight = new THREE.HemisphereLight(0x4a6984, 0x050b14, 0.85);
    scene.add(hemiLight);

    const moonLight = new THREE.DirectionalLight(0xaed8f2, 1.4);
    moonLight.position.set(6, 12, -8);
    moonLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      moonLight.shadow.mapSize.width = 1024;
      moonLight.shadow.mapSize.height = 1024;
      moonLight.shadow.bias = -0.0005;
    }
    scene.add(moonLight);

    // Glowing Full Moon Mesh in the distant sky (🌕 คืนเพ็ญเดือน ๑๒)
    const moonGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfff9db });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(6, 11, -26);
    scene.add(moonMesh);

    // Moon Glow Halo
    const moonHaloGeo = new THREE.RingGeometry(1.65, 3.2, 32);
    const moonHaloMat = new THREE.MeshBasicMaterial({
      color: 0xfff0b3,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const moonHalo = new THREE.Mesh(moonHaloGeo, moonHaloMat);
    moonHalo.position.copy(moonMesh.position);
    moonHalo.position.z += 0.05;
    scene.add(moonHalo);

    // Floating Sky Lanterns in background (โคมลอยยามค่ำคืน)
    const skyLanterns: THREE.Group[] = [];
    const lanternGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.45, 12);
    const lanternMat = new THREE.MeshBasicMaterial({
      color: 0xffb74d,
      transparent: true,
      opacity: 0.88,
    });

    for (let i = 0; i < 28; i++) {
      const lanternGroup = new THREE.Group();
      const lMesh = new THREE.Mesh(lanternGeo, lanternMat);
      lanternGroup.add(lMesh);

      // Random starting positions high in sky
      const lx = (Math.random() - 0.5) * 36;
      const ly = 3 + Math.random() * 12;
      const lz = -8 - Math.random() * 24;
      lanternGroup.position.set(lx, ly, lz);
      lanternGroup.scale.setScalar(0.5 + Math.random() * 0.7);

      scene.add(lanternGroup);
      skyLanterns.push(lanternGroup);
    }
    skyLanternsRef.current = skyLanterns;

    // Distant background floating Krathongs
    const distantKrathongs: THREE.Group[] = [];
    const dkBaseGeo = new THREE.CylinderGeometry(0.45, 0.4, 0.12, 12);
    const dkBaseMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
    const dkFlameGeo = new THREE.ConeGeometry(0.06, 0.18, 8);
    const dkFlameMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });

    for (let i = 0; i < 16; i++) {
      const dkGroup = new THREE.Group();
      const b = new THREE.Mesh(dkBaseGeo, dkBaseMat);
      b.position.y = 0.06;
      dkGroup.add(b);

      const f = new THREE.Mesh(dkFlameGeo, dkFlameMat);
      f.position.y = 0.32;
      dkGroup.add(f);

      const fl = new THREE.PointLight(0xffa726, 0.9, 3);
      fl.position.y = 0.35;
      dkGroup.add(fl);

      const rx = (Math.random() - 0.5) * 22;
      const rz = -3 - Math.random() * 18;
      dkGroup.position.set(rx, 0, rz);
      scene.add(dkGroup);
      distantKrathongs.push(dkGroup);
    }
    distantKrathongsRef.current = distantKrathongs;

    // River Water Surface (แม่น้ำยามค่ำคืน)
    const waterGeo = new THREE.PlaneGeometry(60, 60, 48, 48);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x051622,
      roughness: 0.15,
      metalness: 0.85,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0;
    waterMesh.receiveShadow = !isSoftwareGl;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // Incense Smoke Particle System
    const smokeCount = 35;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = (Math.random() - 0.5) * 0.15;
      smokePositions[i * 3 + 1] = 1.45 + (i / smokeCount) * 0.9;
      smokePositions[i * 3 + 2] = 0.18 + (Math.random() - 0.5) * 0.15;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.045,
      transparent: true,
      opacity: 0.35,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    smokeParticlesRef.current = smokePoints;

    // Build Initial Hero Krathong
    const heroKrathong = buildKrathongModel(selectedStyle);
    heroKrathong.position.set(0, 0, 0);
    heroKrathong.add(smokePoints);
    scene.add(heroKrathong);
    krathongGroupRef.current = heroKrathong;

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation & Physics Loop
    let animationFrameId = 0;
    let isDisposed = false;
    const targetVec = new THREE.Vector3();
    const timer = new THREE.Timer();

    function afterDraw(cb: () => void) {
      if (isDisposed || document.hidden) return;
      const gl = renderer.getContext() as WebGL2RenderingContext | null;
      if (!gl || typeof gl.fenceSync !== 'function') {
        animationFrameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed || document.hidden) {
          animationFrameId = 0;
          if (sync && typeof gl.deleteSync === 'function') {
            gl.deleteSync(sync);
          }
          return;
        }
        const state = sync && typeof gl.getSyncParameter === 'function' ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : null;
        if (state === gl.UNSIGNALED) {
          animationFrameId = window.setTimeout(poll, 5);
        } else {
          if (sync && typeof gl.deleteSync === 'function') {
            gl.deleteSync(sync);
          }
          animationFrameId = window.setTimeout(cb, 80);
        }
      };
      animationFrameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      animationFrameId = 0;
      if (isDisposed || document.hidden) return;
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.05);
      const time = timer.getElapsed();

      // Candle Flame Flicker animation
      if (flameLightRef.current && flameMeshRef.current) {
        const flicker = Math.sin(time * 14) * 0.15 + Math.cos(time * 23) * 0.08;
        flameLightRef.current.intensity = 3.2 + flicker * 1.5;
        const scaleFlicker = 1 + flicker * 0.2;
        flameMeshRef.current.scale.set(scaleFlicker, 1 + flicker * 0.3, scaleFlicker);
      }

      // Gentle Water Wave bobbing physics on Hero Krathong
      const hero = krathongGroupRef.current;
      if (hero) {
        const waveY = Math.sin(time * 2.2) * 0.035;
        const rollZ = Math.cos(time * 1.6) * 0.018;
        const pitchX = Math.sin(time * 1.8) * 0.015;

        if (isFloatingRef.current) {
          // Drifting downstream along the river
          floatProgressRef.current += delta * 0.75;
          const driftZ = -floatProgressRef.current * 1.8;
          const driftX = Math.sin(floatProgressRef.current * 0.8) * 0.9;
          hero.position.set(driftX, waveY, driftZ);
          hero.rotation.set(pitchX, time * 0.12, rollZ);

          // Camera smoothly tracks floating krathong
          if (cameraRef.current && controlsRef.current) {
            targetVec.set(driftX * 0.6, 0.4, driftZ + 0.5);
            controlsRef.current.target.lerp(targetVec, 0.03);
          }
        } else {
          // Gently bobbing in place ready to launch
          hero.position.y = waveY;
          hero.rotation.z = rollZ;
          hero.rotation.x = pitchX;
          hero.rotation.y = time * 0.05;
        }
      }

      // Distant Krathongs gently floating downstream
      distantKrathongs.forEach((dk, i) => {
        dk.position.z += delta * (0.35 + (i % 3) * 0.15);
        dk.position.y = Math.sin(time * 2 + i) * 0.02;
        if (dk.position.z > 6) {
          dk.position.z = -22 - Math.random() * 4;
          dk.position.x = (Math.random() - 0.5) * 24;
        }
      });

      // Sky Lanterns gently drifting up into night sky
      skyLanterns.forEach((sl, i) => {
        sl.position.y += delta * (0.25 + (i % 4) * 0.08);
        sl.position.x += Math.sin(time * 0.5 + i) * 0.01;
        if (sl.position.y > 18) {
          sl.position.y = 2 + Math.random() * 2;
          sl.position.z = -10 - Math.random() * 22;
        }
      });

      // Incense Smoke rise animation
      if (smokeParticlesRef.current) {
        const posAttr = smokeParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < smokeCount; i++) {
          let y = posAttr.getY(i) + delta * 0.28;
          let x = posAttr.getX(i) + Math.sin(time * 2 + i) * 0.002;
          if (y > 2.2) {
            y = 1.48;
            x = (Math.random() - 0.5) * 0.06;
          }
          posAttr.setY(i, y);
          posAttr.setX(i, x);
        }
        posAttr.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else if (!isDisposed && !document.hidden) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId) {
          if (isSoftwareGl) {
            clearTimeout(animationFrameId);
          } else {
            cancelAnimationFrame(animationFrameId);
          }
          animationFrameId = 0;
        }
      } else if (!isDisposed && !animationFrameId) {
        timer.update();
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!document.hidden) {
      tick();
    }

    // Cleanup on unmount
    return () => {
      isDisposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        if (isSoftwareGl) {
          clearTimeout(animationFrameId);
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      }
      disposeGroupResources(scene);
      if (scene.environment) {
        scene.environment.dispose();
      }
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [buildKrathongModel, disposeGroupResources]);

  // Handle changing Krathong 3D Style
  const handleSelectStyle = (style: KrathongStyle) => {
    setSelectedStyle(style);
    if (!krathongGroupRef.current) return;

    // Replace hero krathong mesh in scene
    const oldGroup = krathongGroupRef.current;
    const parent = oldGroup.parent;
    if (parent) {
      if (smokeParticlesRef.current) {
        oldGroup.remove(smokeParticlesRef.current);
      }
      parent.remove(oldGroup);
      disposeGroupResources(oldGroup);
      const newModel = buildKrathongModel(style);
      newModel.position.set(0, 0, 0);
      if (smokeParticlesRef.current) {
        newModel.add(smokeParticlesRef.current);
      }
      parent.add(newModel);
      krathongGroupRef.current = newModel;
    }

    onToast(`เปลี่ยนกระทงเป็น: ${KRATHONG_STYLES.find((s) => s.id === style)?.name}`);
  };

  // Handle Floating Krathong (ปล่อยลอยสู่สายน้ำ)
  const handleFloatKrathong = () => {
    if (isFloating) return;

    setIsFloating(true);
    setIsControlsCollapsed(true); // ซ่อนเมนูด้านล่างทันทีเมื่อกดปล่อยกระทง
    playWaterSplashSound();
    setKrathongCount((prev) => prev + 1);

    // Launch celebratory fireworks in sky
    if (onLaunchFireworks) {
      onLaunchFireworks(5);
    }

    try {
      const res = bridge.blessing(3);
      if (res?.lucky) {
        onToast(`🪷 ปล่อยกระทงขอขมาสู่สายน้ำแล้ว · เลขมงคลวันเพ็ญ: ${res.lucky}`);
      } else {
        onToast('🪷 น้อมจิตอธิษฐาน ลอยกระทงขอขมาพระแม่คงคาสู่สายน้ำ...');
      }
    } catch {
      onToast('🪷 น้อมจิตอธิษฐาน ลอยกระทงขอขมาพระแม่คงคาสู่สายน้ำ...');
    }
  };

  // Handle Reset / Float New Krathong
  const handleResetKrathong = () => {
    setIsFloating(false);
    setIsControlsCollapsed(false); // แสดงเมนูสำหรับการเตรียมกระทงใบใหม่
    floatProgressRef.current = 0;

    if (krathongGroupRef.current) {
      krathongGroupRef.current.position.set(0, 0, 0);
      krathongGroupRef.current.rotation.set(0, 0, 0);
    }

    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 3.2, 5.5);
      controlsRef.current.target.set(0, 0.6, 0);
      controlsRef.current.update();
    }

    onToast('นำกระทงใบใหม่มาเตรียมอธิษฐานลอยสู่สายน้ำ');
  };

  const finalWish = customWish.trim() || selectedWish;

  return (
    <div className="loy-krathong-3d-wrapper">
      {/* 3D WebGL Canvas Viewport (100% Unobstructed central view) */}
      <div
        ref={mountRef}
        className="loy-krathong-3d-canvas-container"
        role="region"
        aria-label="แม่น้ำและกระทง 3 มิติยามค่ำคืนวันเพ็ญ"
      />

      {/* Top Festival Header Badge: Compact & Frameless */}
      <div className="loy-3d-header-badge">
        <span className="badge-seal">🌕 คืนเพ็ญเดือน ๑๒</span>
      </div>

      {/* Unified Bottom Control Dock (Zero Viewport Occlusion, Collapsible) */}
      <div className={`loy-bottom-dock ${isControlsCollapsed ? 'collapsed' : ''}`}>
        <div className="dock-toggle-row">
          <button
            type="button"
            className="dock-toggle-btn"
            onClick={() => setIsControlsCollapsed((prev) => !prev)}
            aria-label={isControlsCollapsed ? 'แสดงแผงควบคุม' : 'ซ่อนแผงควบคุม'}
          >
            {isControlsCollapsed ? '▴ แสดงเมนูกระทง' : '▾ ซ่อนเมนู (ชมวิวเต็มจอ)'}
          </button>
        </div>

        {!isControlsCollapsed && (
          <div className="dock-content-inner">
            {/* Style Selector Pills */}
            <div className="dock-section">
              <span className="dock-label">เลือกรูปแบบกระทง:</span>
              <div className="krathong-style-pills">
                {KRATHONG_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`krathong-style-pill ${selectedStyle === style.id ? 'active' : ''}`}
                    onClick={() => handleSelectStyle(style.id)}
                    disabled={isFloating}
                  >
                    <span>{style.icon}</span>
                    <span>{style.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wish Presets / Input */}
            <div className="dock-section">
              <span className="dock-label">คำอธิษฐานขอพร:</span>
              <div className="wish-presets-row">
                {WISH_PRESETS.slice(0, 3).map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`wish-preset-chip ${selectedWish === w && !customWish ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedWish(w);
                      setCustomWish('');
                    }}
                    disabled={isFloating}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="custom-wish-input"
                placeholder="หรือพิมพ์คำอธิษฐานของคุณเอง..."
                value={customWish}
                onChange={(e) => setCustomWish(e.target.value)}
                maxLength={80}
                disabled={isFloating}
              />
            </div>

            {/* Float Action Button */}
            <div className="dock-action-row">
              {isFloating ? (
                <div className="floating-status-inline">
                  <span className="floating-wish-pill">
                    ✨ “{finalWish}” กำลังลอยสู่สายน้ำ
                  </span>
                  <button
                    type="button"
                    className="btn primary glow-gold btn-float-action"
                    onClick={handleResetKrathong}
                  >
                    <span>🔄 นำกระทงใบใหม่มาลอย (ลอยแล้ว {krathongCount} ใบ)</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn primary glow-gold btn-float-action"
                  onClick={handleFloatKrathong}
                >
                  <span>🪷 ปล่อยกระทงสู่สายน้ำ</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Lerp helper ─────────────────────────────────────────────────────────────
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ─── Easing ──────────────────────────────────────────────────────────────────
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function VirtualAvatar3D({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ isListening, isSpeaking, isThinking });

  // Keep state ref in sync so the animation loop reads latest value
  useEffect(() => {
    stateRef.current = { isListening, isSpeaking, isThinking };
  }, [isListening, isSpeaking, isThinking]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene Setup ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const W = mount.clientWidth || 320;
    const H = mount.clientHeight || 380;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // ── Lights ───────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x22d3ee, 2.2); // cyan key
    keyLight.position.set(3, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x14b8a6, 1.0); // teal fill
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x0ea5e9, 0.7); // sky rim
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // Warm under-glow
    const bottomGlow = new THREE.PointLight(0x2dd4bf, 1.5, 8);
    bottomGlow.position.set(0, -2.8, 1);
    scene.add(bottomGlow);

    // ── Materials ────────────────────────────────────────────────────────────
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd1faf4,
      metalness: 0.05,
      roughness: 0.08,
      transmission: 0.55,
      thickness: 0.8,
      transparent: true,
      opacity: 0.82,
      envMapIntensity: 1.2,
    });
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f766e,
      metalness: 0.6,
      roughness: 0.22,
      reflectivity: 0.9,
    });
    const accentMat = new THREE.MeshPhysicalMaterial({
      color: 0x22d3ee,
      metalness: 0.3,
      roughness: 0.15,
      emissive: new THREE.Color(0x22d3ee),
      emissiveIntensity: 0.45,
    });
    const eyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: new THREE.Color(0x06b6d4),
      emissiveIntensity: 1.2,
      metalness: 0.1,
      roughness: 0.05,
    });
    const mouthMat = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6,
      emissive: new THREE.Color(0x14b8a6),
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.1,
    });
    const darkMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.3,
    });
    const antennaMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.15,
    });
    const antennaGlowMat = new THREE.MeshPhysicalMaterial({
      color: 0x22d3ee,
      emissive: new THREE.Color(0x22d3ee),
      emissiveIntensity: 1.5,
    });

    // ── Root pivot (for floating / head rotation) ─────────────────────────────
    const root = new THREE.Group();
    scene.add(root);

    const headPivot = new THREE.Group();
    root.add(headPivot);

    // ── Head sphere (glass) ───────────────────────────────────────────────────
    const headGeo = new THREE.SphereGeometry(1.1, 64, 64);
    const head = new THREE.Mesh(headGeo, glassMat);
    head.position.y = 0.2;
    head.castShadow = true;
    headPivot.add(head);

    // Inner circuit glow ball
    const innerGlowGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const innerGlowMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f766e,
      emissive: new THREE.Color(0x0d9488),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.6,
    });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    innerGlow.position.y = 0.2;
    headPivot.add(innerGlow);

    // ── Eyes (LED pill shapes) ────────────────────────────────────────────────
    const eyeGeo = new THREE.CapsuleGeometry(0.085, 0.22, 8, 16);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat.clone());
    leftEye.rotation.z = Math.PI / 2;
    leftEye.position.set(-0.35, 0.28, 0.98);
    headPivot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat.clone());
    rightEye.rotation.z = Math.PI / 2;
    rightEye.position.set(0.35, 0.28, 0.98);
    headPivot.add(rightEye);

    // Eye glint rings
    const glintGeo = new THREE.TorusGeometry(0.13, 0.012, 8, 32);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    const leftGlint = new THREE.Mesh(glintGeo, glintMat);
    leftGlint.position.set(-0.35, 0.28, 1.02);
    headPivot.add(leftGlint);
    const rightGlint = new THREE.Mesh(glintGeo, glintMat);
    rightGlint.position.set(0.35, 0.28, 1.02);
    headPivot.add(rightGlint);

    // ── Mouth (LED bar) ───────────────────────────────────────────────────────
    const mouthGeo = new THREE.CapsuleGeometry(0.065, 0.28, 8, 16);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(0, -0.1, 1.0);
    headPivot.add(mouth);

    // ── Antennas ──────────────────────────────────────────────────────────────
    const antennaGeo = new THREE.CylinderGeometry(0.025, 0.018, 0.75, 8);
    const leftAntenna = new THREE.Mesh(antennaGeo, antennaMat);
    leftAntenna.position.set(-0.45, 1.18, 0.1);
    leftAntenna.rotation.z = 0.3;
    headPivot.add(leftAntenna);

    const rightAntenna = new THREE.Mesh(antennaGeo, antennaMat);
    rightAntenna.position.set(0.45, 1.18, 0.1);
    rightAntenna.rotation.z = -0.3;
    headPivot.add(rightAntenna);

    // Antenna tip balls
    const antennaTipGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const leftTip = new THREE.Mesh(antennaTipGeo, antennaGlowMat.clone());
    leftTip.position.set(-0.65, 1.52, 0.21);
    headPivot.add(leftTip);

    const rightTip = new THREE.Mesh(antennaTipGeo, antennaGlowMat.clone());
    rightTip.position.set(0.65, 1.52, 0.21);
    headPivot.add(rightTip);

    // ── Neck ─────────────────────────────────────────────────────────────────
    const neckGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.3, 16);
    const neck = new THREE.Mesh(neckGeo, darkMat);
    neck.position.y = -0.78;
    root.add(neck);

    // ── Body (torso) ──────────────────────────────────────────────────────────
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = -1.7;
    root.add(bodyGroup);

    // Main torso
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.7, 1.1, 24);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    bodyGroup.add(torso);

    // Chest accent panel
    const chestGeo = new THREE.BoxGeometry(0.72, 0.42, 0.06);
    const chestPanel = new THREE.Mesh(chestGeo, accentMat);
    chestPanel.position.set(0, 0.1, 0.62);
    bodyGroup.add(chestPanel);

    // Chest glow lines (horizontal)
    for (let i = 0; i < 3; i++) {
      const lineGeo = new THREE.BoxGeometry(0.5, 0.028, 0.07);
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.85,
      });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, 0.15 - i * 0.12, 0.65);
      bodyGroup.add(line);
    }

    // Shoulder caps
    const shoulderGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const leftShoulder = new THREE.Mesh(shoulderGeo, accentMat);
    leftShoulder.position.set(-0.68, 0.3, 0);
    bodyGroup.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeo, accentMat);
    rightShoulder.position.set(0.68, 0.3, 0);
    bodyGroup.add(rightShoulder);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.72, 12);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.78, -0.2, 0);
    leftArm.rotation.z = 0.18;
    bodyGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.78, -0.2, 0);
    rightArm.rotation.z = -0.18;
    bodyGroup.add(rightArm);

    // Base disc
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.88, 0.18, 32);
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d9488,
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(0x0d9488),
      emissiveIntensity: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.64;
    bodyGroup.add(base);

    // Hover glow ring under base
    const glowRingGeo = new THREE.TorusGeometry(0.95, 0.055, 8, 64);
    const glowRingMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.5,
    });
    const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
    glowRing.position.y = -0.76;
    bodyGroup.add(glowRing);

    // ── Mouse tracking ────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };

    function onMouseMove(e) {
      const rect = mount.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetRot.y = ((e.clientX - cx) / window.innerWidth) * 0.55;
      targetRot.x = -((e.clientY - cy) / window.innerHeight) * 0.35;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize handler ────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    // ── Animation state machine ───────────────────────────────────────────────
    let blinkTimer = 3.0;
    let blinkPhase = 0; // 0=open, 1=closing, 2=open
    let blinkT = 0;
    let mouthOpenT = 0;
    let thinkingSpinT = 0;
    let listeningPulseT = 0;
    let antennaT = 0;

    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const { isListening: listening, isSpeaking: speaking, isThinking: thinking } =
        stateRef.current;

      // ── Floating bob ──────────────────────────────────────────────────────
      root.position.y = Math.sin(elapsed * 1.05) * 0.12;

      // ── Breathing subtle body scale ───────────────────────────────────────
      const breathScale = 1 + Math.sin(elapsed * 1.6) * 0.013;
      bodyGroup.scale.x = breathScale;
      bodyGroup.scale.z = breathScale;

      // ── Head rotation toward mouse ────────────────────────────────────────
      const rotSpeed = thinking ? 0.025 : listening ? 0.04 : 0.06;
      currentRot.x = lerp(currentRot.x, targetRot.x, rotSpeed);
      currentRot.y = lerp(currentRot.y, targetRot.y, rotSpeed);
      headPivot.rotation.x = currentRot.x;
      headPivot.rotation.y = currentRot.y;

      // Listening: lean forward slightly
      if (listening) {
        root.rotation.x = lerp(root.rotation.x, -0.15, 0.05);
      } else {
        root.rotation.x = lerp(root.rotation.x, 0, 0.04);
      }

      // Thinking: tilt head to side
      if (thinking) {
        headPivot.rotation.z = lerp(headPivot.rotation.z, 0.22, 0.04);
      } else {
        headPivot.rotation.z = lerp(headPivot.rotation.z, 0, 0.04);
      }

      // Speaking: gentle nodding
      if (speaking) {
        headPivot.rotation.x += Math.sin(elapsed * 6.5) * 0.04;
      }

      // ── Blink logic ────────────────────────────────────────────────────────
      blinkTimer -= dt;
      if (blinkTimer <= 0 && blinkPhase === 0) {
        blinkPhase = 1;
        blinkT = 0;
        blinkTimer = 2.5 + Math.random() * 3.5;
      }
      if (blinkPhase === 1) {
        blinkT = Math.min(blinkT + dt * 9, 1);
        const s = blinkT < 0.5 ? blinkT * 2 : 2 - blinkT * 2;
        const yScale = 1 - s * 0.92;
        leftEye.scale.y = yScale;
        rightEye.scale.y = yScale;
        if (blinkT >= 1) { blinkPhase = 0; leftEye.scale.y = 1; rightEye.scale.y = 1; }
      }

      // ── Eye emissive state ─────────────────────────────────────────────────
      const eyeTargetIntensity = thinking ? 0.5 + Math.sin(elapsed * 4) * 0.4 : listening ? 1.8 : speaking ? 1.4 : 1.2;
      leftEye.material.emissiveIntensity = lerp(leftEye.material.emissiveIntensity, eyeTargetIntensity, 0.08);
      rightEye.material.emissiveIntensity = lerp(rightEye.material.emissiveIntensity, eyeTargetIntensity, 0.08);

      // Thinking: eye color shifts to purple scan
      if (thinking) {
        thinkingSpinT += dt * 1.5;
        const tCol = new THREE.Color().setHSL(0.75 + Math.sin(thinkingSpinT) * 0.1, 0.9, 0.6);
        leftEye.material.emissive.lerp(tCol, 0.07);
        rightEye.material.emissive.lerp(tCol, 0.07);
      } else {
        const normalCol = new THREE.Color(0x06b6d4);
        leftEye.material.emissive.lerp(normalCol, 0.06);
        rightEye.material.emissive.lerp(normalCol, 0.06);
      }

      // ── Mouth animation ────────────────────────────────────────────────────
      if (speaking) {
        mouthOpenT += dt * 8.5;
        const mouthScale = 1 + Math.abs(Math.sin(mouthOpenT)) * 1.6;
        mouth.scale.y = mouthScale;
        mouth.scale.x = 1 + Math.abs(Math.sin(mouthOpenT * 0.7)) * 0.25;
        mouth.material.emissiveIntensity = 0.8 + Math.abs(Math.sin(mouthOpenT)) * 0.7;
      } else {
        mouth.scale.y = lerp(mouth.scale.y, 1, 0.12);
        mouth.scale.x = lerp(mouth.scale.x, 1, 0.12);
        mouth.material.emissiveIntensity = lerp(mouth.material.emissiveIntensity, 0.4, 0.07);
      }

      // ── Antenna tips animation ─────────────────────────────────────────────
      antennaT += dt;
      const antennaBase = listening ? 2.2 : thinking ? 1.6 : 0.7;
      const antennaSpeed = listening ? 4.5 : thinking ? 2.8 : 1.3;
      const leftGlow = antennaBase + Math.sin(antennaT * antennaSpeed) * 0.8;
      const rightGlow = antennaBase + Math.sin(antennaT * antennaSpeed + Math.PI) * 0.8;
      leftTip.material.emissiveIntensity = leftGlow;
      rightTip.material.emissiveIntensity = rightGlow;

      // Listening: tips glow green
      if (listening) {
        listeningPulseT += dt;
        const listeningCol = new THREE.Color().setHSL(0.35, 0.9, 0.55);
        leftTip.material.emissive.lerp(listeningCol, 0.1);
        rightTip.material.emissive.lerp(listeningCol, 0.1);
      } else {
        const defaultCol = new THREE.Color(0x22d3ee);
        leftTip.material.emissive.lerp(defaultCol, 0.06);
        rightTip.material.emissive.lerp(defaultCol, 0.06);
      }

      // ── Inner glow pulse ───────────────────────────────────────────────────
      const innerIntensity = thinking
        ? 0.6 + Math.sin(elapsed * 4.5) * 0.4
        : speaking
        ? 0.9 + Math.sin(elapsed * 7) * 0.35
        : 0.5 + Math.sin(elapsed * 1.8) * 0.15;
      innerGlow.material.emissiveIntensity = innerIntensity;

      // ── Glow ring pulse ────────────────────────────────────────────────────
      glowRing.material.opacity = 0.3 + Math.sin(elapsed * 1.5) * 0.15;

      // ── Body chest panel pulse ─────────────────────────────────────────────
      chestPanel.material.emissiveIntensity = speaking
        ? 0.5 + Math.abs(Math.sin(elapsed * 5)) * 0.5
        : 0.2 + Math.sin(elapsed * 1.2) * 0.1;

      // ── Bottom glow color ─────────────────────────────────────────────────
      bottomGlow.color.setHSL(
        0.5 + Math.sin(elapsed * 0.5) * 0.04,
        0.8,
        speaking ? 0.55 : listening ? 0.52 : 0.48
      );
      bottomGlow.intensity = speaking ? 2.0 + Math.sin(elapsed * 7) * 0.5 : 1.3;

      renderer.render(scene, camera);
    }

    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []); // run once — state read through ref

  return (
    <div
      ref={mountRef}
      className="h-full w-full"
      style={{ cursor: "crosshair" }}
    />
  );
}

/* ===================================================
   GRAN TORINO — Script principal
   Three.js 3D Burger + GSAP animations + interactions
   =================================================== */

// ============ LOADER ============
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
    animateHeroEntrance();
  }, 1200);
});

// ============ NAVBAR SCROLL ============
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

// ============ MOBILE MENU ============
const burger = document.querySelector(".nav-burger");
const mobileMenu = document.getElementById("mobile-menu");
burger.addEventListener("click", () => {
  burger.classList.toggle("active");
  mobileMenu.classList.toggle("open");
  document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
});
mobileMenu.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    burger.classList.remove("active");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  });
});

// ============ HERO ENTRANCE ANIMATION (GSAP) ============
function animateHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 })
    .to(".hero-line", { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, "-=0.4")
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
    .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");
}

// ============ SCROLL REVEAL ============
function initReveal() {
  const reveals = document.querySelectorAll(
    ".menu-card, .ingredient-card, .review-card, .section-header, #cta-section h2, #cta-section p, .cta-buttons"
  );
  reveals.forEach((el, i) => {
    el.classList.add("reveal");
    el.classList.add("reveal-delay-" + ((i % 6) + 1));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "-50px" }
  );
  reveals.forEach((el) => observer.observe(el));
}
initReveal();

// ============ SMOOTH SCROLL FOR NAV ============
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// ============ STAT COUNTER ANIMATION ============
function animateStats() {
  const stats = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.target);
          const isDecimal = target % 1 !== 0;
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
        } else {
          entry.target.textContent = "0";
        }
      });
    },
    { threshold: 0.3 }
  );
  stats.forEach((s) => observer.observe(s));
}
animateStats();

// ============ THREE.JS 3D BURGER ============
(function init3D() {
  const container = document.getElementById("hero-3d");
  if (!container) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 3, 7);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // -------- LIGHTS --------
  // Warm key light (cinematic orange)
  const keyLight = new THREE.SpotLight(0xff8844, 3, 25, Math.PI / 5, 0.6);
  keyLight.position.set(5, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  // Cool fill light (blue-ish)
  const fillLight = new THREE.DirectionalLight(0x4466aa, 0.5);
  fillLight.position.set(-4, 3, -2);
  scene.add(fillLight);

  // Rim light (orange accent from behind)
  const rimLight = new THREE.PointLight(0xff6b35, 2, 15);
  rimLight.position.set(-3, 2, -4);
  scene.add(rimLight);

  // Top accent light
  const topLight = new THREE.PointLight(0xffffff, 0.8, 10);
  topLight.position.set(0, 8, 0);
  scene.add(topLight);

  // Ambient
  const ambient = new THREE.AmbientLight(0x221100, 0.5);
  scene.add(ambient);

  // -------- BUILD BURGER --------
  const burgerGroup = new THREE.Group();

  // Helper: rounded cylinder (lathe shape for buns)
  function createBun(radiusTop, radiusBottom, height, segments, isTop) {
    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let r, y;
      if (isTop) {
        // Dome shape for top bun
        y = t * height;
        const curve = Math.sin(t * Math.PI * 0.5);
        r = radiusBottom + (radiusTop - radiusBottom) * t;
        r = r * (1 - curve * 0.15);
        if (t > 0.7) {
          r *= 1 - (t - 0.7) / 0.3 * 0.6;
        }
      } else {
        // Flat bottom bun
        y = t * height;
        r = radiusBottom + (radiusTop - radiusBottom) * t;
        if (t < 0.2) {
          r *= 0.85 + t / 0.2 * 0.15;
        }
      }
      points.push(new THREE.Vector2(Math.max(r, 0.01), y));
    }
    return new THREE.LatheGeometry(points, segments);
  }

  // -- Bottom Bun --
  const bottomBunGeom = createBun(1.6, 1.5, 0.35, 48, false);
  const bunMat = new THREE.MeshStandardMaterial({
    color: 0xd4943a,
    roughness: 0.7,
    metalness: 0.05,
  });
  const bottomBun = new THREE.Mesh(bottomBunGeom, bunMat);
  bottomBun.position.y = -0.5;
  bottomBun.castShadow = true;
  burgerGroup.add(bottomBun);

  // -- Patty 1 (bottom) --
  const pattyGeom = new THREE.CylinderGeometry(1.45, 1.45, 0.22, 48);
  const pattyMat = new THREE.MeshStandardMaterial({
    color: 0x3d1f0a,
    roughness: 0.85,
    metalness: 0.05,
  });
  const patty1 = new THREE.Mesh(pattyGeom, pattyMat);
  patty1.position.y = 0.0;
  patty1.castShadow = true;
  burgerGroup.add(patty1);

  // -- Cheddar cheese (slightly melted, draped) --
  const cheeseGeom = new THREE.BoxGeometry(2.2, 0.06, 2.2, 8, 1, 8);
  const cheeseMat = new THREE.MeshStandardMaterial({
    color: 0xf5a623,
    roughness: 0.5,
    metalness: 0.15,
  });
  // Deform cheese vertices to drape over edges
  const cheesePositions = cheeseGeom.attributes.position;
  for (let i = 0; i < cheesePositions.count; i++) {
    const x = cheesePositions.getX(i);
    const z = cheesePositions.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    if (dist > 1.3) {
      const droop = (dist - 1.3) * 0.25;
      cheesePositions.setY(i, cheesePositions.getY(i) - droop);
    }
    // Add wave to edges
    if (dist > 1.0) {
      const angle = Math.atan2(z, x);
      const wave = Math.sin(angle * 6) * 0.02;
      cheesePositions.setY(i, cheesePositions.getY(i) + wave);
    }
  }
  cheeseGeom.computeVertexNormals();
  const cheese = new THREE.Mesh(cheeseGeom, cheeseMat);
  cheese.position.y = 0.15;
  cheese.rotation.y = Math.PI / 6;
  cheese.castShadow = true;
  burgerGroup.add(cheese);

  // -- Lettuce (wavy green discs) --
  const lettuceMat = new THREE.MeshStandardMaterial({
    color: 0x3da63a,
    roughness: 0.8,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  for (let l = 0; l < 3; l++) {
    const lettuceGeom = new THREE.CircleGeometry(1.6, 24);
    const letPositions = lettuceGeom.attributes.position;
    for (let i = 0; i < letPositions.count; i++) {
      const x = letPositions.getX(i);
      const z = letPositions.getY(i);
      const dist = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x);
      const wave = Math.sin(angle * 5 + l * 2) * 0.12 * (dist / 1.6);
      letPositions.setZ(i, wave);
    }
    lettuceGeom.computeVertexNormals();
    const lettuce = new THREE.Mesh(lettuceGeom, lettuceMat);
    lettuce.rotation.x = -Math.PI / 2;
    lettuce.position.y = 0.25 + l * 0.04;
    lettuce.rotation.z = (l * Math.PI) / 3;
    lettuce.castShadow = true;
    burgerGroup.add(lettuce);
  }

  // -- Tomato slices --
  const tomatoMat = new THREE.MeshStandardMaterial({
    color: 0xe63946,
    roughness: 0.6,
    metalness: 0.1,
  });
  for (let t = 0; t < 3; t++) {
    const tomatoGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 24);
    const tomato = new THREE.Mesh(tomatoGeom, tomatoMat);
    const angle = (t / 3) * Math.PI * 2 + 0.3;
    const r = 0.7;
    tomato.position.set(Math.cos(angle) * r, 0.38, Math.sin(angle) * r);
    tomato.castShadow = true;
    burgerGroup.add(tomato);
  }

  // -- Onion rings --
  const onionMat = new THREE.MeshStandardMaterial({
    color: 0xf0e6d3,
    roughness: 0.6,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  });
  for (let o = 0; o < 4; o++) {
    const onionGeom = new THREE.TorusGeometry(0.3 + Math.random() * 0.15, 0.03, 8, 24);
    const onion = new THREE.Mesh(onionGeom, onionMat);
    const angle = (o / 4) * Math.PI * 2 + 1;
    const r = 0.5 + Math.random() * 0.5;
    onion.position.set(Math.cos(angle) * r, 0.42, Math.sin(angle) * r);
    onion.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    onion.rotation.z = Math.random() * Math.PI;
    burgerGroup.add(onion);
  }

  // -- Patty 2 (top, slightly smaller) --
  const patty2Geom = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 48);
  const patty2 = new THREE.Mesh(patty2Geom, pattyMat);
  patty2.position.y = 0.55;
  patty2.castShadow = true;
  burgerGroup.add(patty2);

  // -- Bacon strips --
  const baconMat = new THREE.MeshStandardMaterial({
    color: 0x8b2500,
    roughness: 0.65,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  for (let b = 0; b < 3; b++) {
    const baconShape = new THREE.PlaneGeometry(2.2, 0.25, 12, 1);
    const baconPos = baconShape.attributes.position;
    for (let i = 0; i < baconPos.count; i++) {
      const x = baconPos.getX(i);
      baconPos.setZ(i, Math.sin(x * 3) * 0.06);
    }
    baconShape.computeVertexNormals();
    const bacon = new THREE.Mesh(baconShape, baconMat);
    bacon.position.y = 0.7;
    bacon.rotation.x = -Math.PI / 2;
    bacon.rotation.z = (b / 3) * Math.PI + 0.2;
    bacon.castShadow = true;
    burgerGroup.add(bacon);
  }

  // -- Second cheese layer --
  const cheese2Geom = new THREE.BoxGeometry(2.0, 0.05, 2.0, 8, 1, 8);
  const cheese2Positions = cheese2Geom.attributes.position;
  for (let i = 0; i < cheese2Positions.count; i++) {
    const x = cheese2Positions.getX(i);
    const z = cheese2Positions.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    if (dist > 1.2) {
      const droop = (dist - 1.2) * 0.2;
      cheese2Positions.setY(i, cheese2Positions.getY(i) - droop);
    }
  }
  cheese2Geom.computeVertexNormals();
  const cheese2 = new THREE.Mesh(cheese2Geom, cheeseMat);
  cheese2.position.y = 0.8;
  cheese2.rotation.y = Math.PI / 4;
  cheese2.castShadow = true;
  burgerGroup.add(cheese2);

  // -- Top Bun --
  const topBunGeom = createBun(0.3, 1.55, 0.8, 48, true);
  const topBunMat = new THREE.MeshStandardMaterial({
    color: 0xc8862e,
    roughness: 0.6,
    metalness: 0.05,
  });
  const topBun = new THREE.Mesh(topBunGeom, topBunMat);
  topBun.position.y = 0.9;
  topBun.castShadow = true;
  burgerGroup.add(topBun);

  // -- Sesame seeds on top bun --
  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xf5e6c8,
    roughness: 0.5,
    metalness: 0.1,
  });
  for (let s = 0; s < 30; s++) {
    const seedGeom = new THREE.SphereGeometry(0.035, 6, 4);
    const seed = new THREE.Mesh(seedGeom, seedMat);
    // Distribute on dome surface
    const phi = Math.random() * Math.PI * 0.4;
    const theta = Math.random() * Math.PI * 2;
    const radius = 1.2 - phi * 0.8;
    seed.position.set(
      Math.sin(phi) * Math.cos(theta) * radius,
      1.3 + Math.cos(phi) * 0.35,
      Math.sin(phi) * Math.sin(theta) * radius
    );
    seed.scale.set(1, 0.5, 1.8);
    seed.rotation.set(Math.random(), Math.random(), Math.random());
    burgerGroup.add(seed);
  }

  // -- Pickles (small green cylinders peeking out) --
  const pickleMat = new THREE.MeshStandardMaterial({
    color: 0x5a8a2a,
    roughness: 0.7,
    metalness: 0.05,
  });
  for (let p = 0; p < 2; p++) {
    const pickleGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16);
    const pickle = new THREE.Mesh(pickleGeom, pickleMat);
    const angle = p * Math.PI + 0.8;
    pickle.position.set(Math.cos(angle) * 1.5, 0.3, Math.sin(angle) * 1.5);
    burgerGroup.add(pickle);
  }

  // Position and tilt the whole burger
  burgerGroup.rotation.x = -0.15;
  burgerGroup.position.y = -0.3;
  scene.add(burgerGroup);

  // -------- PARTICLES (embers/sparks) --------
  const particleCount = 80;
  const particleGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    sizes[i] = Math.random() * 0.03 + 0.01;
  }
  particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xff6b35,
    size: 0.03,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeom, particleMat);
  scene.add(particles);

  // -------- SMOKE PARTICLES --------
  const smokeCount = 30;
  const smokeGeom = new THREE.BufferGeometry();
  const smokePos = new Float32Array(smokeCount * 3);
  for (let i = 0; i < smokeCount; i++) {
    smokePos[i * 3] = (Math.random() - 0.5) * 2;
    smokePos[i * 3 + 1] = Math.random() * 3 + 1;
    smokePos[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  smokeGeom.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
  });
  const smoke = new THREE.Points(smokeGeom, smokeMat);
  scene.add(smoke);

  // -------- MOUSE TRACKING --------
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // -------- ANIMATION LOOP --------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Slow rotation
    burgerGroup.rotation.y = t * 0.2;

    // Float effect
    burgerGroup.position.y = -0.3 + Math.sin(t * 0.7) * 0.1;

    // Mouse response (subtle tilt)
    burgerGroup.rotation.z += (mouseX * 0.06 - burgerGroup.rotation.z) * 0.03;
    burgerGroup.rotation.x += (-0.15 + mouseY * 0.04 - burgerGroup.rotation.x) * 0.03;

    // Particle drift
    particles.rotation.y = t * 0.04;
    particles.rotation.x = Math.sin(t * 0.25) * 0.08;

    // Smoke rise
    const smokePositions = smoke.geometry.attributes.position;
    for (let i = 0; i < smokeCount; i++) {
      let y = smokePositions.getY(i);
      y += 0.005;
      if (y > 4) y = 1;
      smokePositions.setY(i, y);
      // Slight horizontal drift
      smokePositions.setX(
        i,
        smokePositions.getX(i) + Math.sin(t + i) * 0.001
      );
    }
    smokePositions.needsUpdate = true;

    // Pulsing rim light
    rimLight.intensity = 2 + Math.sin(t * 1.8) * 0.5;

    renderer.render(scene, camera);
  }
  animate();

  // -------- RESIZE --------
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();

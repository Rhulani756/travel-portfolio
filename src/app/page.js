"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function Home() {
  useEffect(() => {
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry, i) {
            if (entry.isIntersecting) {
              setTimeout(function () {
                entry.target.classList.add("is-visible");
              }, i * 60);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    /* ---------- 3D pointer tilt for cards ---------- */
    if (!reduceMotion) {
      document
        .querySelectorAll(".dest-card, .principle-card")
        .forEach(function (card) {
          card.addEventListener("mousemove", function (e) {
            var r = card.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform =
              "translateY(-6px) rotateX(" +
              y * -8 +
              "deg) rotateY(" +
              x * 10 +
              "deg)";
          });
          card.addEventListener("mouseleave", function () {
            card.style.transform = "";
          });
        });
    }

    /* ---------- Magnetic buttons ---------- */
    if (!reduceMotion) {
      document
        .querySelectorAll(".btn-primary, .btn-ghost, .cta-btn")
        .forEach(function (btn) {
          btn.addEventListener("mousemove", function (e) {
            var r = btn.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            btn.style.transform = "translate(" + x * 8 + "px," + y * 8 + "px)";
          });
          btn.addEventListener("mouseleave", function () {
            btn.style.transform = "";
          });
        });
    }

    /* ---------- Count-up stats ---------- */
    var counters = document.querySelectorAll(".count-up");
    if (counters.length) {
      var counted = false;
      var statsIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !counted) {
              counted = true;
              counters.forEach(function (el) {
                var target = parseInt(el.getAttribute("data-target"), 10) || 0;
                if (reduceMotion) {
                  el.textContent = target;
                  return;
                }
                var start = null;
                var duration = 900;
                function step(ts) {
                  if (!start) start = ts;
                  var progress = Math.min((ts - start) / duration, 1);
                  el.textContent = Math.round(progress * target);
                  if (progress < 1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
              });
              statsIo.disconnect();
            }
          });
        },
        { threshold: 0.4 },
      );
      statsIo.observe(document.querySelector(".hero-stats"));
    }

    /* ---------- Profile photo fallback ---------- */
    var profileImg = document.getElementById("profile-img");
    var profileFallback = document.getElementById("profile-fallback");
    if (profileImg && profileFallback) {
      profileImg.addEventListener("error", function () {
        profileImg.style.display = "none";
        profileFallback.style.display = "flex";
      });
    }

    /* ---------- Journey timeline reveal trigger ---------- */
    var journeyEl = document.querySelector(".journey");
    if (journeyEl) {
      var jIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              jIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 },
      );
      jIo.observe(journeyEl);
    }

    /* ---------- Approach panel reveal trigger ---------- */
    var approachEl = document.querySelector(".approach");
    if (approachEl) {
      var aIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              aIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 },
      );
      aIo.observe(approachEl);
    }

    /* ---------- Section-aware navigation ---------- */
    var navItems = Array.prototype.slice.call(
      document.querySelectorAll(".site-nav [data-nav-target]"),
    );
    var navSections = document.querySelectorAll("[data-nav-section]");
    var navIo = null;

    function setActiveNav(sectionId) {
      navItems.forEach(function (item) {
        if (item.getAttribute("data-nav-target") === sectionId) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });
    }

    if (
      navItems.length &&
      navSections.length &&
      "IntersectionObserver" in window
    ) {
      navIo = new IntersectionObserver(
        function (entries) {
          var visible = entries
            .filter(function (entry) {
              return entry.isIntersecting;
            })
            .sort(function (a, b) {
              return b.intersectionRatio - a.intersectionRatio;
            });
          if (visible.length) {
            setActiveNav(visible[0].target.getAttribute("data-nav-section"));
          }
        },
        { rootMargin: "-28% 0px -58% 0px", threshold: [0.01, 0.15, 0.35] },
      );
      navSections.forEach(function (section) {
        navIo.observe(section);
      });
    } else if (navItems.length) {
      setActiveNav("home");
    }

    return () => {
      if (navIo) navIo.disconnect();
    };
  }, []);

  // Called once three.js has loaded from the CDN script below.
  function initGlobe() {
    var canvas = document.getElementById("globe-canvas");
    if (!canvas || !window.THREE || canvas.dataset.initialized === "true")
      return;

    canvas.dataset.initialized = "true";

    var THREE = window.THREE;
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    var globeStage = canvas.closest(".globe-stage");
    var tooltip = document.getElementById("globe-tooltip");
    var tooltipStatus = document.getElementById("globe-tooltip-status");
    var tooltipTitle = document.getElementById("globe-tooltip-title");
    var tooltipDescription = document.getElementById(
      "globe-tooltip-description",
    );
    var w = canvas.clientWidth || 520;
    var h = canvas.clientHeight || 520;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 6.4;

    // earthGroup handles pointer tilt; planetGroup handles the actual spin.
    // Markers live inside planetGroup so they remain locked to the map texture.
    var earthGroup = new THREE.Group();
    earthGroup.rotation.z = (23.4 * Math.PI) / 180;
    scene.add(earthGroup);

    var planetGroup = new THREE.Group();
    planetGroup.rotation.y = THREE.MathUtils.degToRad(95);
    earthGroup.add(planetGroup);

    var TEX_BASE =
      "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/";
    var textureLoader = new THREE.TextureLoader();
    if (textureLoader.setCrossOrigin) textureLoader.setCrossOrigin("anonymous");

    var readyCount = 0;
    var revealed = false;
    function revealCanvas() {
      if (revealed) return;
      revealed = true;
      requestAnimationFrame(function () {
        canvas.classList.add("is-ready");
      });
    }
    function markLoaded() {
      readyCount++;
      if (readyCount >= 2) revealCanvas();
    }
    setTimeout(revealCanvas, 4000);

    var dayMap = textureLoader.load(
      TEX_BASE + "earth_atmos_2048.jpg",
      markLoaded,
      undefined,
      markLoaded,
    );
    var specMap = textureLoader.load(TEX_BASE + "earth_specular_2048.jpg");
    var normalMap = textureLoader.load(TEX_BASE + "earth_normal_2048.jpg");
    var cloudsMap = textureLoader.load(
      TEX_BASE + "earth_clouds_1024.png",
      markLoaded,
      undefined,
      markLoaded,
    );

    var earthRadius = 2.1;

    var earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    var earthMat = new THREE.MeshPhongMaterial({
      map: dayMap,
      specularMap: specMap,
      specular: new THREE.Color(0x26344f),
      shininess: 9,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.48, 0.48),
    });
    var earthMesh = new THREE.Mesh(earthGeo, earthMat);
    planetGroup.add(earthMesh);

    var cloudsGeo = new THREE.SphereGeometry(earthRadius * 1.012, 64, 64);
    var cloudsMat = new THREE.MeshLambertMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    });
    var cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    planetGroup.add(cloudsMesh);

    // Fresnel-style atmosphere rim glow.
    var atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.16, 64, 64);
    var atmosphereMat = new THREE.ShaderMaterial({
      vertexShader:
        "varying vec3 vNormal;\n" +
        "void main(){\n" +
        "  vNormal = normalize(normalMatrix * normal);\n" +
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
        "}",
      fragmentShader:
        "varying vec3 vNormal;\n" +
        "void main(){\n" +
        "  float intensity = pow(0.69 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);\n" +
        "  gl_FragColor = vec4(0.28, 0.72, 1.0, 1.0) * intensity;\n" +
        "}",
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    var atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    scene.add(new THREE.AmbientLight(0x40547f, 1.7));
    var sun = new THREE.DirectionalLight(0xffffff, 1.08);
    sun.position.set(5, 2, 5);
    scene.add(sun);

    function latLongToVector3(lat, lon, radius) {
      var phi = (90 - lat) * (Math.PI / 180);
      var theta = (lon + 180) * (Math.PI / 180);

      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
    }

    // Coordinates are visual placements for the portfolio metaphor rather than
    // claims that the projects were physically completed in these locations.
    // targetId must match the id of the related project card below.
    var projectDestinations = [
      {
        name: "ThreatSense",
        meta: "Cybersecurity · completed",
        description:
          "Hybrid Random Forest + XGBoost insider-threat detection with explainable risk scoring.",
        lat: -33.92,
        lon: 18.42,
        status: "done",
        targetId: "project-threatsense",
      },
      {
        name: "Cross-language AI text detection",
        meta: "Machine learning · completed",
        description:
          "AI-generated text detection across isiZulu, isiXhosa and English.",
        lat: -6.79,
        lon: 39.21,
        status: "done",
        targetId: "project-multilingual-ai",
      },
      {
        name: "Peer-review platform",
        meta: "Software engineering · completed",
        description:
          "A measured redesign guided by real performance data and documented trade-offs.",
        lat: 41.9,
        lon: 12.49,
        status: "done",
        targetId: "project-peer-review",
      },
      {
        name: "Formal verification + LLM research",
        meta: "Honours research · in progress",
        description:
          "Combining CBMC and ESBMC with LLM feedback for student C++ code.",
        lat: 47.38,
        lon: 8.54,
        status: "active",
        targetId: "project-formal-verification",
      },
      {
        name: "Developer automation toolkit",
        meta: "Developer tooling · planned",
        description:
          "Production-minded tools for APIs, reports, documents, and repetitive developer workflows.",
        lat: 1.35,
        lon: 103.82,
        status: "planned",
        targetId: "project-python-automation",
      },
      {
        name: "Observable data pipeline",
        meta: "Data engineering · planned",
        description:
          "A reliable ingestion and transformation pipeline with validation, monitoring, and visible failure modes.",
        lat: 37.77,
        lon: -122.42,
        status: "planned",
        targetId: "project-data-platform",
      },
    ];

    var statusStyles = {
      done: { color: 0x22d3b6, dotSize: 0.048, ringOpacity: 0.48 },
      active: { color: 0xfcc419, dotSize: 0.058, ringOpacity: 0.78 },
      planned: { color: 0x8b5cf6, dotSize: 0.044, ringOpacity: 0.42 },
    };

    var statusLabels = {
      done: "Completed",
      active: "In progress",
      planned: "Planned",
    };

    var animatedRings = [];
    var interactiveMarkers = [];
    var markerRadius = earthRadius * 1.026;
    var homePosition = latLongToVector3(-25.7479, 28.2293, markerRadius);

    function addMarker(destination, index) {
      var style = statusStyles[destination.status];
      var position = latLongToVector3(
        destination.lat,
        destination.lon,
        markerRadius,
      );
      var markerGroup = new THREE.Group();
      markerGroup.position.copy(position);
      markerGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize(),
      );

      var dotMaterial = new THREE.MeshBasicMaterial({ color: style.color });
      var dot = new THREE.Mesh(
        new THREE.SphereGeometry(style.dotSize, 14, 14),
        dotMaterial,
      );
      dot.renderOrder = 4;
      markerGroup.add(dot);

      var ringMaterial = new THREE.MeshBasicMaterial({
        color: style.color,
        transparent: true,
        opacity: style.ringOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      var ring = new THREE.Mesh(
        new THREE.RingGeometry(style.dotSize * 1.45, style.dotSize * 2.45, 32),
        ringMaterial,
      );
      ring.position.z = -0.005;
      ring.renderOrder = 3;
      markerGroup.add(ring);

      // A larger invisible sphere makes the small visual dot much easier to
      // hover and tap without changing the marker's appearance.
      var hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(style.dotSize * 3.4, 0.14), 12, 12),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hitTarget.renderOrder = 5;
      markerGroup.add(hitTarget);
      planetGroup.add(markerGroup);

      var markerRecord = {
        destination: destination,
        group: markerGroup,
        dot: dot,
        ring: ring,
        hitTarget: hitTarget,
      };
      hitTarget.userData.markerRecord = markerRecord;
      interactiveMarkers.push(hitTarget);

      if (destination.status !== "done") {
        animatedRings.push({
          mesh: ring,
          material: ringMaterial,
          baseOpacity: style.ringOpacity,
          speed: destination.status === "active" ? 0.78 : 0.5,
          phase: index * 0.17,
          growth: destination.status === "active" ? 2.8 : 2.1,
        });
      }

      return position;
    }

    function addRoute(start, end, color, opacity) {
      var midpoint = start.clone().add(end).multiplyScalar(0.5);
      if (midpoint.lengthSq() < 0.001) return;

      var distance = start.distanceTo(end);
      midpoint.normalize().multiplyScalar(earthRadius + 0.24 + distance * 0.08);

      var curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
      var geometry = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(52),
      );
      var material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
      });
      var line = new THREE.Line(geometry, material);
      line.renderOrder = 1;
      planetGroup.add(line);
    }

    projectDestinations.forEach(function (destination, index) {
      var position = addMarker(destination, index);
      if (destination.status === "active") {
        addRoute(homePosition, position, statusStyles.active.color, 0.34);
      }
      if (destination.status === "planned") {
        addRoute(homePosition, position, statusStyles.planned.color, 0.18);
      }
    });

    // A brighter home/base marker in Pretoria.
    var homeGroup = new THREE.Group();
    homeGroup.position.copy(homePosition);
    homeGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      homePosition.clone().normalize(),
    );
    var homeDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf5f6fb }),
    );
    var homePulseMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3b6,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    var homePulse = new THREE.Mesh(
      new THREE.RingGeometry(0.075, 0.12, 36),
      homePulseMaterial,
    );
    homePulse.position.z = -0.005;
    homeGroup.add(homeDot);
    homeGroup.add(homePulse);
    planetGroup.add(homeGroup);
    animatedRings.push({
      mesh: homePulse,
      material: homePulseMaterial,
      baseOpacity: 0.75,
      speed: 0.68,
      phase: 0,
      growth: 3.2,
    });

    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    var hoveredMarker = null;
    var pointerOverGlobe = false;
    var temporaryWorldPosition = new THREE.Vector3();
    var temporaryProjectedPosition = new THREE.Vector3();

    function pickMarker(event) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // The earth is included in the raycast. A marker on the hidden side of
      // the globe sits behind the earth intersection and therefore cannot be selected.
      var intersections = raycaster.intersectObjects(
        [earthMesh].concat(interactiveMarkers),
        false,
      );
      if (!intersections.length) return null;

      var firstObject = intersections[0].object;
      return firstObject.userData.markerRecord || null;
    }

    function positionTooltip(markerRecord) {
      if (!tooltip || !globeStage || !markerRecord) return;

      markerRecord.group.getWorldPosition(temporaryWorldPosition);
      temporaryProjectedPosition.copy(temporaryWorldPosition).project(camera);

      var canvasRect = canvas.getBoundingClientRect();
      var stageRect = globeStage.getBoundingClientRect();
      var markerX =
        canvasRect.left -
        stageRect.left +
        (temporaryProjectedPosition.x * 0.5 + 0.5) * canvasRect.width;
      var markerY =
        canvasRect.top -
        stageRect.top +
        (-temporaryProjectedPosition.y * 0.5 + 0.5) * canvasRect.height;

      var tooltipWidth = tooltip.offsetWidth || 250;
      var tooltipHeight = tooltip.offsetHeight || 130;
      var left = markerX + 18;
      var top = markerY - tooltipHeight - 16;

      if (left + tooltipWidth > stageRect.width - 10) {
        left = markerX - tooltipWidth - 18;
      }
      left = Math.max(10, Math.min(left, stageRect.width - tooltipWidth - 10));
      top = Math.max(10, Math.min(top, stageRect.height - tooltipHeight - 10));

      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";
    }

    function showMarker(markerRecord) {
      if (hoveredMarker === markerRecord) return;

      if (hoveredMarker) {
        hoveredMarker.group.scale.setScalar(1);
      }

      hoveredMarker = markerRecord;
      if (!markerRecord) {
        canvas.style.cursor = "default";
        if (tooltip) {
          tooltip.classList.remove("is-visible");
          tooltip.setAttribute("aria-hidden", "true");
        }
        return;
      }

      markerRecord.group.scale.setScalar(1.28);
      canvas.style.cursor = "pointer";

      if (tooltip) {
        tooltip.dataset.status = markerRecord.destination.status;
        if (tooltipStatus) {
          tooltipStatus.textContent =
            markerRecord.destination.meta ||
            statusLabels[markerRecord.destination.status];
        }
        if (tooltipTitle)
          tooltipTitle.textContent = markerRecord.destination.name;
        if (tooltipDescription) {
          tooltipDescription.textContent = markerRecord.destination.description;
        }
        tooltip.classList.add("is-visible");
        tooltip.setAttribute("aria-hidden", "false");
        positionTooltip(markerRecord);
      }
    }

    function openProject(markerRecord) {
      if (!markerRecord) return;

      var targetId = markerRecord.destination.targetId;
      var target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });

      function playProjectFocus() {
        target.classList.remove("project-focus");
        // Force a reflow so repeated clicks replay the focus animation.
        void target.offsetWidth;
        target.classList.add("project-focus");
        window.setTimeout(function () {
          target.classList.remove("project-focus");
        }, 1900);
      }

      if (reduceMotion || !("IntersectionObserver" in window)) {
        playProjectFocus();
      } else {
        var focusObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                playProjectFocus();
                focusObserver.disconnect();
              }
            });
          },
          { threshold: 0.4 },
        );
        focusObserver.observe(target);
      }

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + targetId);
      }
    }

    canvas.addEventListener("pointerenter", function () {
      pointerOverGlobe = true;
    });

    canvas.addEventListener("pointermove", function (event) {
      showMarker(pickMarker(event));
    });

    canvas.addEventListener("pointerleave", function () {
      pointerOverGlobe = false;
      showMarker(null);
    });

    canvas.addEventListener("click", function (event) {
      var selectedMarker = pickMarker(event) || hoveredMarker;
      openProject(selectedMarker);
    });

    var targetRotX = 0;
    var targetRotY = 0;
    if (!reduceMotion) {
      window.addEventListener(
        "mousemove",
        function (event) {
          targetRotY = (event.clientX / window.innerWidth - 0.5) * 0.42;
          targetRotX = (event.clientY / window.innerHeight - 0.5) * 0.22;
        },
        { passive: true },
      );
    }

    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var delta = Math.min(clock.getDelta(), 0.05);
      var elapsed = clock.elapsedTime;

      if (!reduceMotion) {
        // Pause the main rotation while a visitor is examining the globe.
        if (!pointerOverGlobe && !hoveredMarker) {
          planetGroup.rotation.y += delta * 0.055;
        }
        cloudsMesh.rotation.y += delta * 0.018;

        earthGroup.rotation.x += (targetRotX - earthGroup.rotation.x) * 0.04;
        earthGroup.rotation.y += (targetRotY - earthGroup.rotation.y) * 0.03;

        animatedRings.forEach(function (pulse) {
          var progress = (elapsed * pulse.speed + pulse.phase) % 1;
          var scale = 1 + progress * pulse.growth;
          pulse.mesh.scale.set(scale, scale, scale);
          pulse.material.opacity = pulse.baseOpacity * (1 - progress);
        });
      }

      if (hoveredMarker) positionTooltip(hoveredMarker);
      renderer.render(scene, camera);
    }
    animate();

    function resizeGlobe() {
      var nextWidth = canvas.clientWidth;
      var nextHeight = canvas.clientHeight;
      if (!nextWidth || !nextHeight) return;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight, false);
      if (hoveredMarker) positionTooltip(hoveredMarker);
    }

    if ("ResizeObserver" in window) {
      var globeResizeObserver = new ResizeObserver(resizeGlobe);
      globeResizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", resizeGlobe, { passive: true });
    }
  }

  return (
    <>
      <style>{`

  :root{
    --midnight:#0a0e1f;
    --midnight-2:#111832;
    --violet:#8b5cf6;
    --teal:#22d3b6;
    --azure:#38bdf8;
    --amber:#fcc419;
    --text-light:#f5f6fb;
    --text-muted:#9aa3c0;
    --border-soft:rgba(245,246,251,0.1);
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    background:#070a16;
    color:var(--text-light);
    font-family:'Inter',sans-serif;
    overflow-x:hidden;
    position:relative;
  }
  h1,h2,h3,.display{font-family:'Space Grotesk',sans-serif;}
  .voice{font-family:'Fraunces',serif;font-style:italic;}
  a{color:inherit;text-decoration:none;}

  /* ---------- Quiet night-sky background ---------- */
  .page-background{
    position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;
    background:#080c17;
  }
  .page-background::after{
    content:'';position:absolute;inset:0;
    background:rgba(2,6,15,0.16);
  }
  .star-layer{position:absolute;inset:-15%;opacity:0.34;}
  .stars-far{
    background-image:
      radial-gradient(circle,rgba(226,232,240,0.42) 0 1px,transparent 1.25px),
      radial-gradient(circle,rgba(148,163,184,0.24) 0 1px,transparent 1.3px);
    background-size:79px 79px,131px 131px;
    background-position:11px 17px,43px 71px;
    animation:star-drift 70s linear infinite;
  }
  .stars-near{
    opacity:0.18;
    background-image:
      radial-gradient(circle,rgba(241,245,249,0.62) 0 1.2px,transparent 1.5px),
      radial-gradient(circle,rgba(148,163,184,0.38) 0 1px,transparent 1.4px);
    background-size:173px 173px,223px 223px;
    background-position:57px 29px,121px 91px;
    animation:star-drift 110s linear infinite reverse;
  }
  .background-grid{
    position:absolute;left:-10%;right:-10%;top:10%;height:70%;
    background-image:
      linear-gradient(rgba(148,163,184,0.035) 1px,transparent 1px),
      linear-gradient(90deg,rgba(148,163,184,0.035) 1px,transparent 1px);
    background-size:72px 72px;
    transform:perspective(900px) rotateX(63deg) scale(1.35);
    transform-origin:center bottom;
    -webkit-mask-image:linear-gradient(to bottom,transparent,black 30%,transparent 92%);
    mask-image:linear-gradient(to bottom,transparent,black 30%,transparent 92%);
  }
  #topo-bg{
    position:absolute;inset:0;width:100%;height:100%;
    opacity:0.065;
    -webkit-mask-image:linear-gradient(to bottom,black,transparent 82%);
    mask-image:linear-gradient(to bottom,black,transparent 82%);
  }
  @keyframes star-drift{to{transform:translate3d(-120px,80px,0);}}

  .noise-line{
    position:absolute;inset:0;
    background-image:
      radial-gradient(rgba(255,255,255,0.055) 1px,transparent 1px),
      linear-gradient(90deg,transparent 49.8%,rgba(255,255,255,0.025) 50%,transparent 50.2%);
    background-size:22px 22px,180px 100%;
    -webkit-mask-image:linear-gradient(90deg,black 0%,black 66%,transparent 100%);
    mask-image:linear-gradient(90deg,black 0%,black 66%,transparent 100%);
    pointer-events:none;
  }

  /* ---------- 3D globe + interactive project destinations ---------- */
  .globe-stage{
    position:absolute;top:50%;right:max(2.5vw,24px);transform:translateY(-50%);
    width:min(39vw,500px);aspect-ratio:1;z-index:1;pointer-events:auto;
  }
  .globe-stage::before,.globe-stage::after{
    content:'';position:absolute;inset:7%;border-radius:50%;pointer-events:none;
    border:1px solid rgba(126,232,211,0.15);
    box-shadow:0 0 80px rgba(34,211,182,0.08),inset 0 0 50px rgba(139,92,246,0.06);
  }
  .globe-stage::before{transform:rotate(-12deg) scaleX(1.15);}
  .globe-stage::after{
    inset:14%;border-style:dashed;border-color:rgba(196,181,253,0.13);
    transform:rotate(28deg) scaleY(1.12);
    animation:orbit-turn 32s linear infinite;
  }
  #globe-canvas{
    position:absolute;inset:0;width:100%;height:100%;z-index:2;
    pointer-events:auto;touch-action:manipulation;opacity:0;
    filter:drop-shadow(0 30px 42px rgba(0,0,0,0.38));
    transition:opacity 1.2s ease;
  }
  #globe-canvas.is-ready{opacity:1;}
  .globe-caption{
    position:absolute;right:5%;bottom:0;z-index:4;display:flex;flex-direction:column;gap:8px;
    padding:12px 14px;border-radius:14px;pointer-events:none;
    border:1px solid rgba(245,246,251,0.12);
    background:rgba(7,10,22,0.64);backdrop-filter:blur(14px);
    box-shadow:0 18px 50px rgba(0,0,0,0.28);
  }
  .globe-caption strong{
    font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:600;
    letter-spacing:0.08em;text-transform:uppercase;color:var(--text-light);
  }
  .globe-instructions{font-size:10.5px;color:#cbd2e7;line-height:1.35;}
  .globe-legend{display:flex;gap:12px;flex-wrap:wrap;}
  .legend-item{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;color:var(--text-muted);}
  .legend-dot{width:7px;height:7px;border-radius:50%;box-shadow:0 0 10px currentColor;}
  .legend-dot.done{color:var(--teal);background:var(--teal);}
  .legend-dot.active{color:var(--amber);background:var(--amber);}
  .legend-dot.planned{color:var(--violet);background:var(--violet);}

  .globe-tooltip{
    position:absolute;left:0;top:0;z-index:6;width:min(260px,72%);
    padding:14px 15px 15px;border-radius:15px;pointer-events:none;
    border:1px solid rgba(245,246,251,0.15);
    background:linear-gradient(145deg,rgba(11,16,36,0.96),rgba(7,10,22,0.91));
    backdrop-filter:blur(18px);box-shadow:0 18px 54px rgba(0,0,0,0.42);
    opacity:0;visibility:hidden;transform:translateY(7px) scale(0.97);
    transition:opacity .16s ease,transform .16s ease,visibility .16s ease;
  }
  .globe-tooltip.is-visible{opacity:1;visibility:visible;transform:translateY(0) scale(1);}
  .globe-tooltip::before{
    content:'';position:absolute;inset:0 0 auto 0;height:2px;border-radius:15px 15px 0 0;
    background:var(--tooltip-color,var(--teal));box-shadow:0 0 18px var(--tooltip-color,var(--teal));
  }
  .globe-tooltip[data-status='done']{--tooltip-color:var(--teal);}
  .globe-tooltip[data-status='active']{--tooltip-color:var(--amber);}
  .globe-tooltip[data-status='planned']{--tooltip-color:var(--violet);}
  .globe-tooltip-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;}
  .globe-tooltip-status{
    font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;
    color:var(--tooltip-color,var(--teal));
  }
  .globe-tooltip-action{font-size:9.5px;color:var(--text-muted);}
  .globe-tooltip strong{
    display:block;font-family:'Space Grotesk',sans-serif;font-size:15px;line-height:1.25;
    color:var(--text-light);margin-bottom:6px;
  }
  .globe-tooltip p{font-size:11.5px;line-height:1.55;color:#aeb7d1;}
  @keyframes orbit-turn{to{transform:rotate(388deg) scaleY(1.12);}}

  @media (prefers-reduced-motion: reduce){
    .star-layer,.globe-stage::after{animation:none;}
  }
  @media (max-width:980px){
    .globe-stage{display:none;}
    .hero-copy{width:100%;}
  }

  /* ---------- Reveal on scroll ---------- */
  .reveal{opacity:0;transform:translateY(32px);transition:opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1);}
  .reveal.is-visible{opacity:1;transform:translateY(0);}
  @media (prefers-reduced-motion: reduce){
    .reveal{opacity:1;transform:none;transition:none;}
  }

  /* ---------- 3D tilt cards ---------- */
  .tilt-area{perspective:1200px;}
  .dest-card, .principle-card{
    transform-style:preserve-3d;
    will-change:transform;
    transition:transform .15s ease, border-color .25s ease, box-shadow .3s ease;
  }
  .dest-card:hover, .principle-card:hover{box-shadow:0 24px 48px -20px rgba(0,0,0,0.55);}
  @media (prefers-reduced-motion: reduce){
    .dest-card, .principle-card{transition:border-color .25s ease;}
  }

  /* ---------- Modern portfolio masthead ---------- */
  .site-header{
    position:relative;
    z-index:80;
    padding:0 6vw;
    pointer-events:none;
  }
  .nav-shell{
    width:min(1440px,100%);
    min-height:96px;
    margin:0 auto;
    display:grid;
    grid-template-columns:minmax(270px,1fr) auto minmax(270px,1fr);
    align-items:center;
    gap:24px;
    padding:18px 0;
    border-bottom:1px solid rgba(245,246,251,0.11);
    background:transparent;
    pointer-events:auto;
  }
  .brand-lockup{
    display:inline-flex;align-items:center;gap:12px;min-width:0;width:max-content;
    border-radius:14px;outline:none;
  }
  .brand-mark{
    position:relative;width:46px;height:46px;flex:0 0 46px;
    display:grid;place-items:center;border-radius:13px;
    background:linear-gradient(145deg,rgba(139,92,246,0.28),rgba(34,211,182,0.16));
    border:1px solid rgba(196,181,253,0.3);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 10px 28px rgba(4,7,17,0.22);
    overflow:hidden;
  }
  .brand-mark::before{
    content:'';position:absolute;inset:-45%;
    background:conic-gradient(from 180deg,transparent,var(--teal),transparent,var(--violet),transparent);
    opacity:.36;animation:brand-orbit 9s linear infinite;
  }
  .brand-mark span{
    position:relative;z-index:1;font-family:'Space Grotesk',sans-serif;
    font-size:12px;font-weight:700;letter-spacing:.06em;color:#fff;
  }
  @keyframes brand-orbit{to{transform:rotate(360deg);}}
  .brand-copy{display:flex;flex-direction:column;gap:2px;min-width:0;}
  .brand-copy strong{
    font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;
    letter-spacing:-.01em;color:var(--text-light);white-space:nowrap;
  }
  .brand-copy small{
    font-size:11px;letter-spacing:.035em;color:var(--text-muted);white-space:nowrap;
  }
  .brand-lockup:hover .brand-copy strong{color:#fff;}
  .brand-lockup:focus-visible,.site-nav a:focus-visible,.nav-cta:focus-visible{
    outline:2px solid var(--teal);outline-offset:3px;
  }

  .site-nav{
    display:flex;align-items:center;gap:3px;padding:4px;
    border:1px solid rgba(245,246,251,0.085);border-radius:14px;
    background:rgba(255,255,255,0.028);
  }
  .site-nav a{
    position:relative;padding:10px 15px;border-radius:10px;
    font-size:12.5px;font-weight:500;color:var(--text-muted);
    transition:color .2s ease,background .2s ease,transform .2s ease;
  }
  .site-nav a::after{
    content:'';position:absolute;left:50%;bottom:4px;width:4px;height:4px;border-radius:50%;
    background:var(--teal);box-shadow:0 0 10px var(--teal);
    opacity:0;transform:translate(-50%,5px) scale(.5);
    transition:opacity .2s ease,transform .2s ease;
  }
  .site-nav a:hover{color:var(--text-light);background:rgba(255,255,255,0.045);transform:translateY(-1px);}
  .site-nav a[aria-current='page']{color:#fff;background:rgba(34,211,182,0.075);}
  .site-nav a[aria-current='page']::after{opacity:1;transform:translate(-50%,0) scale(1);}

  .nav-actions{justify-self:end;display:flex;align-items:center;gap:12px;}
  .nav-status{
    display:inline-flex;align-items:center;gap:8px;
    font-size:10.5px;letter-spacing:.035em;color:var(--text-muted);white-space:nowrap;
  }
  .nav-status i{
    width:7px;height:7px;border-radius:50%;background:var(--teal);
    box-shadow:0 0 0 4px rgba(34,211,182,0.09),0 0 13px rgba(34,211,182,.7);
    animation:status-pulse 2.6s ease-in-out infinite;
  }
  @keyframes status-pulse{50%{opacity:.48;box-shadow:0 0 0 7px rgba(34,211,182,0.025),0 0 8px rgba(34,211,182,.34);}}
  .nav-cta{
    display:inline-flex;align-items:center;gap:8px;
    padding:11px 15px 11px 17px;border-radius:12px;
    border:1px solid rgba(196,181,253,0.2);
    background:linear-gradient(115deg,rgba(139,92,246,0.92),rgba(56,189,248,0.86));
    color:#fff;font-size:12.5px;font-weight:600;
    box-shadow:0 10px 24px -14px rgba(139,92,246,.85),inset 0 1px 0 rgba(255,255,255,.18);
    transition:transform .2s ease,box-shadow .2s ease,filter .2s ease;
  }
  .nav-cta svg{width:15px;height:15px;transition:transform .2s ease;}
  .nav-cta:hover{transform:translateY(-2px);filter:saturate(1.08);box-shadow:0 14px 30px -14px rgba(56,189,248,.72);}
  .nav-cta:hover svg{transform:translate(2px,-2px);}

  @media (max-width:1120px){
    .nav-shell{grid-template-columns:1fr auto 1fr;gap:14px;}
    .brand-copy small,.nav-status{display:none;}
    .site-nav a{padding-inline:11px;}
  }
  @media (max-width:820px){
    .site-header{padding:0 18px;}
    .nav-shell{
      grid-template-columns:1fr auto;
      min-height:auto;
      gap:10px;
      padding:12px 0 14px;
    }
    .brand-mark{width:39px;height:39px;flex-basis:39px;}
    .site-nav{
      position:static;
      grid-column:1 / -1;
      width:100%;
      justify-content:space-between;
      padding:5px;
      margin-top:2px;
      border-radius:14px;
      background:rgba(255,255,255,.025);
      box-shadow:none;
    }
    .site-nav a{flex:1;text-align:center;padding:10px 7px;font-size:11.5px;}
    .nav-actions{grid-column:2;grid-row:1;}
    body{padding-bottom:0;}
  }
  @media (max-width:520px){
    .brand-copy strong{font-size:14px;}
    .nav-cta{padding:10px;}
    .nav-cta-label{display:none;}
    .nav-cta svg{width:17px;height:17px;}
  }
  @media (prefers-reduced-motion:reduce){
    .brand-mark::before,.nav-status i{animation:none;}
  }

  /* ---------- Hero ---------- */
  .hero{
    position:relative;
    padding:110px 6vw 90px;
    min-height:82vh;
    display:flex;flex-direction:column;justify-content:center;
    z-index:1;
    overflow:hidden;
    border-bottom:1px solid rgba(245,246,251,0.06);
    background:rgba(8,12,23,0.16);
  }
  .hero-copy{position:relative;z-index:2;width:min(58vw,820px);}
  .eyebrow{
    position:relative;
    display:inline-flex;align-items:center;gap:10px;
    width:max-content;max-width:100%;
    font-size:11.5px;letter-spacing:0.065em;text-transform:uppercase;
    color:#7dd3fc;margin-bottom:28px;
    padding:7px 15px 7px 8px;
    border-radius:999px;
    background:linear-gradient(90deg,rgba(56,189,248,0.13),rgba(34,211,182,0.07));
    border:1px solid rgba(56,189,248,0.32);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 10px 30px rgba(14,165,233,0.08);
    overflow:hidden;
  }
  .eyebrow::before{
    content:'';position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(110deg,rgba(255,255,255,0.07),transparent 34%);
  }
  .eyebrow svg{
    position:relative;z-index:1;width:27px;height:27px;flex:0 0 27px;padding:6px;
    border-radius:50%;background:rgba(56,189,248,0.12);
    border:1px solid rgba(125,211,252,0.24);
  }
  .eyebrow span{position:relative;z-index:1;white-space:nowrap;}
  @media (max-width:560px){
    .eyebrow{
      gap:7px;font-size:9.5px;letter-spacing:0.045em;
      padding:6px 11px 6px 6px;margin-bottom:22px;
    }
    .eyebrow svg{width:24px;height:24px;flex-basis:24px;padding:5px;}
  }
  .hero h1{
    font-size:clamp(36px,6vw,72px);
    line-height:1.22;font-weight:600;
    max-width:820px;
    letter-spacing:-0.01em;
    padding-bottom:4px;
  }
  .hero h1 em{
    font-family:'Fraunces',serif;font-style:italic;font-weight:500;
    background:linear-gradient(90deg,var(--violet),var(--azure) 52%,var(--teal));
    -webkit-background-clip:text;background-clip:text;color:transparent;
    display:inline-block;
    line-height:1.3;
    padding-bottom:0.06em;
  }
  .hero p{
    max-width:540px;margin-top:22px;font-size:16.5px;line-height:1.7;
    color:var(--text-muted);
  }
  .hero-ctas{
    display:flex;align-items:center;gap:14px;margin-top:38px;flex-wrap:wrap;
  }
  .btn-primary, .btn-ghost{
    width:220px;height:56px;padding:0 24px;
    border-radius:999px;box-sizing:border-box;
    display:inline-flex;align-items:center;justify-content:center;
    white-space:nowrap;font-size:15px;line-height:1;font-weight:600;
    transition:transform .15s ease, border-color .2s ease, background-color .2s ease;
  }
  .btn-primary{
    border:1px solid transparent;
    background:linear-gradient(90deg,var(--violet),var(--azure));
    color:#fff;
    box-shadow:0 8px 30px -8px rgba(139,92,246,0.55);
  }
  .btn-ghost{
    border:1px solid var(--border-soft);color:var(--text-light);
    background:rgba(255,255,255,0.01);
  }
  .btn-ghost:hover{border-color:var(--text-light);background:rgba(255,255,255,0.04);}
  @media (max-width:520px){
    .hero-ctas{width:100%;}
    .btn-primary, .btn-ghost{width:100%;max-width:280px;}
  }

  .hero-stats{
    position:relative;
    display:flex;margin-top:56px;flex-wrap:wrap;
    max-width:640px;
    border-radius:14px;
    background:rgba(245,246,251,0.03);
    border:1px solid var(--border-soft);
  }
  .hero-stats::before{
    content:'';position:absolute;left:0;top:0;bottom:0;width:1px;
    background-image:repeating-linear-gradient(180deg,transparent 0 6px, rgba(245,246,251,0.18) 6px 12px);
  }
  .stat-block{
    flex:1;min-width:130px;padding:20px 22px;
    border-right:1px dashed var(--border-soft);
  }
  .stat-block:last-child{border-right:none;}
  .stat-num{font-family:'Space Grotesk';font-size:24px;font-weight:600;}
  .stat-label{font-size:11.5px;color:var(--text-muted);margin-top:4px;letter-spacing:0.03em;text-transform:uppercase;}

  .scroll-cue{
    position:absolute;left:6vw;bottom:28px;z-index:2;
    display:flex;align-items:center;gap:10px;
    font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;
    color:var(--text-muted);
  }
  .scroll-cue svg{width:14px;height:14px;animation:scroll-bounce 1.8s ease-in-out infinite;}
  @keyframes scroll-bounce{0%,100%{transform:translateY(0);opacity:0.5;}50%{transform:translateY(5px);opacity:1;}}
  @media (prefers-reduced-motion: reduce){.scroll-cue svg{animation:none;}}
  @media (max-width:700px){.scroll-cue{display:none;}}

  /* ---------- Section shell ---------- */
  section{position:relative;padding:100px 6vw;z-index:1;}
  .section-head{max-width:640px;margin-bottom:56px;}
  .section-eyebrow{
    font-size:12.5px;letter-spacing:0.08em;text-transform:uppercase;
    color:var(--text-muted);margin-bottom:14px;
  }
  .section-head h2{font-size:clamp(28px,3.6vw,42px);font-weight:600;line-height:1.15;}
  .section-head p{margin-top:16px;color:var(--text-muted);font-size:15.5px;line-height:1.7;}

  /* ---------- About section ---------- */
  .about-grid{
    display:grid;grid-template-columns:280px 1fr;gap:56px;align-items:start;
  }
  @media (max-width:820px){.about-grid{grid-template-columns:1fr;}}

  .profile-frame{
    position:relative;width:240px;height:290px;
    border-radius:16px;overflow:hidden;
    border:1px solid var(--border-soft);
    background:var(--midnight-2);
    animation:float-bob 5s ease-in-out infinite;
    transform-origin:center;
  }
  @keyframes float-bob{0%,100%{transform:translateY(0) rotate(-1.2deg);}50%{transform:translateY(-10px) rotate(1.2deg);}}
  @media (prefers-reduced-motion: reduce){.profile-frame{animation:none;}}
  .profile-frame img{width:100%;height:100%;object-fit:cover;display:block;}
  .profile-fallback{
    position:absolute;inset:0;display:none;align-items:center;justify-content:center;
    font-family:'Space Grotesk';font-size:52px;font-weight:600;
    background:linear-gradient(135deg,var(--violet),var(--azure));color:#fff;
  }
  .profile-stamp{
    position:absolute;bottom:14px;right:14px;
    font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;
    padding:5px 10px;border-radius:999px;
    background:rgba(10,14,31,0.7);border:1px solid var(--border-soft);
    color:var(--teal);backdrop-filter:blur(4px);
  }

  .about-bio h2{font-size:clamp(26px,3.2vw,36px);font-weight:600;margin-bottom:18px;}
  .about-bio p{font-size:15.5px;line-height:1.75;color:var(--text-muted);margin-bottom:16px;max-width:620px;}
  .about-bio p b{color:var(--text-light);font-weight:500;}

  .skills-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px;}
  .skill-pill{
    font-size:12.5px;padding:7px 14px;border-radius:999px;
    border:1px solid var(--border-soft);color:var(--text-muted);
  }

  /* ---------- Journey timeline ---------- */
  .journey{position:relative;padding-left:36px;margin-top:64px;}
  .journey-line{
    position:absolute;left:8px;top:4px;bottom:4px;width:2px;
    background-image:repeating-linear-gradient(180deg,rgba(34,211,182,0.55) 0 8px, transparent 8px 16px);
    transform:scaleY(0);transform-origin:top;
    transition:transform 1.4s cubic-bezier(.16,1,.3,1);
  }
  .journey.is-visible .journey-line{transform:scaleY(1);}
  .journey-item{position:relative;padding-bottom:44px;}
  .journey-item:last-child{padding-bottom:0;}
  .journey-dot{
    position:absolute;left:-36px;top:2px;width:18px;height:18px;border-radius:50%;
    border:2px solid var(--midnight);box-shadow:0 0 0 2px var(--border-soft);
  }
  .journey-year{font-family:'Space Grotesk';font-size:12.5px;color:var(--teal);margin-bottom:6px;letter-spacing:0.04em;}
  .journey-item h4{font-size:17px;font-weight:600;margin-bottom:6px;}
  .journey-item p{font-size:14px;line-height:1.7;color:var(--text-muted);max-width:520px;}

  /* ---------- Destination showcase (projects) ---------- */
  .destinations{
    display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
    gap:28px;
  }
  @media (max-width:820px){.destinations{grid-template-columns:1fr;}}
  .dest-card{
    position:relative;border-radius:20px;padding:32px 28px;scroll-margin-top:120px;
    border:1px solid var(--border-soft);
    background:linear-gradient(145deg,rgba(17,24,50,0.92),rgba(11,17,37,0.88));
    backdrop-filter:blur(12px);
    overflow:hidden;
  }
  .dest-card:hover{transform:translateY(-6px);}
  .dest-card::before{
    content:'';position:absolute;top:-60%;right:-40%;width:220px;height:220px;
    border-radius:50%;filter:blur(60px);opacity:0.5;
  }
  .dest-card::after{
    content:'';position:absolute;inset:0;
    background-image:radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size:16px 16px;opacity:0.4;pointer-events:none;
  }
  .dest-card.violet::before{background:var(--violet);}
  .dest-card.teal::before{background:var(--teal);}
  .dest-card.blue::before{background:var(--azure);}
  .dest-card.amber::before{background:var(--amber);}
  .dest-card.violet:hover{border-color:var(--violet);}
  .dest-card.teal:hover{border-color:var(--teal);}
  .dest-card.blue:hover{border-color:var(--azure);}
  .dest-card.amber:hover{border-color:var(--amber);}

  .dest-stamp{
    display:inline-block;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;
    padding:5px 12px;border-radius:999px;margin-bottom:18px;border:1px solid;
    position:relative;
  }
  .dest-card.violet .dest-stamp{color:#c4b5fd;border-color:rgba(139,92,246,0.4);background:rgba(139,92,246,0.12);}
  .dest-card.teal .dest-stamp{color:#7ee8d3;border-color:rgba(34,211,182,0.4);background:rgba(34,211,182,0.12);}
  .dest-card.blue .dest-stamp{color:#93c5fd;border-color:rgba(56,189,248,0.42);background:rgba(56,189,248,0.12);}
  .dest-card.amber .dest-stamp{color:#fde68a;border-color:rgba(252,196,25,0.42);background:rgba(252,196,25,0.11);}

  .dest-card h3{font-size:21px;font-weight:600;margin-bottom:10px;position:relative;}
  .dest-card .place{font-size:13px;color:var(--text-muted);margin-bottom:16px;position:relative;}
  .dest-card p.desc{font-size:14.5px;line-height:1.7;color:var(--text-muted);margin-bottom:22px;position:relative;}
  .dest-metrics{display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap;position:relative;}
  .dm{font-family:'Space Grotesk';}
  .dm-num{font-size:19px;font-weight:600;}
  .dm-label{font-size:11px;color:var(--text-muted);}
  .dest-link{font-size:13.5px;font-weight:500;display:inline-flex;align-items:center;gap:6px;position:relative;}
  .project-stack{display:flex;gap:7px;flex-wrap:wrap;margin:2px 0 22px;position:relative;}
  .project-stack span{
    padding:6px 9px;border-radius:999px;border:1px solid rgba(245,246,251,.09);
    background:rgba(255,255,255,.025);color:#aeb7d1;font-size:10.5px;
  }
  .roadmap{
    display:grid;grid-template-columns:minmax(250px,.72fr) minmax(0,1.55fr);
    gap:36px;margin-top:72px;padding-top:54px;border-top:1px solid rgba(245,246,251,.08);
  }
  .roadmap-head > span{
    display:block;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--teal);margin-bottom:12px;
  }
  .roadmap-head h3{font-size:clamp(24px,3vw,34px);line-height:1.18;margin-bottom:14px;}
  .roadmap-head p{font-size:14px;line-height:1.75;color:var(--text-muted);max-width:430px;}
  .roadmap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;}
  .roadmap-card{padding:27px 24px;min-height:100%;}
  .roadmap-card p.desc{font-size:13.5px;margin-bottom:18px;}
  @media (max-width:1050px){.roadmap{grid-template-columns:1fr;}.roadmap-head p{max-width:680px;}}
  @media (max-width:720px){.roadmap-grid{grid-template-columns:1fr;}}
  .dest-card.violet .dest-link{color:#c4b5fd;}
  .dest-card.teal .dest-link{color:#7ee8d3;}
  .dest-card.blue .dest-link{color:#93c5fd;}
  .dest-card.amber .dest-link{color:#fde68a;}
  .dest-card.project-focus{
    animation:project-focus 1.9s cubic-bezier(.16,1,.3,1);
  }
  @keyframes project-focus{
    0%{transform:translateY(0) scale(1);box-shadow:0 0 0 rgba(34,211,182,0);}
    24%{transform:translateY(-8px) scale(1.018);border-color:rgba(245,246,251,0.68);box-shadow:0 0 0 5px rgba(34,211,182,0.11),0 28px 70px -26px rgba(34,211,182,0.75);}
    100%{transform:translateY(0) scale(1);box-shadow:0 0 0 rgba(34,211,182,0);}
  }

  /* ---------- Approach ---------- */
  .approach{
    border-radius:24px;border:1px solid var(--border-soft);
    background:linear-gradient(160deg,rgba(139,92,246,0.09),rgba(34,211,182,0.06));
    padding:44px;
  }
  .approach-steps{
    display:grid;grid-template-columns:repeat(4,1fr);gap:0;
    margin-top:36px;position:relative;
  }
  .approach-steps::before{
    content:'';position:absolute;top:19px;left:6%;right:6%;height:1px;
    background-image:repeating-linear-gradient(90deg,rgba(34,211,182,0.55) 0 8px, transparent 8px 16px);
    background-size:16px 1px;
    z-index:0;
    transform:scaleX(0);transform-origin:left center;
    transition:transform 1.1s cubic-bezier(.16,1,.3,1);
    animation:dash-move 1.4s linear infinite;
  }
  .approach.is-visible .approach-steps::before{transform:scaleX(1);}
  @keyframes dash-move{to{background-position:16px 0;}}
  @media (prefers-reduced-motion: reduce){
    .approach-steps::before{animation:none;transform:scaleX(1);}
  }
  .step{position:relative;text-align:left;padding-right:20px;z-index:1;}
  .step-dot{
    width:38px;height:38px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    background:var(--midnight);border:1px solid var(--border-soft);
    font-family:'Space Grotesk';font-size:13px;font-weight:600;
    margin-bottom:18px;
  }
  .step.active .step-dot{border-color:var(--teal);color:var(--teal);box-shadow:0 0 14px rgba(34,211,182,0.4);}
  .step h4{font-size:15px;font-weight:600;margin-bottom:6px;}
  .step p{font-size:13px;color:var(--text-muted);line-height:1.6;}
  .approach-footer{
    margin-top:40px;padding-top:28px;border-top:1px solid var(--border-soft);
    font-size:14px;color:var(--text-muted);font-style:italic;font-family:'Fraunces',serif;
  }

  /* ---------- Engineering principles ---------- */
  .principles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;}
  .principle-card{
    position:relative;min-height:240px;
    border:1px solid var(--border-soft);border-radius:18px;padding:28px;
    background:rgba(13,19,40,0.86);backdrop-filter:blur(12px);
    overflow:hidden;
  }
  .principle-card::after{
    content:'';position:absolute;left:28px;right:28px;bottom:0;height:1px;
    background:linear-gradient(90deg,var(--teal),transparent);opacity:.55;
  }
  .principle-index{
    display:inline-flex;margin-bottom:46px;font-family:'Space Grotesk',sans-serif;
    font-size:11px;letter-spacing:.1em;color:var(--teal);
  }
  .principle-card h3{font-size:19px;line-height:1.3;margin-bottom:12px;}
  .principle-card p{font-size:13.5px;line-height:1.7;color:var(--text-muted);}
  @media (max-width:1100px){.principles{grid-template-columns:repeat(2,minmax(0,1fr));}}
  @media (max-width:620px){.principles{grid-template-columns:1fr;}.principle-card{min-height:auto;}.principle-index{margin-bottom:28px;}}

  /* ---------- CTA ---------- */
  .cta-section{
    margin:0 6vw 100px;border-radius:28px;overflow:hidden;position:relative;
    padding:78px 6vw;text-align:center;
    background:rgba(13,19,40,0.92);border:1px solid rgba(125,211,252,.18);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 28px 80px rgba(0,0,0,.2);
  }
  .cta-section::before{
    content:'';position:absolute;left:12%;right:12%;top:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--azure),var(--teal),transparent);
  }
  .cta-section h2{font-size:clamp(30px,4.4vw,48px);font-weight:600;color:#fff;max-width:760px;margin:0 auto;}
  .cta-section p{color:#aeb7d1;margin:18px auto 0;font-size:16px;line-height:1.7;max-width:760px;}
  .cta-btn{
    display:inline-flex;align-items:center;justify-content:center;margin-top:34px;
    min-width:210px;background:#f5f6fb;color:#080c17;
    padding:16px 34px;border-radius:999px;font-weight:600;font-size:15px;
    transition:transform .15s ease,background .2s ease;
  }
  .cta-btn:hover{background:#dff8ff;}

  /* ---------- Modern portfolio footer ---------- */
  .site-footer{
    position:relative;z-index:1;margin-top:28px;overflow:hidden;
    border-top:1px solid rgba(245,246,251,.08);
    background:#060a14;
  }
  .site-footer::before{
    content:'';position:absolute;left:0;right:0;top:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--violet),var(--azure),var(--teal),transparent);
    opacity:.76;
  }
  .footer-shell{width:min(1440px,100%);margin:0 auto;padding:76px 6vw 28px;}
  .footer-top{
    display:grid;grid-template-columns:minmax(0,1.1fr) minmax(330px,.72fr);
    gap:clamp(38px,7vw,110px);align-items:end;
    padding-bottom:54px;border-bottom:1px solid rgba(245,246,251,.085);
  }
  .footer-kicker{
    display:inline-flex;align-items:center;gap:9px;margin-bottom:18px;
    font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);
  }
  .footer-kicker::before{
    content:'';width:22px;height:1px;background:linear-gradient(90deg,var(--teal),transparent);
  }
  .footer-identity h2{
    font-family:'Space Grotesk',sans-serif;font-size:clamp(38px,6vw,78px);
    line-height:.98;letter-spacing:-.055em;font-weight:600;color:#fff;
  }
  .footer-identity h2 span{
    display:block;font-family:'Fraunces',serif;font-style:italic;font-weight:400;
    background:linear-gradient(90deg,#c4b5fd,var(--azure) 52%,var(--teal));
    -webkit-background-clip:text;background-clip:text;color:transparent;
  }
  .footer-identity p{
    max-width:620px;margin-top:24px;color:#aab3cc;font-size:15px;line-height:1.75;
  }
  .footer-contact-card{
    position:relative;padding:25px;border-radius:21px;
    border:1px solid rgba(245,246,251,.12);
    background:rgba(13,19,40,.72);
    box-shadow:0 22px 65px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.035);
  }
  .footer-contact-card::after{
    content:'';position:absolute;right:18px;top:18px;width:54px;height:54px;border-radius:50%;
    background:radial-gradient(circle,rgba(34,211,182,.18),transparent 67%);filter:blur(2px);
  }
  .footer-contact-card > span{
    display:block;font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;
  }
  .footer-contact-card h3{font-size:22px;line-height:1.25;font-weight:600;max-width:290px;}
  .footer-email{
    position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:14px;
    margin-top:24px;padding:13px 14px;border-radius:13px;
    background:rgba(255,255,255,.045);border:1px solid rgba(245,246,251,.08);
    color:#fff;font-size:12px;transition:border-color .2s ease,background .2s ease,transform .2s ease;
  }
  .footer-email span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .footer-email svg{width:16px;height:16px;flex:0 0 16px;transition:transform .2s ease;}
  .footer-email:hover{border-color:rgba(34,211,182,.46);background:rgba(34,211,182,.07);transform:translateY(-2px);}
  .footer-email:hover svg{transform:translate(2px,-2px);}

  .footer-directory{
    display:grid;grid-template-columns:1.05fr .9fr 1fr;gap:48px;
    padding:46px 0 42px;
  }
  .footer-column h4{
    font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:.09em;
    text-transform:uppercase;color:#eef1fb;margin-bottom:18px;
  }
  .footer-links{display:flex;flex-direction:column;align-items:flex-start;gap:12px;}
  .footer-links a{
    display:inline-flex;align-items:center;gap:7px;color:var(--text-muted);font-size:13px;
    transition:color .2s ease,transform .2s ease;
  }
  .footer-links a::before{content:'↗';font-size:10px;color:rgba(34,211,182,.68);}
  .footer-links a[href^='#']::before{content:'—';}
  .footer-links a:hover{color:#fff;transform:translateX(3px);}
  .footer-focus{display:flex;gap:8px;flex-wrap:wrap;max-width:330px;}
  .footer-focus span{
    padding:7px 10px;border-radius:999px;border:1px solid rgba(245,246,251,.09);
    background:rgba(255,255,255,.028);color:#aeb7d1;font-size:10.5px;
  }
  .footer-location{color:var(--text-muted);font-size:13px;line-height:1.7;}
  .footer-availability{
    display:inline-flex;align-items:center;gap:8px;margin-top:14px;color:#cbd3e6;font-size:11.5px;
  }
  .footer-availability i{width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 12px rgba(34,211,182,.72);}
  .footer-bottom{
    display:flex;align-items:center;justify-content:space-between;gap:22px;
    padding-top:24px;border-top:1px solid rgba(245,246,251,.075);
    color:#79839f;font-size:11.5px;
  }
  .back-to-top{
    display:inline-flex;align-items:center;gap:9px;color:#c5cce0;
    transition:color .2s ease,transform .2s ease;
  }
  .back-to-top span{
    width:30px;height:30px;display:grid;place-items:center;border-radius:10px;
    border:1px solid rgba(245,246,251,.1);background:rgba(255,255,255,.035);
  }
  .back-to-top:hover{color:#fff;transform:translateY(-2px);}

  @media (max-width:900px){
    .footer-top{grid-template-columns:1fr;align-items:start;}
    .footer-contact-card{max-width:560px;}
    .footer-directory{grid-template-columns:1fr 1fr;}
    .footer-column:last-child{grid-column:1/-1;}
  }
  @media (max-width:760px){
    .approach-steps{grid-template-columns:1fr 1fr;gap:24px;}
    .approach-steps::before{display:none;}
    .hero-stats{gap:28px;}
    .footer-shell{padding:64px 24px 26px;}
    .footer-directory{grid-template-columns:1fr;gap:34px;}
    .footer-column:last-child{grid-column:auto;}
    .footer-bottom{align-items:flex-start;}
  }
  @media (max-width:520px){
    .footer-top{padding-bottom:42px;}
    .footer-contact-card{padding:21px;}
    .footer-bottom{flex-direction:column-reverse;}
  }

      `}</style>

      <div className="page-background" aria-hidden="true">
        <div className="star-layer stars-far"></div>
        <div className="star-layer stars-near"></div>
        <div className="background-grid"></div>
        <svg
          id="topo-bg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 2400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="#94a3b8" strokeWidth="1">
            <path d="M-50,120 C 200,60 400,180 650,110 S 1100,50 1250,140" />
            <path d="M-50,260 C 250,190 420,320 700,250 S 1050,190 1250,290" />
            <path d="M-50,520 C 220,440 480,600 720,500 S 1080,440 1250,540" />
            <path d="M-50,780 C 260,700 460,860 730,760 S 1090,690 1250,800" />
            <path d="M-50,1040 C 240,960 470,1120 740,1010 S 1100,950 1250,1060" />
          </g>
          <g fill="none" stroke="#64748b" strokeWidth="1">
            <path d="M-50,1300 C 230,1220 490,1380 760,1270 S 1110,1210 1250,1320" />
            <path d="M-50,1560 C 250,1480 480,1640 750,1540 S 1090,1470 1250,1580" />
            <path d="M-50,1820 C 240,1740 470,1900 740,1800 S 1100,1740 1250,1850" />
            <path d="M-50,2080 C 230,2000 490,2160 760,2060 S 1110,2000 1250,2100" />
            <path d="M-50,2320 C 250,2240 480,2400 750,2300 S 1090,2240 1250,2350" />
          </g>
        </svg>
      </div>

      <header className="site-header">
        <div className="nav-shell">
          <a
            href="#home"
            className="brand-lockup"
            aria-label="Rhulani Matiane — back to the top"
          >
            <span className="brand-mark" aria-hidden="true">
              <span>RM</span>
            </span>
            <span className="brand-copy">
              <strong>Rhulani Matiane</strong>
              <small>Software Engineer · Data · Security</small>
            </span>
          </a>

          <nav className="site-nav" aria-label="Primary navigation">
            <a href="#home" data-nav-target="home">
              Home
            </a>
            <a href="#about" data-nav-target="about">
              About
            </a>
            <a href="#work" data-nav-target="work">
              Projects
            </a>
            <a href="#approach" data-nav-target="approach">
              Approach
            </a>
          </nav>

          <div className="nav-actions">
            <span className="nav-status">
              <i aria-hidden="true"></i>Based in Pretoria
            </span>
            <a href="#contact" className="nav-cta">
              <span className="nav-cta-label">Let's talk</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div id="home" className="hero" data-nav-section="home">
        <div className="noise-line"></div>
        <div className="globe-stage">
          <canvas
            id="globe-canvas"
            aria-label="Interactive globe showing portfolio projects. Hover over a project marker for details and click it to jump to the matching portfolio card."
          ></canvas>
          <div
            id="globe-tooltip"
            className="globe-tooltip"
            data-status="done"
            role="tooltip"
            aria-hidden="true"
          >
            <div className="globe-tooltip-meta">
              <span id="globe-tooltip-status" className="globe-tooltip-status">
                Completed
              </span>
              <span className="globe-tooltip-action">View project ↓</span>
            </div>
            <strong id="globe-tooltip-title"></strong>
            <p id="globe-tooltip-description"></p>
          </div>
          <div className="globe-caption">
            <strong>Project map</strong>
            <p className="globe-instructions">
              Hover for details · click a marker to view
            </p>
            <div className="globe-legend">
              <span className="legend-item">
                <i className="legend-dot done" aria-hidden="true"></i>Completed
              </span>
              <span className="legend-item">
                <i className="legend-dot active" aria-hidden="true"></i>In progress
              </span>
              <span className="legend-item">
                <i className="legend-dot planned" aria-hidden="true"></i>Planned
              </span>
            </div>
          </div>
        </div>

        <div className="hero-copy">
          <div className="eyebrow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
            <span>Software Engineer · Data Science · Cybersecurity</span>
          </div>
          <h1>
            Every project is another <em>stamp in the passport.</em>
          </h1>
          <p>
            I'm Rhulani Matiane, a software engineer focused on building
            robust applications and backend systems. I'm especially
            interested in data-driven systems and cybersecurity, using evidence
            to make software smarter, and secure engineering to make it worthy
            of trust.
          </p>
          <div className="hero-ctas">
            <a href="#work" className="btn-primary">
              View selected work
            </a>
            <a href="#about" className="btn-ghost">
              About me →
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-block">
              <div className="stat-num">
                <span className="count-up" data-target="1">
                  0
                </span>
                +
              </div>
              <div className="stat-label">Year applied experience</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">
                <span className="count-up" data-target="4">
                  0
                </span>
              </div>
              <div className="stat-label">Selected projects</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">
                <span className="count-up" data-target="3">
                  0
                </span>
              </div>
              <div className="stat-label">Core interests</div>
            </div>
          </div>
        </div>

        <div className="scroll-cue">
          <span>Scroll to explore</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>

      <section id="about" data-nav-section="about">
        <div className="section-head reveal">
          <div className="section-eyebrow">About</div>
          <h2>Software engineering is the foundation</h2>
          <p>
            I build software first. Data science and cybersecurity expand how I
            investigate problems, measure decisions, and design systems I can trust.
          </p>
        </div>

        <div className="about-grid">
          <div className="profile-frame reveal">
            <img id="profile-img" src="/images/Profile.png" alt="Rhulani Matiane" />
            <div className="profile-fallback" id="profile-fallback">
              RM
            </div>
            <span className="profile-stamp">Pretoria, ZA</span>
          </div>

          <div className="about-bio reveal">
            <p>
              <b>
                I'm a software engineer and part-time Computer Science Honours student at
                the University of Pretoria.
              </b>{" "}
              My foundation is software engineering: understanding the problem,
              designing the architecture, implementing the system, testing its
              behaviour, and leaving behind documentation another developer can
              actually follow.
            </p>
            <p>
              Data science gives me another way to reason about software when a
              problem needs evidence, prediction, or measurement. Cybersecurity
              makes me think carefully about failure, access, misuse, and trust.
              Both make me a more deliberate engineer.
            </p>
            <p>
              My work so far spans backend and platform design, explainable
              machine learning, digital forensics, multilingual NLP, and
              formal-verification research. The common thread is simple: readable
              code, measurable decisions, and systems people can understand after
              I have moved on.
            </p>
            <div className="skills-row">
              <span className="skill-pill">Software architecture</span>
              <span className="skill-pill">Backend development</span>
              <span className="skill-pill">
                Java · Python · C++ · JavaScript
              </span>
              <span className="skill-pill">SQL · APIs</span>
              <span className="skill-pill">
                Data science &amp; machine learning
              </span>
              <span className="skill-pill">Cybersecurity</span>
              <span className="skill-pill">Testing &amp; documentation</span>
            </div>
          </div>
        </div>

        <div className="journey reveal">
          <div className="journey-line"></div>
          <div className="journey-item">
            <div
              className="journey-dot"
              style={{ background: "var(--violet)" }}
            ></div>
            <div className="journey-year">Engineering foundation</div>
            <h4>Build the system properly</h4>
            <p>
              I translate requirements into maintainable systems: clear
              boundaries, sensible data models, testable behaviour, and
              interfaces that another developer can extend.
            </p>
          </div>
          <div className="journey-item">
            <div
              className="journey-dot"
              style={{ background: "var(--teal)" }}
            ></div>
            <div className="journey-year">Data &amp; machine learning</div>
            <h4>Use evidence to improve decisions</h4>
            <p>
              I use data science to move beyond intuition: establish a baseline,
              choose meaningful metrics, evaluate limitations, and explain what
              the model can and cannot support.
            </p>
          </div>
          <div className="journey-item">
            <div
              className="journey-dot"
              style={{ background: "var(--azure)" }}
            ></div>
            <div className="journey-year">Security mindset</div>
            <h4>Design for failure, misuse, and recovery</h4>
            <p>
              I treat validation, access, misuse, failure modes, and
              auditability as engineering concerns from the beginning rather
              than a checklist added at the end.
            </p>
          </div>
          <div className="journey-item">
            <div
              className="journey-dot"
              style={{ background: "var(--amber)" }}
            ></div>
            <div className="journey-year">Current research</div>
            <h4>Turn complex evidence into useful guidance</h4>
            <p>
              My Honours research combines CBMC, ESBMC, and language models to
              turn formal-verification evidence into useful feedback for student
              C++ code.
            </p>
          </div>
        </div>
      </section>

      <section id="work" data-nav-section="work">
        <div className="section-head reveal">
          <div className="section-eyebrow">Selected work</div>
          <h2>Projects that show how I think</h2>
          <p>
            A selection of work across software engineering, data science, and
            cybersecurity — focused on the problem, the technical decisions,
            and the evidence behind the result.
          </p>
        </div>

        <div className="destinations tilt-area">
          <article id="project-peer-review" className="dest-card blue reveal">
            <span className="dest-stamp">Completed · Software engineering</span>
            <h3>Mzansi Builds</h3>
            <div className="place">Full Stack Web Application</div>
            <p className="desc">
              A modern platform for builders to connect, collaborate, and build in public. 
              Users can share progress, showcase projects through a live feed, and engage with other creators. 
              The project emphasised intuitive UX, professional interface design, secure implementation, and 
              maintainable software engineering practices. Its development followed an iterative SDLC 
              and Agile workflow, supported by documented planning, testing, refinement, and version-controlled 
              collaboration in the GitHub repository.
            </p>
            <div className="dest-metrics">
              <div className="dm">
                <div className="dm-num">2</div>
                <div className="dm-label">Full implementations</div>
              </div>
              <div className="dm">
                <div className="dm-num">SDLC principles</div>
                <div className="dm-label">Observed</div>
              </div>
            </div>
            <div
              className="project-stack"
              aria-label="Technologies and concepts"
            >
              <span>System design</span>
              <span>UI/UX design</span>
              <span>Full stack development</span>
              <span>Unit, Integration and end-2-end testing</span>
            </div>
            
            <div className="dest-links">
            <a
              href="https://github.com/Rhulani756/mzansibuilds"
              className="dest-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View GitHub repository →
            </a>

            <a
              href="https://mzansibuilds-web-git.vercel.app/"
              className="dest-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View live site ↗
            </a>
          </div>
          </article>

          <article id="project-threatsense" className="dest-card violet reveal">
            <span className="dest-stamp">Completed · Cybersecurity</span>
            <h3>ThreatSense</h3>
            <div className="place">Explainable insider-threat detection</div>
            <p className="desc">
              A hybrid Random Forest and XGBoost system for identifying risky
              employee behaviour. The engineering challenge was not only
              detecting anomalies, but producing an explainable risk score that
              an investigator could act on.
            </p>
            <div className="dest-metrics">
              <div className="dm">
                <div className="dm-num">RF + XGB</div>
                <div className="dm-label">Hybrid detection</div>
              </div>
              <div className="dm">
                <div className="dm-num">Explainable</div>
                <div className="dm-label">Risk scoring</div>
              </div>
            </div>
            <div
              className="project-stack"
              aria-label="Technologies and concepts"
            >
              <span>Python</span>
              <span>Machine learning</span>
              <span>Security analytics</span>
              <span>Model explainability</span>
            </div>
            <a href="https://github.com/Rhulani756/cos720-insider-threat/tree/main" className="dest-link" target="_blank"
              rel="noopener noreferrer">
              View GitHub repository →
            </a>
          </article>

          <article id="api-threat-assessment-tool" className="dest-card violet reveal">
            <span className="dest-stamp">Completed · Cybersecurity/Software Engineering</span>
            <h3>API Threat Assessment Tool</h3>
            <div className="place">Automated API security analysis</div>
            <p className="desc">
              A comprehensive cybersecurity platform designed to automate
              the security testing of APIs, enabling organizations to identify 
              vulnerabilities early, improve API resilience, and comply with 
              industry security standards.
            </p>
            <div className="dest-metrics">
              <div className="dm">
                <div className="dm-num">OWASP Top 10</div>
                <div className="dm-label">Automatic scanning of OWASP Top 10 vulnerabilities</div>
              </div>
              <div className="dm">
                <div className="dm-num">Executive and Technical Reporting</div>
                <div className="dm-label">Comprehensive reporting</div>
              </div>
            </div>
            <div
              className="project-stack"
              aria-label="Technologies and concepts"
            >
              <span>Python</span>
              <span>Web Development</span>
              <span>Security analytics</span>
              <span>Automation</span>
            </div>
            <a href="https://github.com/COS301-SE-2025/API-Threat-Assessment-Tool" className="dest-link" target="_blank"
              rel="noopener noreferrer">
              View GitHub repository →
            </a>
          </article>

          <article
            id="project-multilingual-ai"
            className="dest-card teal reveal"
          >
            <span className="dest-stamp">Completed · Data science</span>
            <h3>Cross-language AI text detection</h3>
            <div className="place">isiZulu · isiXhosa · English</div>
            <p className="desc">
              A multilingual detector evaluated across isiZulu, isiXhosa, and
              English. The project explores what changes when an NLP problem is
              designed for underrepresented languages instead of treating
              English performance as universal.
            </p>
            <div className="dest-metrics">
              <div className="dm">
                <div className="dm-num">3</div>
                <div className="dm-label">Languages evaluated</div>
              </div>
              <div className="dm">
                <div className="dm-num">19</div>
                <div className="dm-label">Test cases</div>
              </div>
            </div>
            <div
              className="project-stack"
              aria-label="Technologies and concepts"
            >
              <span>Python</span>
              <span>NLP</span>
              <span>Multilingual evaluation</span>
              <span>Responsible AI</span>
            </div>
            <a href="https://github.com/qais-mle7y/COS760-Project" className="dest-link" target="_blank" rel="noopener noreferrer">
              View GitHub Repository →
            </a>
          </article>

          

          <article
            id="project-formal-verification"
            className="dest-card amber reveal"
          >
            <span className="dest-stamp">In progress · Honours research</span>
            <h3>Formal verification + LLM feedback</h3>
            <div className="place">Formal methods made useful to learners</div>
            <p className="desc">
              An Honours research system that translates bounded-model-checker
              output into clear feedback for student C++ code. The goal is to
              make rigorous verification evidence useful without hiding or
              weakening it.
            </p>
            <div className="dest-metrics">
              <div className="dm">
                <div className="dm-num">CBMC + ESBMC</div>
                <div className="dm-label">Verification evidence</div>
              </div>
              <div className="dm">
                <div className="dm-num">LLM</div>
                <div className="dm-label">Pedagogical feedback</div>
              </div>
            </div>
            <div
              className="project-stack"
              aria-label="Technologies and concepts"
            >
              <span>C++</span>
              <span>Formal verification</span>
              <span>LLMs</span>
              <span>Research</span>
            </div>
            <a href="#contact" className="dest-link">
              Ask about the research →
            </a>
          </article>
        </div>

        <div className="roadmap reveal">
          <div className="roadmap-head">
            <span>In development</span>
            <h3>What I'm building next</h3>
            <p>
              These are planned portfolio projects chosen to deepen my experience
              in developer tooling, automation, and production-minded data engineering.
            </p>
          </div>
          <div className="roadmap-grid tilt-area">
            <article
              id="project-python-automation"
              className="dest-card roadmap-card violet"
            >
              <span className="dest-stamp">Planned · Developer tooling</span>
              <h3>Developer automation toolkit</h3>
              <div className="place">Python · APIs · workflow automation</div>
              <p className="desc">
                Production-minded tools for report generation, document
                processing, API integration, and repetitive developer workflows
                 designed with configuration, logging, and failure handling
                from the start.
              </p>
              <div className="project-stack">
                <span>Python</span>
                <span>APIs</span>
                <span>Automation</span>
                <span>Observability</span>
              </div>
              <a href="#contact" className="dest-link">
                Discuss the roadmap →
              </a>
            </article>

            <article
              id="project-data-platform"
              className="dest-card roadmap-card teal"
            >
              <span className="dest-stamp">Planned · Data engineering</span>
              <h3>Observable data pipeline</h3>
              <div className="place">
                Ingestion · transformation · monitoring
              </div>
              <p className="desc">
                A reliable data platform that validates incoming data, applies
                reproducible transformations, exposes useful outputs, and makes
                failures visible. The emphasis is reliability and observability,
                not just moving rows from A to B.
              </p>
              <div className="project-stack">
                <span>ETL</span>
                <span>Data validation</span>
                <span>Monitoring</span>
                <span>Reproducibility</span>
              </div>
              <a href="#contact" className="dest-link">
                Discuss the roadmap →
              </a>
            </article>
          </div>
        </div>
      </section>

      <section id="approach" data-nav-section="approach">
        <div className="section-head reveal">
          <div className="section-eyebrow">How I work</div>
          <h2>From problem to production-minded solution</h2>
          <p>
            My process is straightforward: understand the constraints, design
            the system, build an end-to-end solution, and improve it with tests,
            feedback, and evidence.
          </p>
        </div>

        <div className="approach reveal">
          <div className="approach-steps">
            <div className="step active">
              <div className="step-dot">1</div>
              <h4>Understand the problem</h4>
              <p>
                Understand the user, constraints, risks, and success criteria
                before choosing the technology or writing the first line.
              </p>
            </div>
            <div className="step">
              <div className="step-dot">2</div>
              <h4>Design the system</h4>
              <p>
                Choose clear boundaries, data flows, and interfaces that solve
                the current problem without making the next change unnecessarily hard.
              </p>
            </div>
            <div className="step">
              <div className="step-dot">3</div>
              <h4>Build and validate</h4>
              <p>
                Get an end-to-end version working early, then refine it with
                tests, feedback, profiling, and measured evidence.
              </p>
            </div>
            <div className="step">
              <div className="step-dot">4</div>
              <h4>Document and improve</h4>
              <p>
                Validate assumptions, inspect failure modes, document the
                trade-offs, and leave the system understandable for the next engineer.
              </p>
            </div>
          </div>
          <div className="approach-footer">
            Good engineering is not only making software work. It is making the
            decisions behind it clear enough to test, challenge, and improve.
          </div>
        </div>
      </section>

      <section id="notes">
        <div className="section-head reveal">
          <div className="section-eyebrow">Engineering principles</div>
          <h2>How I want my work to hold up</h2>
          <p>
            Different projects demand different tools, but these principles stay
            consistent across the software I build.
          </p>
        </div>

        <div className="principles tilt-area">
          <article className="principle-card reveal">
            <span className="principle-index">01</span>
            <h3>Clarity over cleverness</h3>
            <p>
              Readable code, explicit assumptions, and names that reveal intent.
              A system should still make sense when its original author is no
              longer there to explain it.
            </p>
          </article>
          <article className="principle-card reveal">
            <span className="principle-index">02</span>
            <h3>Evidence over assumptions</h3>
            <p>
              Tests, profiles, metrics, and data should shape technical decisions.
              I would rather report a modest result honestly than defend an
              impressive guess.
            </p>
          </article>
          <article className="principle-card reveal">
            <span className="principle-index">03</span>
            <h3>Security by design</h3>
            <p>
              Validation, access control, misuse, recovery, and auditability are
              engineering concerns from the beginning, not paperwork added at
              the end.
            </p>
          </article>
          <article className="principle-card reveal">
            <span className="principle-index">04</span>
            <h3>Make systems explainable</h3>
            <p>
              Whether the output comes from an API, a model, or a verification
              tool, people should understand what produced it and how to act on it.
            </p>
          </article>
        </div>
      </section>

      <div id="contact" className="cta-section reveal">
        <h2>Let's build something worth shipping.</h2>
        <p>
          I'm looking for software engineering and developer opportunities where
          I can contribute to real products, grow alongside strong engineers,
          and bring an informed interest in data and cybersecurity.
        </p>
        <a href="mailto:rhulanimatiane756@gmail.com" className="cta-btn">
          Start a conversation →
        </a>
      </div>

      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-top">
            <div className="footer-identity">
              <div className="footer-kicker">
                Software Engineer · Selected Work
              </div>
              <h2>
                Build dependable software.{" "}
                <span>Use data well. Respect the risk.</span>
              </h2>
              <p>
                I'm Rhulani Matiane, a software engineer in Pretoria with
                interests in data science, machine learning, and cybersecurity.
              </p>
            </div>

            <div className="footer-contact-card">
              <span>Have a project or opportunity?</span>
              <h3>Let's talk about the problem you're trying to solve.</h3>
              <a
                className="footer-email"
                href="mailto:rhulanimatiane756@gmail.com"
              >
                <span>rhulanimatiane756@gmail.com</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-directory">
            <div className="footer-column">
              <h4>Explore</h4>
              <div className="footer-links">
                <a href="#about">About</a>
                <a href="#work">Selected projects</a>
                <a href="#approach">How I work</a>
                <a href="#notes">Engineering principles</a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Focus areas</h4>
              <div className="footer-focus">
                <span>Software engineering</span>
                <span>Backend systems</span>
                <span>Data science</span>
                <span>Machine learning</span>
                <span>Cybersecurity</span>
                <span>Developer automation</span>
              </div>
            </div>

            <div className="footer-column">
              <h4>Connect</h4>
              <div className="footer-links">
                <a href="mailto:rhulanimatiane756@gmail.com">Email</a>
                <a
                  href="https://www.linkedin.com/in/rhulani-matiane"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </div>
              <p className="footer-location">
                Pretoria, Gauteng
                <br />
                South Africa
              </p>
              <span className="footer-availability">
                <i aria-hidden="true"></i>Open to software engineering and
                developer opportunities
              </span>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} Rhulani Matiane · Built in Pretoria,
              South Africa.
            </p>
            <a href="#home" className="back-to-top">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
        onLoad={initGlobe}
      />
    </>
  );
}

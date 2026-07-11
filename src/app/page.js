'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  useEffect(() => {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
      /* ---------- Scroll reveal ---------- */
      var revealEls = document.querySelectorAll('.reveal');
      if('IntersectionObserver' in window && !reduceMotion){
        var io = new IntersectionObserver(function(entries){
          entries.forEach(function(entry, i){
            if(entry.isIntersecting){
              setTimeout(function(){ entry.target.classList.add('is-visible'); }, i * 60);
              io.unobserve(entry.target);
            }
          });
        }, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});
        revealEls.forEach(function(el){ io.observe(el); });
      } else {
        revealEls.forEach(function(el){ el.classList.add('is-visible'); });
      }
    
      /* ---------- 3D pointer tilt for cards ---------- */
      if(!reduceMotion){
        document.querySelectorAll('.dest-card, .tcard').forEach(function(card){
          card.addEventListener('mousemove', function(e){
            var r = card.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = 'translateY(-6px) rotateX(' + (y * -8) + 'deg) rotateY(' + (x * 10) + 'deg)';
          });
          card.addEventListener('mouseleave', function(){
            card.style.transform = '';
          });
        });
      }
    
      /* ---------- Magnetic buttons ---------- */
      if(!reduceMotion){
        document.querySelectorAll('.btn-primary, .btn-ghost, .cta-btn').forEach(function(btn){
          btn.addEventListener('mousemove', function(e){
            var r = btn.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            btn.style.transform = 'translate(' + (x * 8) + 'px,' + (y * 8) + 'px)';
          });
          btn.addEventListener('mouseleave', function(){
            btn.style.transform = '';
          });
        });
      }
    
      /* ---------- Count-up stats ---------- */
      var counters = document.querySelectorAll('.count-up');
      if(counters.length){
        var counted = false;
        var statsIo = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting && !counted){
              counted = true;
              counters.forEach(function(el){
                var target = parseInt(el.getAttribute('data-target'), 10) || 0;
                if(reduceMotion){ el.textContent = target; return; }
                var start = null;
                var duration = 900;
                function step(ts){
                  if(!start) start = ts;
                  var progress = Math.min((ts - start) / duration, 1);
                  el.textContent = Math.round(progress * target);
                  if(progress < 1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
              });
              statsIo.disconnect();
            }
          });
        }, {threshold:0.4});
        statsIo.observe(document.querySelector('.hero-stats'));
      }
    
      /* ---------- Profile photo fallback ---------- */
      var profileImg = document.getElementById('profile-img');
      var profileFallback = document.getElementById('profile-fallback');
      if(profileImg && profileFallback){
        profileImg.addEventListener('error', function(){
          profileImg.style.display = 'none';
          profileFallback.style.display = 'flex';
        });
      }
    
      /* ---------- Parallax on hero background ---------- */
      if(!reduceMotion){
        var aurora = document.querySelector('.aurora-field');
        window.addEventListener('scroll', function(){
          var y = window.scrollY;
          if(aurora) aurora.style.transform = 'translateY(' + (y * 0.15) + 'px)';
        }, {passive:true});
      }
    
      /* ---------- Journey timeline reveal trigger ---------- */
      var journeyEl = document.querySelector('.journey');
      if(journeyEl){
        var jIo = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              entry.target.classList.add('is-visible');
              jIo.unobserve(entry.target);
            }
          });
        }, {threshold:0.2});
        jIo.observe(journeyEl);
      }
    
      /* ---------- Approach panel reveal trigger ---------- */
      var approachEl = document.querySelector('.approach');
      if(approachEl){
        var aIo = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              entry.target.classList.add('is-visible');
              aIo.unobserve(entry.target);
            }
          });
        }, {threshold:0.2});
        aIo.observe(approachEl);
      }

    return () => {
      // Observers/listeners above are self-disconnecting (unobserve on trigger)
      // or harmless to leave attached for the component's lifetime in a single-page portfolio.
    };
  }, []);

  // Called once three.js has loaded from the CDN script below.
  function initGlobe() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.getElementById('globe-canvas');
      if(canvas && window.THREE && !reduceMotion){
        var w = canvas.clientWidth || 520, h = canvas.clientHeight || 520;
        var renderer = new THREE.WebGLRenderer({canvas:canvas, alpha:true, antialias:true});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
    
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 6.4;
    
        var earthGroup = new THREE.Group();
        earthGroup.rotation.z = (23.4 * Math.PI) / 180; // real-ish axial tilt
        scene.add(earthGroup);
    
        var TEX_BASE = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/';
        var textureLoader = new THREE.TextureLoader();
        if (textureLoader.setCrossOrigin) textureLoader.setCrossOrigin('anonymous');
    
        var readyCount = 0;
        var revealed = false;
        function markLoaded(){
          readyCount++;
          if(readyCount >= 2 && !revealed){
            revealed = true;
            requestAnimationFrame(function(){ canvas.classList.add('is-ready'); });
          }
        }
        // Safety net: reveal anyway after 4s even if a texture is slow/blocked,
        // so the globe (lit, even if partially textured) doesn't stay invisible.
        setTimeout(function(){
          if(!revealed){ revealed = true; canvas.classList.add('is-ready'); }
        }, 4000);
    
        var dayMap = textureLoader.load(TEX_BASE + 'earth_atmos_2048.jpg', markLoaded, undefined, markLoaded);
        var specMap = textureLoader.load(TEX_BASE + 'earth_specular_2048.jpg');
        var normalMap = textureLoader.load(TEX_BASE + 'earth_normal_2048.jpg');
        var cloudsMap = textureLoader.load(TEX_BASE + 'earth_clouds_1024.png', markLoaded, undefined, markLoaded);
    
        var earthRadius = 2.1;
    
        var earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
        var earthMat = new THREE.MeshPhongMaterial({
          map: dayMap,
          specularMap: specMap,
          specular: new THREE.Color(0x333333),
          shininess: 7,
          normalMap: normalMap,
          normalScale: new THREE.Vector2(0.55, 0.55)
        });
        var earthMesh = new THREE.Mesh(earthGeo, earthMat);
        earthGroup.add(earthMesh);
    
        var cloudsGeo = new THREE.SphereGeometry(earthRadius * 1.012, 64, 64);
        var cloudsMat = new THREE.MeshLambertMaterial({
          map: cloudsMap,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        });
        var cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        earthGroup.add(cloudsMesh);
    
        // Fresnel-style atmosphere rim glow
        var atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.16, 64, 64);
        var atmosphereMat = new THREE.ShaderMaterial({
          vertexShader:
            'varying vec3 vNormal;\n' +
            'void main(){\n' +
            '  vNormal = normalize( normalMatrix * normal );\n' +
            '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
            '}',
          fragmentShader:
            'varying vec3 vNormal;\n' +
            'void main(){\n' +
            '  float intensity = pow( 0.68 - dot( vNormal, vec3(0.0, 0.0, 1.0) ), 4.0 );\n' +
            '  gl_FragColor = vec4( 0.35, 0.65, 1.0, 1.0 ) * intensity;\n' +
            '}',
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
        var atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        scene.add(atmosphereMesh);
    
        // Lighting -- soft ambient fill + a directional "sun"
        scene.add(new THREE.AmbientLight(0x40507a, 1.7));
        var sun = new THREE.DirectionalLight(0xffffff, 1.05);
        sun.position.set(5, 2, 5);
        scene.add(sun);
    
        // Home marker: Pretoria, with a pulsing radar ring
        function latLongToVector3(lat, lon, radius){
          var phi = (90 - lat) * (Math.PI / 180);
          var theta = (lon + 180) * (Math.PI / 180);
          return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
          );
        }
        var markerPos = latLongToVector3(-25.7479, 28.2293, earthRadius * 1.01);
    
        var markerMat = new THREE.MeshBasicMaterial({color: 0x22d3b6});
        var marker = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), markerMat);
        marker.position.copy(markerPos);
        earthGroup.add(marker);
    
        var pulseMat = new THREE.MeshBasicMaterial({color:0x22d3b6, transparent:true, opacity:0.6, side:THREE.DoubleSide});
        var pulse = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.09, 24), pulseMat);
        pulse.position.copy(markerPos);
        pulse.lookAt(markerPos.clone().multiplyScalar(2));
        earthGroup.add(pulse);
    
        var targetRotX = 0, targetRotY = 0;
        window.addEventListener('mousemove', function(e){
          targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.5;
          targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.25;
        });
    
        var clock = new THREE.Clock();
        function animate(){
          requestAnimationFrame(animate);
          var delta = Math.min(clock.getDelta(), 0.05);
    
          earthMesh.rotation.y += delta * 0.06;
          cloudsMesh.rotation.y += delta * 0.075;
    
          var pulseT = (clock.elapsedTime * 0.6) % 1;
          var pulseScale = 1 + pulseT * 2.2;
          pulse.scale.set(pulseScale, pulseScale, pulseScale);
          pulseMat.opacity = 0.6 * (1 - pulseT);
    
          earthGroup.rotation.x += (targetRotX - earthGroup.rotation.x) * 0.04;
          earthGroup.rotation.y += (targetRotY - earthGroup.rotation.y) * 0.03;
    
          renderer.render(scene, camera);
        }
        animate();
    
        window.addEventListener('resize', function(){
          var nw = canvas.clientWidth, nh = canvas.clientHeight;
          if(!nw || !nh) return;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        });
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
    --coral:#f5567d;
    --amber:#fcc419;
    --text-light:#f5f6fb;
    --text-muted:#9aa3c0;
    --border-soft:rgba(245,246,251,0.1);
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    background:var(--midnight);
    color:var(--text-light);
    font-family:'Inter',sans-serif;
    overflow-x:hidden;
    position:relative;
  }
  h1,h2,h3,.display{font-family:'Space Grotesk',sans-serif;}
  .voice{font-family:'Fraunces',serif;font-style:italic;}
  a{color:inherit;text-decoration:none;}

  /* ---------- Full-page topo/map watermark ---------- */
  #topo-bg{
    position:fixed;inset:0;width:100%;height:100%;
    z-index:0;opacity:0.05;pointer-events:none;
  }

  /* ---------- Aurora backdrop ---------- */
  .aurora-field{
    position:absolute;inset:0;
    overflow:hidden;
    filter:blur(70px);
    opacity:0.75;
    pointer-events:none;
  }
  .blob{position:absolute;border-radius:50%;mix-blend-mode:screen;}
  .blob-1{width:520px;height:520px;background:var(--violet);top:-140px;left:-100px;animation:drift1 22s ease-in-out infinite;}
  .blob-2{width:460px;height:460px;background:var(--teal);top:60px;right:-160px;animation:drift2 26s ease-in-out infinite;}
  .blob-3{width:400px;height:400px;background:var(--coral);bottom:-180px;left:30%;animation:drift3 19s ease-in-out infinite;}
  @keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}
  @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,60px)}}
  @keyframes drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-50px)}}
  @media (prefers-reduced-motion: reduce){.blob{animation:none;}}

  .noise-line{
    position:absolute;inset:0;
    background-image:radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size:22px 22px;
    pointer-events:none;
  }

  /* ---------- 3D globe (signature element) ---------- */
  #globe-canvas{
    position:absolute;top:50%;right:max(1vw,16px);transform:translateY(-50%);
    width:min(36vw,440px);height:min(36vw,440px);
    max-width:calc(100vw - 32px);
    pointer-events:none;opacity:0;
    transition:opacity 1.2s ease;
  }
  #globe-canvas.is-ready{opacity:1;}
  @media (max-width:980px){#globe-canvas{display:none;}}

  /* ---------- Reveal on scroll ---------- */
  .reveal{opacity:0;transform:translateY(32px);transition:opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1);}
  .reveal.is-visible{opacity:1;transform:translateY(0);}
  @media (prefers-reduced-motion: reduce){
    .reveal{opacity:1;transform:none;transition:none;}
  }

  /* ---------- 3D tilt cards ---------- */
  .tilt-area{perspective:1200px;}
  .dest-card, .tcard{
    transform-style:preserve-3d;
    will-change:transform;
    transition:transform .15s ease, border-color .25s ease, box-shadow .3s ease;
  }
  .dest-card:hover, .tcard:hover{box-shadow:0 24px 48px -20px rgba(0,0,0,0.55);}
  @media (prefers-reduced-motion: reduce){
    .dest-card, .tcard{transition:border-color .25s ease;}
  }

  /* ---------- Nav ---------- */
  nav{
    position:sticky;top:0;z-index:50;
    display:flex;justify-content:space-between;align-items:center;
    padding:22px 6vw;
    backdrop-filter:blur(14px);
    background:rgba(10,14,31,0.55);
    border-bottom:1px solid var(--border-soft);
  }
  .brand{font-weight:600;font-size:18px;letter-spacing:0.02em;}
  .brand span{color:var(--teal);}
  .navlinks{display:flex;gap:32px;font-size:14px;color:var(--text-muted);}
  .navlinks a:hover{color:var(--text-light);}
  .navcta{
    border:1px solid var(--border-soft);
    padding:9px 18px;border-radius:999px;font-size:13px;
    background:rgba(255,255,255,0.04);
    transition:all .2s ease;
  }
  .navcta:hover{border-color:var(--teal);color:var(--teal);}

  /* ---------- Hero ---------- */
  .hero{
    position:relative;
    padding:110px 6vw 90px;
    min-height:82vh;
    display:flex;flex-direction:column;justify-content:center;
    z-index:1;
    overflow:hidden;
  }
  .eyebrow{
    position:relative;
    display:inline-flex;align-items:center;gap:9px;
    font-size:12px;letter-spacing:0.07em;text-transform:uppercase;
    color:var(--teal);margin-bottom:28px;
    padding:8px 18px 8px 14px;
    border-radius:999px 6px 6px 999px;
    background:rgba(34,211,182,0.08);
    border:1px solid rgba(34,211,182,0.28);
    border-right-style:dashed;
  }
  .eyebrow svg{width:13px;height:13px;flex-shrink:0;}
  .hero h1{
    font-size:clamp(36px,6vw,72px);
    line-height:1.22;font-weight:600;
    max-width:820px;
    letter-spacing:-0.01em;
    padding-bottom:4px;
  }
  .hero h1 em{
    font-family:'Fraunces',serif;font-style:italic;font-weight:500;
    background:linear-gradient(90deg,var(--violet),var(--teal) 60%,var(--coral));
    -webkit-background-clip:text;background-clip:text;color:transparent;
    display:inline-block;
    line-height:1.3;
    padding-bottom:0.06em;
  }
  .hero p{
    max-width:540px;margin-top:22px;font-size:16.5px;line-height:1.7;
    color:var(--text-muted);
  }
  .hero-ctas{display:flex;gap:16px;margin-top:38px;flex-wrap:wrap;}
  .btn-primary{
    background:linear-gradient(90deg,var(--violet),var(--coral));
    color:#fff;padding:14px 28px;border-radius:999px;
    font-weight:500;font-size:14.5px;
    box-shadow:0 8px 30px -8px rgba(139,92,246,0.55);
    transition:transform .15s ease;
    display:inline-block;
  }
  .btn-ghost{
    padding:14px 26px;border-radius:999px;font-size:14.5px;
    border:1px solid var(--border-soft);color:var(--text-light);
    transition:all .15s ease;
    display:inline-block;
  }
  .btn-ghost:hover{border-color:var(--text-light);}

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
    background:linear-gradient(135deg,var(--violet),var(--coral));color:#fff;
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
    display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
    gap:28px;
  }
  .dest-card{
    position:relative;border-radius:20px;padding:32px 28px;
    border:1px solid var(--border-soft);
    background:var(--midnight-2);
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
  .dest-card.coral::before{background:var(--coral);}
  .dest-card.violet:hover{border-color:var(--violet);}
  .dest-card.teal:hover{border-color:var(--teal);}
  .dest-card.coral:hover{border-color:var(--coral);}

  .dest-stamp{
    display:inline-block;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;
    padding:5px 12px;border-radius:999px;margin-bottom:18px;border:1px solid;
    position:relative;
  }
  .dest-card.violet .dest-stamp{color:#c4b5fd;border-color:rgba(139,92,246,0.4);background:rgba(139,92,246,0.12);}
  .dest-card.teal .dest-stamp{color:#7ee8d3;border-color:rgba(34,211,182,0.4);background:rgba(34,211,182,0.12);}
  .dest-card.coral .dest-stamp{color:#f9a8bd;border-color:rgba(245,86,125,0.4);background:rgba(245,86,125,0.12);}

  .dest-card h3{font-size:21px;font-weight:600;margin-bottom:10px;position:relative;}
  .dest-card .place{font-size:13px;color:var(--text-muted);margin-bottom:16px;position:relative;}
  .dest-card p.desc{font-size:14.5px;line-height:1.7;color:var(--text-muted);margin-bottom:22px;position:relative;}
  .dest-metrics{display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap;position:relative;}
  .dm{font-family:'Space Grotesk';}
  .dm-num{font-size:19px;font-weight:600;}
  .dm-label{font-size:11px;color:var(--text-muted);}
  .dest-link{font-size:13.5px;font-weight:500;display:inline-flex;align-items:center;gap:6px;position:relative;}
  .dest-card.violet .dest-link{color:#c4b5fd;}
  .dest-card.teal .dest-link{color:#7ee8d3;}
  .dest-card.coral .dest-link{color:#f9a8bd;}

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

  /* ---------- Testimonials ---------- */
  .testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;}
  .tcard{
    border:1px solid var(--border-soft);border-radius:18px;padding:30px;
    background:var(--midnight-2);
  }
  .tcard .quote{font-family:'Fraunces',serif;font-style:italic;font-size:18px;line-height:1.6;color:var(--text-light);}
  .tcard .who{display:flex;align-items:center;gap:12px;margin-top:24px;}
  .avatar{
    width:38px;height:38px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk';font-size:13px;font-weight:600;color:var(--midnight);
  }
  .who-name{font-size:13.5px;font-weight:500;}
  .who-role{font-size:12px;color:var(--text-muted);}

  /* ---------- CTA ---------- */
  .cta-section{
    margin:0 6vw 100px;border-radius:28px;overflow:hidden;position:relative;
    padding:80px 6vw;text-align:center;
    background:linear-gradient(120deg,var(--violet),var(--coral) 55%,var(--amber));
  }
  .cta-section h2{font-size:clamp(30px,4.4vw,48px);font-weight:600;color:#fff;max-width:640px;margin:0 auto;}
  .cta-section p{color:rgba(255,255,255,0.85);margin-top:16px;font-size:16px;}
  .cta-btn{
    display:inline-block;margin-top:34px;background:var(--midnight);color:#fff;
    padding:16px 34px;border-radius:999px;font-weight:500;font-size:15px;
    transition:transform .15s ease;
  }

  footer{padding:36px 6vw;border-top:1px solid var(--border-soft);
    display:flex;justify-content:space-between;color:var(--text-muted);font-size:13px;flex-wrap:wrap;gap:12px;
    position:relative;z-index:1;}

  @media (max-width:760px){
    .approach-steps{grid-template-columns:1fr 1fr;gap:24px;}
    .approach-steps::before{display:none;}
    .hero-stats{gap:28px;}
  }

      `}</style>



<svg id="topo-bg" preserveAspectRatio="none" viewBox="0 0 1200 2400" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#f5f6fb" strokeWidth="1">
    <path d="M-50,120 C 200,60 400,180 650,110 S 1100,50 1250,140"/>
    <path d="M-50,260 C 250,190 420,320 700,250 S 1050,190 1250,290"/>
    <path d="M-50,520 C 220,440 480,600 720,500 S 1080,440 1250,540"/>
    <path d="M-50,780 C 260,700 460,860 730,760 S 1090,690 1250,800"/>
    <path d="M-50,1040 C 240,960 470,1120 740,1010 S 1100,950 1250,1060"/>
    <path d="M-50,1300 C 230,1220 490,1380 760,1270 S 1110,1210 1250,1320"/>
    <path d="M-50,1560 C 250,1480 480,1640 750,1540 S 1090,1470 1250,1580"/>
    <path d="M-50,1820 C 240,1740 470,1900 740,1800 S 1100,1740 1250,1850"/>
    <path d="M-50,2080 C 230,2000 490,2160 760,2060 S 1110,2000 1250,2100"/>
    <path d="M-50,2320 C 250,2240 480,2400 750,2300 S 1090,2240 1250,2350"/>
  </g>
</svg>

<nav>
  <div className="brand">rhulani<span>.</span>dev</div>
  <div className="navlinks">
    <a href="#about">About</a>
    <a href="#work">Work</a>
    <a href="#approach">Approach</a>
    <a href="#notes">Notes</a>
  </div>
  <a href="#contact" className="navcta">Get in touch</a>
</nav>

<div className="hero">
  <div className="aurora-field">
    <div className="blob blob-1"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
  </div>
  <div className="noise-line"></div>
  <canvas id="globe-canvas" aria-hidden="true"></canvas>

  <div style={{position:'relative', zIndex:2}}>
    <div className="eyebrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
      <span>Honours CS · University of Pretoria</span>
    </div>
    <h1>Every project is another <em>stamp in the passport.</em></h1>
    <p>I'm Rhulani — I build at the intersection of software engineering, cybersecurity, and machine learning. Here's where that curiosity has taken me so far, and there's plenty of runway left.</p>
    <div className="hero-ctas">
      <a href="#work" className="btn-primary">See the destinations</a>
      <a href="#about" className="btn-ghost">More about me →</a>
    </div>
    <div className="hero-stats">
      <div className="stat-block">
        <div className="stat-num"><span className="count-up" data-target="6">0</span>+</div>
        <div className="stat-label">Projects shipped</div>
      </div>
      <div className="stat-block">
        <div className="stat-num"><span className="count-up" data-target="3">0</span></div>
        <div className="stat-label">Domains explored</div>
      </div>
      <div className="stat-block">
        <div className="stat-num"><span className="count-up" data-target="1">0</span></div>
        <div className="stat-label">Research in flight</div>
      </div>
    </div>
  </div>

  <div className="scroll-cue">
    <span>Scroll to explore</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
  </div>
</div>


<section id="about">
  <div className="section-head reveal">
    <div className="section-eyebrow">About me</div>
    <h2>The person behind the code</h2>
  </div>

  <div className="about-grid">
    <div className="profile-frame reveal">
      <img id="profile-img" src="/profile.jpg" alt="Rhulani Matiane" />
      <div className="profile-fallback" id="profile-fallback">RM</div>
      <span className="profile-stamp">Pretoria, ZA</span>
    </div>

    <div className="about-bio reveal">
      <p><b>I'm an Honours computer science student at the University of Pretoria</b>, currently working across cybersecurity, software engineering, and natural language processing — usually all in the same semester.</p>
      <p>My research, supervised by <b>Prof. Nils Timm</b>, integrates bounded model checkers like CBMC and ESBMC with LLM technology to generate pedagogical feedback on student C++ code — teaching formal verification tools to explain themselves in plain language.</p>
      <p>I came up through Java, and I'm equally comfortable in Python, C++, and LaTeX. I like problems with a right answer I have to earn — a proof that holds, a model that generalises, a report that's honest about its own limitations.</p>
      <div className="skills-row">
        <span className="skill-pill">Formal verification</span>
        <span className="skill-pill">Machine learning</span>
        <span className="skill-pill">Cybersecurity</span>
        <span className="skill-pill">Java · Python · C++</span>
        <span className="skill-pill">NLP</span>
        <span className="skill-pill">Academic writing</span>
      </div>
    </div>
  </div>

  <div className="journey reveal">
    <div className="journey-line"></div>
    <div className="journey-item">
      <div className="journey-dot" style={{background:'var(--violet)'}}></div>
      <div className="journey-year">COS720</div>
      <h4>Cybersecurity</h4>
      <p>Built ThreatSense, an insider-threat detection system, and ran a full digital forensics investigation end to end — disk imaging, recovery, and a professional forensic report.</p>
    </div>
    <div className="journey-item">
      <div className="journey-dot" style={{background:'var(--teal)'}}></div>
      <div className="journey-year">COS760</div>
      <h4>Natural language processing</h4>
      <p>Contributed to a multilingual AI-text detector covering isiZulu and isiXhosa — languages most detection tools quietly ignore.</p>
    </div>
    <div className="journey-item">
      <div className="journey-dot" style={{background:'var(--coral)'}}></div>
      <div className="journey-year">COS730</div>
      <h4>Software engineering</h4>
      <p>Designed and rebuilt a peer-review platform twice — once as a baseline, once re-architected against real performance data, with an honest account of what optimisation actually bought us.</p>
    </div>
    <div className="journey-item">
      <div className="journey-dot" style={{background:'var(--amber)'}}></div>
      <div className="journey-year">COS700 — ongoing</div>
      <h4>Honours research</h4>
      <p>Currently building a system that fuses formal verification with LLM-generated feedback, supervised by Prof. Nils Timm. This is the frontier I'm working on right now.</p>
    </div>
  </div>
</section>

<section id="work">
  <div className="section-head reveal">
    <div className="section-eyebrow">Destinations</div>
    <h2>Places the work has taken me</h2>
    <p>Three stops worth the visit. Each one started as a real, unresolved problem.</p>
  </div>

  <div className="destinations tilt-area">
    <div className="dest-card violet reveal">
      <span className="dest-stamp">Cybersecurity</span>
      <h3>ThreatSense</h3>
      <div className="place">Insider threat detection system</div>
      <p className="desc">A hybrid detection engine that flags risky employee behaviour before it becomes a breach — built with an explainable risk score so investigators know exactly why an alert fired, not just that it did.</p>
      <div className="dest-metrics">
        <div className="dm"><div className="dm-num">2</div><div className="dm-label">ML models fused</div></div>
        <div className="dm"><div className="dm-num">4</div><div className="dm-label">Risk features</div></div>
      </div>
      <a href="#" className="dest-link">View the case file →</a>
    </div>

    <div className="dest-card teal reveal">
      <span className="dest-stamp">Machine learning</span>
      <h3>Multilingual text detection</h3>
      <div className="place">isiZulu · isiXhosa · English</div>
      <p className="desc">Detecting AI-generated text across South African languages that most models ignore — bringing the same scrutiny to isiZulu and isiXhosa content that English gets by default.</p>
      <div className="dest-metrics">
        <div className="dm"><div className="dm-num">3</div><div className="dm-label">Languages covered</div></div>
        <div className="dm"><div className="dm-num">19</div><div className="dm-label">Test cases</div></div>
      </div>
      <a href="#" className="dest-link">View the case file →</a>
    </div>

    <div className="dest-card coral reveal">
      <span className="dest-stamp">Software engineering</span>
      <h3>Peer-review platform</h3>
      <div className="place">Design, then redesign</div>
      <p className="desc">Built twice, on purpose — once as a baseline, once re-architected against real performance data. The honest result: some bottlenecks aren't where you'd guess, and the report says so.</p>
      <div className="dest-metrics">
        <div className="dm"><div className="dm-num">2</div><div className="dm-label">Full implementations</div></div>
        <div className="dm"><div className="dm-num">6</div><div className="dm-label">Design tasks documented</div></div>
      </div>
      <a href="#" className="dest-link">View the case file →</a>
    </div>
  </div>
</section>

<section id="approach">
  <div className="section-head reveal">
    <div className="section-eyebrow">How I work</div>
    <h2>The same route, every time</h2>
    <p>No mystery process — here's how a problem actually turns into something built.</p>
  </div>

  <div className="approach reveal">
    <div className="approach-steps">
      <div className="step active">
        <div className="step-dot">1</div>
        <h4>Understand the problem</h4>
        <p>Before writing a line of code, I make sure I actually understand what's broken and why.</p>
      </div>
      <div className="step">
        <div className="step-dot">2</div>
        <h4>Plan the approach</h4>
        <p>A clear scope and design before implementation — fewer surprises later.</p>
      </div>
      <div className="step">
        <div className="step-dot">3</div>
        <h4>Build & iterate</h4>
        <p>Working code early, then refined against real data and feedback.</p>
      </div>
      <div className="step">
        <div className="step-dot">4</div>
        <h4>Document & reflect</h4>
        <p>Every project ends with an honest account of what worked, and what didn't.</p>
      </div>
    </div>
    <div className="approach-footer">"The report should be as honest as the code."</div>
  </div>
</section>

<section id="notes">
  <div className="section-head reveal">
    <div className="section-eyebrow">Notes from the road</div>
    <h2>What people say after working together</h2>
  </div>

  <div className="testimonials tilt-area">
    <div className="tcard reveal">
      <p className="quote">"Explained every technical decision in terms I actually understood — I never felt out of the loop."</p>
      <div className="who">
        <div className="avatar" style={{background:'var(--violet)'}}>PT</div>
        <div>
          <div className="who-name">Project supervisor</div>
          <div className="who-role">Academic research collaboration</div>
        </div>
      </div>
    </div>
    <div className="tcard reveal">
      <p className="quote">"Delivered exactly what was scoped, on time, with documentation that actually made sense."</p>
      <div className="who">
        <div className="avatar" style={{background:'var(--teal)'}}>TM</div>
        <div>
          <div className="who-name">Team collaborator</div>
          <div className="who-role">Group software project</div>
        </div>
      </div>
    </div>
    <div className="tcard reveal">
      <p className="quote">"Honest about trade-offs instead of overselling — told us plainly when something wasn't worth optimising."</p>
      <div className="who">
        <div className="avatar" style={{background:'var(--coral)'}}>CR</div>
        <div>
          <div className="who-name">Course reviewer</div>
          <div className="who-role">Engineering evaluation</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div id="contact" className="cta-section reveal">
  <h2>Curious where this goes next?</h2>
  <p>Always glad to talk about security, machine learning, or whatever problem you're stuck on.</p>
  <a href="mailto:you@example.com" className="cta-btn">Get in touch →</a>
</div>

<footer>
  <div>© 2026 Rhulani Matiane</div>
  <div>Pretoria, South Africa</div>
</footer>



      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
        onLoad={initGlobe}
      />
    </>
  );
}
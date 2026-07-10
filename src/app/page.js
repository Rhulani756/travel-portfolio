'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Scroll reveal ----------
    const revealEls = document.querySelectorAll('.reveal');
    let io;
    if ('IntersectionObserver' in window && !reduceMotion) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // ---------- 3D pointer tilt for cards ----------
    const cards = document.querySelectorAll('.dest-card, .tcard');
    function handleMove(e) {
      const card = e.currentTarget;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${y * -8}deg) rotateY(${x * 10}deg)`;
    }
    function handleLeave(e) {
      e.currentTarget.style.transform = '';
    }
    if (!reduceMotion) {
      cards.forEach((card) => {
        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
      });
    }

    return () => {
      if (io) revealEls.forEach((el) => io.unobserve(el));
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      });
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
        camera.position.z = 6.2;
    
        var group = new THREE.Group();
        scene.add(group);
    
        var sphereGeo = new THREE.IcosahedronGeometry(2.1, 2);
        var wireMat = new THREE.MeshBasicMaterial({color:0x8b5cf6, wireframe:true, transparent:true, opacity:0.35});
        var wireSphere = new THREE.Mesh(sphereGeo, wireMat);
        group.add(wireSphere);
    
        var innerGeo = new THREE.IcosahedronGeometry(2.06, 1);
        var innerMat = new THREE.MeshBasicMaterial({color:0x22d3b6, wireframe:true, transparent:true, opacity:0.18});
        group.add(new THREE.Mesh(innerGeo, innerMat));
    
        // destination markers (3 projects) as glowing points + connecting arcs
        var markerColors = [0x8b5cf6, 0x22d3b6, 0xf5567d];
        var markerPositions = [];
        for(var i = 0; i < 3; i++){
          var phi = Math.acos(1 - 2 * ((i + 0.5) / 3));
          var theta = Math.PI * (1 + Math.sqrt(5)) * i + 1.2;
          var r = 2.15;
          var pos = new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
          );
          markerPositions.push(pos);
          var dotGeo = new THREE.SphereGeometry(0.065, 12, 12);
          var dotMat = new THREE.MeshBasicMaterial({color: markerColors[i]});
          var dot = new THREE.Mesh(dotGeo, dotMat);
          dot.position.copy(pos);
          group.add(dot);
    
          var glowGeo = new THREE.SphereGeometry(0.14, 12, 12);
          var glowMat = new THREE.MeshBasicMaterial({color: markerColors[i], transparent:true, opacity:0.25});
          var glow = new THREE.Mesh(glowGeo, glowMat);
          glow.position.copy(pos);
          group.add(glow);
        }
    
        // arcs connecting the three markers
        for(var j = 0; j < 3; j++){
          var a = markerPositions[j];
          var b = markerPositions[(j + 1) % 3];
          var mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(2.7);
          var curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          var points = curve.getPoints(24);
          var lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          var lineMat = new THREE.LineBasicMaterial({color:0xf5f6fb, transparent:true, opacity:0.3});
          group.add(new THREE.Line(lineGeo, lineMat));
        }
    
        var targetRotX = 0, targetRotY = 0;
        window.addEventListener('mousemove', function(e){
          targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.6;
          targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.3;
        });
    
        function animate(){
          requestAnimationFrame(animate);
          group.rotation.y += 0.0022;
          group.rotation.x += (targetRotX - group.rotation.x) * 0.03;
          group.rotation.y += (targetRotY - group.rotation.y) * 0.02;
          renderer.render(scene, camera);
        }
        animate();
        requestAnimationFrame(function(){ canvas.classList.add('is-ready'); });
    
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
  }
  h1,h2,h3,.display{font-family:'Space Grotesk',sans-serif;}
  .voice{font-family:'Fraunces',serif;font-style:italic;}
  a{color:inherit;text-decoration:none;}

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
    position:absolute;top:50%;right:-4vw;transform:translateY(-50%);
    width:min(46vw,560px);height:min(46vw,560px);
    pointer-events:none;opacity:0;
    transition:opacity 1.2s ease;
  }
  #globe-canvas.is-ready{opacity:1;}
  @media (max-width:900px){#globe-canvas{display:none;}}

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
  }
  .eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    font-size:12.5px;letter-spacing:0.08em;text-transform:uppercase;
    color:var(--teal);margin-bottom:22px;
  }
  .eyebrow::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 10px var(--teal);}
  .hero h1{
    font-size:clamp(38px,6.4vw,78px);
    line-height:1.05;font-weight:600;
    max-width:920px;
    letter-spacing:-0.01em;
  }
  .hero h1 em{
    font-family:'Fraunces',serif;font-style:italic;font-weight:500;
    background:linear-gradient(90deg,var(--violet),var(--teal) 60%,var(--coral));
    -webkit-background-clip:text;background-clip:text;color:transparent;
  }
  .hero p{
    max-width:560px;margin-top:26px;font-size:17px;line-height:1.7;
    color:var(--text-muted);
  }
  .hero-ctas{display:flex;gap:16px;margin-top:40px;flex-wrap:wrap;}
  .btn-primary{
    background:linear-gradient(90deg,var(--violet),var(--coral));
    color:#fff;padding:14px 28px;border-radius:999px;
    font-weight:500;font-size:14.5px;
    box-shadow:0 8px 30px -8px rgba(139,92,246,0.55);
    transition:transform .2s ease;
  }
  .btn-primary:hover{transform:translateY(-2px);}
  .btn-ghost{
    padding:14px 26px;border-radius:999px;font-size:14.5px;
    border:1px solid var(--border-soft);color:var(--text-light);
    transition:all .2s ease;
  }
  .btn-ghost:hover{border-color:var(--text-light);}

  .hero-stats{
    display:flex;gap:48px;margin-top:64px;flex-wrap:wrap;
    border-top:1px solid var(--border-soft);padding-top:28px;max-width:640px;
  }
  .stat-num{font-family:'Space Grotesk';font-size:26px;font-weight:600;}
  .stat-label{font-size:12.5px;color:var(--text-muted);margin-top:4px;}

  /* ---------- Section shell ---------- */
  section{position:relative;padding:100px 6vw;}
  .section-head{max-width:640px;margin-bottom:56px;}
  .section-eyebrow{
    font-size:12.5px;letter-spacing:0.08em;text-transform:uppercase;
    color:var(--text-muted);margin-bottom:14px;
  }
  .section-head h2{font-size:clamp(28px,3.6vw,42px);font-weight:600;line-height:1.15;}
  .section-head p{margin-top:16px;color:var(--text-muted);font-size:15.5px;line-height:1.7;}

  /* ---------- Destination showcase (projects) ---------- */
  .route-line{
    position:relative;height:2px;margin:0 6vw 0;
    background:repeating-linear-gradient(90deg,var(--border-soft) 0 10px, transparent 10px 20px);
  }
  .destinations{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
    gap:28px;
  }
  .dest-card{
    position:relative;border-radius:20px;padding:32px 28px;
    border:1px solid var(--border-soft);
    background:var(--midnight-2);
    overflow:hidden;
    transition:transform .25s ease, border-color .25s ease;
  }
  .dest-card:hover{transform:translateY(-6px);}
  .dest-card::before{
    content:'';position:absolute;top:-60%;right:-40%;width:220px;height:220px;
    border-radius:50%;filter:blur(60px);opacity:0.5;
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
  }
  .dest-card.violet .dest-stamp{color:#c4b5fd;border-color:rgba(139,92,246,0.4);background:rgba(139,92,246,0.12);}
  .dest-card.teal .dest-stamp{color:#7ee8d3;border-color:rgba(34,211,182,0.4);background:rgba(34,211,182,0.12);}
  .dest-card.coral .dest-stamp{color:#f9a8bd;border-color:rgba(245,86,125,0.4);background:rgba(245,86,125,0.12);}

  .dest-card h3{font-size:21px;font-weight:600;margin-bottom:10px;}
  .dest-card .place{font-size:13px;color:var(--text-muted);margin-bottom:16px;}
  .dest-card p.desc{font-size:14.5px;line-height:1.7;color:var(--text-muted);margin-bottom:22px;}
  .dest-metrics{display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap;}
  .dm{font-family:'Space Grotesk';}
  .dm-num{font-size:19px;font-weight:600;}
  .dm-label{font-size:11px;color:var(--text-muted);}
  .dest-link{font-size:13.5px;font-weight:500;display:inline-flex;align-items:center;gap:6px;}
  .dest-card.violet .dest-link{color:#c4b5fd;}
  .dest-card.teal .dest-link{color:#7ee8d3;}
  .dest-card.coral .dest-link{color:#f9a8bd;}

  /* ---------- Booking preview (engagement flow) ---------- */
  .booking{
    border-radius:24px;border:1px solid var(--border-soft);
    background:linear-gradient(160deg,rgba(139,92,246,0.09),rgba(34,211,182,0.06));
    padding:44px;
  }
  .booking-steps{
    display:grid;grid-template-columns:repeat(4,1fr);gap:0;
    margin-top:36px;position:relative;
  }
  .booking-steps::before{
    content:'';position:absolute;top:19px;left:6%;right:6%;height:1px;
    background-image:repeating-linear-gradient(90deg,rgba(34,211,182,0.55) 0 8px, transparent 8px 16px);
    background-size:16px 1px;
    z-index:0;
    transform:scaleX(0);transform-origin:left center;
    transition:transform 1.1s cubic-bezier(.16,1,.3,1);
    animation:dash-move 1.4s linear infinite;
  }
  .booking.is-visible .booking-steps::before{transform:scaleX(1);}
  @keyframes dash-move{to{background-position:16px 0;}}
  @media (prefers-reduced-motion: reduce){
    .booking-steps::before{animation:none;transform:scaleX(1);}
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

  .booking-footer{
    display:flex;justify-content:space-between;align-items:center;
    margin-top:40px;padding-top:28px;border-top:1px solid var(--border-soft);
    flex-wrap:wrap;gap:20px;
  }
  .booking-price{font-family:'Space Grotesk';font-size:15px;color:var(--text-muted);}
  .booking-price b{color:var(--text-light);font-size:20px;}

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
    transition:transform .2s ease;
  }
  .cta-btn:hover{transform:translateY(-2px) scale(1.02);}

  footer{padding:36px 6vw;border-top:1px solid var(--border-soft);
    display:flex;justify-content:space-between;color:var(--text-muted);font-size:13px;flex-wrap:wrap;gap:12px;}

  @media (max-width:760px){
    .booking-steps{grid-template-columns:1fr 1fr;gap:24px;}
    .booking-steps::before{display:none;}
    .hero-stats{gap:28px;}
  }

      `}</style>



<nav>
  <div className="brand">rhulani<span>.</span>dev</div>
  <div className="navlinks">
    <a href="#work">Work</a>
    <a href="#process">Process</a>
    <a href="#notes">Notes</a>
  </div>
  <a href="#contact" className="navcta">Start a project</a>
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
    <div className="eyebrow">Currently open for freelance work</div>
    <h1>Every project is a <em>place I've been.</em><br />Here's the map.</h1>
    <p>I'm Rhulani — I build things at the intersection of software engineering, security, and machine learning. This is a guided tour of where that's taken me, and where it could take your project next.</p>
    <div className="hero-ctas">
      <a href="#work" className="btn-primary">See the destinations</a>
      <a href="#contact" className="btn-ghost">Plan a project →</a>
    </div>
    <div className="hero-stats">
      <div>
        <div className="stat-num">6+</div>
        <div className="stat-label">Shipped projects</div>
      </div>
      <div>
        <div className="stat-num">3</div>
        <div className="stat-label">Domains — security, ML, systems</div>
      </div>
      <div>
        <div className="stat-num">100%</div>
        <div className="stat-label">Built, tested, documented</div>
      </div>
    </div>
  </div>
</div>

<section id="work">
  <div className="section-head reveal">
    <div className="section-eyebrow">Destinations</div>
    <h2>Places the work has taken me</h2>
    <p>Three stops worth the visit. Each one started as someone's real problem.</p>
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

<section id="process">
  <div className="section-head reveal">
    <div className="section-eyebrow">Plan a project</div>
    <h2>How a booking becomes a build</h2>
    <p>No mystery itinerary — here's exactly how working together goes, start to finish.</p>
  </div>

  <div className="booking reveal">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
      <div>
        <div style={{fontSize:'13px', color:'var(--text-muted)'}}>Trip type</div>
        <div style={{fontFamily:"'Space Grotesk'", fontSize:'19px', fontWeight:600, marginTop:'4px'}}>Custom software build</div>
      </div>
      <div>
        <div style={{fontSize:'13px', color:'var(--text-muted)'}}>Typical duration</div>
        <div style={{fontFamily:"'Space Grotesk'", fontSize:'19px', fontWeight:600, marginTop:'4px'}}>2 – 6 weeks</div>
      </div>
    </div>

    <div className="booking-steps">
      <div className="step active">
        <div className="step-dot">1</div>
        <h4>Discovery call</h4>
        <p>We talk through the problem in plain language — no jargon required on your end.</p>
      </div>
      <div className="step">
        <div className="step-dot">2</div>
        <h4>Plan & quote</h4>
        <p>You get a clear scope, timeline, and price before anything is built.</p>
      </div>
      <div className="step">
        <div className="step-dot">3</div>
        <h4>Build in the open</h4>
        <p>Regular check-ins so there are no surprises when you see the work.</p>
      </div>
      <div className="step">
        <div className="step-dot">4</div>
        <h4>Ship & support</h4>
        <p>Delivered, documented, and handed off with support after launch.</p>
      </div>
    </div>

    <div className="booking-footer">
      <div className="booking-price">Starting from <b>Let's talk</b> — scoped to your project</div>
      <a href="#contact" className="btn-primary">Request availability</a>
    </div>
  </div>
</section>

<section id="notes">
  <div className="section-head reveal">
    <div className="section-eyebrow">Traveler notes</div>
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
  <h2>Where should the next project take us?</h2>
  <p>Tell me what you're building. I'll reply with a clear plan, not a sales pitch.</p>
  <a href="mailto:you@example.com" className="cta-btn">Start your journey →</a>
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
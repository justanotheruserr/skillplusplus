<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/app-config.php';

$asset = static fn (string $path): string => htmlspecialchars(APP_BASE . '/' . ltrim($path, '/'), ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#05070a">
  <meta name="description" content="Skill++ is cooking. Coming soon.">
  <title>Skill++ — Coming Soon</title>
  <link rel="stylesheet" href="<?= $asset('assets/css/landing.css?v=1.0.0') ?>">
</head>
<body>
<a class="skip-link" href="#main">Skip to experience</a>

<header class="site-header" aria-label="Primary navigation">
  <a class="wordmark" href="#top" aria-label="Skill++ home">
    <span class="wordmark-glyph" aria-hidden="true"><i></i><i></i></span>
    <span>Skill<span class="wordmark-plus">++</span></span>
  </a>
  <div class="header-status" aria-live="polite">
    <span class="status-pulse" aria-hidden="true"></span>
    <span id="header-status-text">System dormant</span>
  </div>
</header>

<div class="scroll-rail" aria-hidden="true">
  <span class="rail-label">POWER</span>
  <div class="rail-track"><i id="rail-progress"></i></div>
  <span class="rail-value" id="rail-value">00</span>
</div>

<div class="signal-cursor" id="signal-cursor" aria-hidden="true">
  <span class="cursor-crosshair"></span>
  <span class="cursor-orbit"></span>
  <i></i>
</div>

<main id="main">
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="hero-ambient" aria-hidden="true"></div>
    <div class="hero-diagnostics" aria-hidden="true">
      <span class="diagnostic-code diagnostic-code-a">CORE / 0X31 · 84.02%</span>
      <span class="diagnostic-code diagnostic-code-b">NEURAL HEAT / NOMINAL</span>
      <span class="diagnostic-code diagnostic-code-c">LAT 00.000 · LNG 00.000</span>
      <i class="diagnostic-trace trace-a"><b></b></i>
      <i class="diagnostic-trace trace-b"><b></b></i>
      <i class="diagnostic-trace trace-c"><b></b></i>
    </div>
    <div class="hero-reactor" aria-hidden="true">
      <span class="reactor-ring reactor-ring-1"></span>
      <span class="reactor-ring reactor-ring-2"></span>
      <span class="reactor-ring reactor-ring-3"></span>
      <span class="reactor-axis reactor-axis-x"></span>
      <span class="reactor-axis reactor-axis-y"></span>
      <span class="reactor-core"><i></i></span>
      <b class="reactor-particle particle-1"></b>
      <b class="reactor-particle particle-2"></b>
      <b class="reactor-particle particle-3"></b>
    </div>
    <div class="hero-copy">
      <p class="eyebrow"><span></span> Preheating</p>
      <h1 id="hero-title">Something is<br><em>cooking.</em></h1>
      <p class="hero-note">Move. Scroll. Turn up the signal.</p>
    </div>
    <div class="hero-readout" aria-hidden="true">
      <span>SB / 001</span>
      <span>HEAT SIGNATURE RISING</span>
    </div>
    <a class="scroll-cue" href="#activation" aria-label="Begin activation sequence">
      <span>Turn up the signal</span>
      <i aria-hidden="true"></i>
    </a>
  </section>

  <section class="activation" id="activation" aria-label="Brain activation sequence">
    <div class="activation-sticky">
      <div class="matrix-field" aria-hidden="true">
        <span>0110 1001 0011</span><span>SYS.48 / ONLINE</span>
        <span>101101.001</span><span>MEM / 0X77AF</span>
        <span>0100 1110 0101</span><span>SYNC 88.024</span>
        <span>01110110</span><span>NODE // 031</span>
      </div>
      <canvas id="neural-canvas" aria-hidden="true"></canvas>
      <div class="neural-aura" aria-hidden="true"></div>
      <div class="neural-reticle" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="knowledge-upload" aria-hidden="true">
        <div class="upload-caption">
          <span><i></i> Knowledge transfer</span>
          <b id="upload-value">00%</b>
        </div>
        <div class="upload-column"><i></i><i></i><i></i><i></i></div>
        <div class="upload-lock"><span></span><i></i></div>
        <span class="data-packet" style="--sx:-34vw;--sy:-31vh;--delay:-.2s">01</span>
        <span class="data-packet" style="--sx:-27vw;--sy:27vh;--delay:-1.1s">∑</span>
        <span class="data-packet" style="--sx:31vw;--sy:-28vh;--delay:-1.8s">λ</span>
        <span class="data-packet" style="--sx:37vw;--sy:18vh;--delay:-2.5s">A+</span>
        <span class="data-packet" style="--sx:-39vw;--sy:5vh;--delay:-3.2s">{ }</span>
        <span class="data-packet" style="--sx:24vw;--sy:34vh;--delay:-3.9s">π</span>
        <span class="data-packet" style="--sx:-18vw;--sy:-37vh;--delay:-4.6s">x²</span>
        <span class="data-packet" style="--sx:41vw;--sy:-3vh;--delay:-5.3s">Δ</span>
        <span class="data-packet" style="--sx:-32vw;--sy:37vh;--delay:-6s">[]</span>
        <span class="data-packet" style="--sx:14vw;--sy:-39vh;--delay:-6.7s">10</span>
      </div>
      <div class="scan-line" aria-hidden="true"></div>

      <div class="sequence-meta" aria-hidden="true">
        <span>NEURAL BOOT SEQUENCE</span>
        <span id="sequence-step">01 / 05</span>
      </div>

      <div class="phase-stack">
        <article class="phase-copy is-active" data-phase="0">
          <p>01 — Signal</p>
          <h2>A thought<br>begins.</h2>
          <span>First impulse detected</span>
        </article>
        <article class="phase-copy" data-phase="1" aria-hidden="true">
          <p>02 — Focus</p>
          <h2>Noise falls<br>away.</h2>
          <span>Attention narrowing</span>
        </article>
        <article class="phase-copy" data-phase="2" aria-hidden="true">
          <p>03 — Upload</p>
          <h2>Knowledge<br>streams in.</h2>
          <span>Neural transfer in progress</span>
        </article>
        <article class="phase-copy" data-phase="3" aria-hidden="true">
          <p>04 — Depth</p>
          <h2>Concentration<br>rising.</h2>
          <span>Distraction approaching zero</span>
        </article>
        <article class="phase-copy" data-phase="4" aria-hidden="true">
          <p>05 — Ready</p>
          <h2>Almost<br>awake.</h2>
          <span>Threshold within reach</span>
        </article>
      </div>

      <div class="metrics" aria-label="Activation metrics">
        <div class="metric">
          <span>Energy</span>
          <strong><b id="energy-value">00</b><small>%</small></strong>
          <i><em id="energy-bar"></em></i>
        </div>
        <div class="metric">
          <span>Focus</span>
          <strong><b id="focus-value">00</b><small>%</small></strong>
          <i><em id="focus-bar"></em></i>
        </div>
        <div class="metric">
          <span>Coherence</span>
          <strong><b id="coherence-value">00</b><small>%</small></strong>
          <i><em id="coherence-bar"></em></i>
        </div>
      </div>

      <div class="sequence-progress" aria-hidden="true">
        <span><i id="sequence-progress-fill"></i></span>
        <b id="sequence-progress-label">0.00</b>
      </div>
    </div>
  </section>

  <section class="reveal" id="coming-soon" aria-labelledby="reveal-title">
    <div class="reveal-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="reveal-copy">
      <p class="eyebrow"><span></span> Signal acquired</p>
      <h2 id="reveal-title"><span>Skill<span>++</span></span><br>Coming soon.</h2>
      <p>That's all you get—for now.</p>
    </div>
    <div class="reveal-footer">
      <span>© <?= date('Y') ?> Skill++</span>
      <span>Think deeper.</span>
    </div>
  </section>
</main>

<noscript>
  <div class="noscript-note">Skill++ is cooking. Enable JavaScript to experience the signal.</div>
</noscript>
<script src="<?= $asset('assets/js/landing.js?v=1.0.0') ?>" defer></script>
</body>
</html>

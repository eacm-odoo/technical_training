/** @odoo-module ignore */
(function () {
    let overlay = null;
    let animFrame = null;
    let pongStarted = false;

    /* ── Splash screen (offline landing) ────────────────────────────── */
    function buildOverlay() {
        overlay = document.createElement('div');
        overlay.id = 'sf-pong-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '99999',
            background: '#fff', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Roboto', 'Noto Sans', sans-serif",
            color: '#212529',
        });

        overlay.innerHTML = `
            <style>
                #sf-pong-splash { text-align: center; max-width: 420px; padding: 2rem; }
                #sf-pong-splash svg { width: 72px; height: 72px; margin-bottom: 1.5rem; opacity: .15; }
                #sf-pong-splash h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 .5rem; color: #212529; }
                #sf-pong-splash p  { font-size: .95rem; color: #6c757d; margin: 0 0 2rem; line-height: 1.6; }
                #sf-pong-play-btn {
                    display: inline-flex; align-items: center; gap: .5rem;
                    background: #714b67; color: #fff; border: none; border-radius: 6px;
                    padding: .6rem 1.4rem; font-size: .95rem; font-weight: 600;
                    cursor: pointer; transition: background .15s;
                }
                #sf-pong-play-btn:hover { background: #5a3a52; }
                #sf-pong-canvas-wrap {
                    display: none; position: fixed; inset: 0; background: #0a0a0a;
                }
                #sf-pong-back-btn {
                    position: fixed; top: 1rem; left: 1rem; z-index: 1;
                    background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.2);
                    border-radius: 6px; padding: .35rem .8rem; font-size: .8rem;
                    cursor: pointer; font-family: monospace; transition: background .15s;
                }
                #sf-pong-back-btn:hover { background: rgba(255,255,255,.22); }
                #sf-pong-hud {
                    position: fixed; inset: 0; display: flex;
                    flex-direction: column; align-items: center; justify-content: center;
                    pointer-events: none; color: #fff; font-family: monospace;
                }
                #sf-pong-score { font-size: clamp(1.5rem,4vw,2.5rem); letter-spacing: 2rem; margin-bottom: .5rem; opacity: .9; }
                #sf-pong-msg   { font-size: clamp(.75rem,2vw,1rem); opacity: .5; letter-spacing: .15em; }
            </style>

            <div id="sf-pong-splash">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z"/>
                </svg>
                <h1>Check your connection</h1>
                <p>Odoo can't connect to the server right now.<br>Check your network and try again.</p>
                <button id="sf-pong-play-btn">
                    <span>🏓</span> Play Pong while you wait
                </button>
            </div>

            <div id="sf-pong-canvas-wrap">
                <canvas id="sf-pong-canvas" style="display:block;width:100%;height:100%;"></canvas>
                <button id="sf-pong-back-btn">← Back</button>
                <div id="sf-pong-hud">
                    <div id="sf-pong-score">0  0</div>
                    <div id="sf-pong-msg">PRESS SPACE OR TAP TO START</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('#sf-pong-play-btn').addEventListener('click', showGame);
        overlay.querySelector('#sf-pong-back-btn').addEventListener('click', showSplash);
    }

    function showGame() {
        overlay.querySelector('#sf-pong-splash').style.display = 'none';
        overlay.style.background = '#0a0a0a';
        const wrap = overlay.querySelector('#sf-pong-canvas-wrap');
        wrap.style.display = 'block';

        if (!pongStarted) {
            pongStarted = true;
            startPong(
                overlay.querySelector('#sf-pong-canvas'),
                overlay.querySelector('#sf-pong-score'),
                overlay.querySelector('#sf-pong-msg'),
            );
        }
    }

    function showSplash() {
        overlay.style.background = '#fff';
        overlay.querySelector('#sf-pong-splash').style.display = 'block';
        overlay.querySelector('#sf-pong-canvas-wrap').style.display = 'none';
    }

    function removeOverlay() {
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
        if (overlay) { overlay.remove(); overlay = null; }
        pongStarted = false;
    }

    /* ── Pong game ───────────────────────────────────────────────────── */
    function startPong(canvas, scoreEl, msgEl) {
        const ctx = canvas.getContext('2d');

        // All physics constants cached here — recomputed only on resize, never in the loop
        let W, H, PAD_W, PAD_H, BALL_R, SPEED0, MAX_AI, BALL_MAX, PAD_SPD;

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            PAD_W   = Math.max(8,  W * .012);
            PAD_H   = Math.max(60, H * .14);
            BALL_R  = Math.max(5,  W * .008);
            SPEED0  = W * .008;
            MAX_AI  = H * .011;
            BALL_MAX = W * .022;
            PAD_SPD = H * .016;
        }
        window.addEventListener('resize', resize);
        resize();

        let state = 'idle';
        let pScore = 0, aiScore = 0;
        let ball = {}, padP = {}, padAI = {};

        function reset(serve) {
            ball = {
                x: W / 2, y: H / 2,
                vx: SPEED0 * (serve === 'player' ? -1 : 1),
                vy: SPEED0 * (Math.random() > .5 ? 1 : -1),
            };
            padP  = { x: PAD_W, y: H / 2 - PAD_H / 2, w: PAD_W, h: PAD_H };
            padAI = { x: W - PAD_W * 2, y: H / 2 - PAD_H / 2, w: PAD_W, h: PAD_H };
        }

        const keys = {};
        function onKey(e) {
            if (!overlay) return;
            keys[e.code] = true;
            if (e.code === 'Space') {
                if (state === 'idle' || state === 'scored') { state = 'playing'; reset('player'); msgEl.textContent = ''; }
                e.preventDefault();
            }
        }
        document.addEventListener('keydown', onKey);
        document.addEventListener('keyup', e => { keys[e.code] = false; });

        let touchY = null;
        document.addEventListener('touchstart', e => {
            if (!overlay || overlay.querySelector('#sf-pong-canvas-wrap').style.display === 'none') return;
            if (state !== 'playing') { state = 'playing'; reset('player'); msgEl.textContent = ''; }
            touchY = e.touches[0].clientY;
        }, { passive: true });
        document.addEventListener('touchmove', e => {
            if (!overlay || touchY === null) return;
            const dy = e.touches[0].clientY - touchY;
            touchY = e.touches[0].clientY;
            padP.y = Math.max(0, Math.min(canvas.height - padP.h, padP.y + dy));
        }, { passive: true });

        function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

        function speedUp(b) {
            const avx = Math.abs(b.vx) * 1.05;
            const avy = Math.abs(b.vy) * 1.05;
            b.vx = (avx > BALL_MAX ? BALL_MAX : avx < SPEED0 ? SPEED0 : avx) * (b.vx < 0 ? -1 : 1);
            b.vy = (avy > BALL_MAX ? BALL_MAX : avy) * (b.vy < 0 ? -1 : 1);
        }

        function update() {
            if (state !== 'playing') return;

            if (keys['ArrowUp']   || keys['KeyW']) padP.y -= PAD_SPD;
            if (keys['ArrowDown'] || keys['KeyS']) padP.y += PAD_SPD;
            if (padP.y < 0) padP.y = 0;
            else if (padP.y > H - PAD_H) padP.y = H - PAD_H;

            const aiDiff = ball.y - (padAI.y + PAD_H / 2);
            padAI.y += aiDiff * .18 > MAX_AI ? MAX_AI : aiDiff * .18 < -MAX_AI ? -MAX_AI : aiDiff * .18;
            if (padAI.y < 0) padAI.y = 0;
            else if (padAI.y > H - PAD_H) padAI.y = H - PAD_H;

            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.y - BALL_R <= 0)  { ball.y = BALL_R;      ball.vy = -ball.vy; }
            else if (ball.y + BALL_R >= H) { ball.y = H - BALL_R; ball.vy = -ball.vy; }

            if (ball.vx < 0 && ball.x - BALL_R < padP.x + PAD_W && ball.x + BALL_R > padP.x &&
                ball.y + BALL_R > padP.y && ball.y - BALL_R < padP.y + PAD_H) {
                ball.x = padP.x + PAD_W + BALL_R;
                ball.vy = ((ball.y - (padP.y + PAD_H / 2)) / (PAD_H / 2)) * SPEED0 * 1.5;
                ball.vx = -ball.vx; speedUp(ball);
            } else if (ball.vx > 0 && ball.x + BALL_R > padAI.x && ball.x - BALL_R < padAI.x + PAD_W &&
                ball.y + BALL_R > padAI.y && ball.y - BALL_R < padAI.y + PAD_H) {
                ball.x = padAI.x - BALL_R;
                ball.vy = ((ball.y - (padAI.y + PAD_H / 2)) / (PAD_H / 2)) * SPEED0 * 1.5;
                ball.vx = -ball.vx; speedUp(ball);
            }

            if (ball.x + BALL_R < 0)  { aiScore++; scored('ai'); }
            else if (ball.x - BALL_R > W) { pScore++; scored('player'); }
        }

        function scored(who) {
            state = 'scored';
            scoreEl.textContent = pScore + '  ' + aiScore;
            msgEl.textContent = (who === 'player' ? '🎉 POINT!' : '😬 OOPS!') + '  — SPACE / TAP TO CONTINUE';
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            if (state === 'idle') { ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(0, 0, W, H); return; }
            ctx.setLineDash([8, 12]);
            ctx.strokeStyle = 'rgba(255,255,255,.15)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.roundRect(padP.x,  padP.y,  PAD_W, PAD_H, 4); ctx.fill();
            ctx.beginPath(); ctx.roundRect(padAI.x, padAI.y, PAD_W, PAD_H, 4); ctx.fill();
            ctx.font = 'bold ' + Math.max(11, PAD_W * 1.2) + 'px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,255,255,.45)';
            ctx.fillText('FP', padAI.x + PAD_W / 2, padAI.y - 8);
            ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
        }

        function loop() {
            if (!overlay) { window.removeEventListener('resize', resize); return; }
            update(); draw();
            animFrame = requestAnimationFrame(loop);
        }

        reset('player');
        loop();
    }

    /* ── Online / offline listeners ──────────────────────────────────── */
    window.addEventListener('offline', () => { if (!overlay) buildOverlay(); });
    window.addEventListener('online',  () => { removeOverlay(); location.reload(); });
    if (!navigator.onLine) buildOverlay();
})();

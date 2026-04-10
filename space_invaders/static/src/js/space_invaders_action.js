/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

class SpaceInvadersGame extends Component {
    static template = "space_invaders.GameTemplate";
    static props = ["*"];

    setup() {
        this.canvasRef = useRef("canvas");
        this.state = useState({
            score: 0,
            lives: 3,
            level: 1,
            gameState: "idle", // idle | playing | over
            overlayTitle: "SPACE INVADERS",
            overlayColor: "#4ade80",
            overlaySub1: "← → mover  |  ESPACIO disparar",
            overlaySub2: "Destruye todos los invasores antes de que lleguen",
            btnLabel: "INICIAR JUEGO",
        });

        this.animId = null;
        this.frameCount = 0;
        this.moveLeft = false;
        this.moveRight = false;
        this.keydownHandler = null;
        this.keyupHandler = null;

        onMounted(() => {
            this.canvas = this.canvasRef.el;
            this.ctx = this.canvas.getContext("2d");
            this._bindKeys();
        });

        onWillUnmount(() => {
            cancelAnimationFrame(this.animId);
            if (this.keydownHandler) document.removeEventListener("keydown", this.keydownHandler);
            if (this.keyupHandler) document.removeEventListener("keyup", this.keyupHandler);
        });
    }

    _bindKeys() {
        this.keydownHandler = (e) => {
            if (e.code === "ArrowLeft") this.moveLeft = true;
            if (e.code === "ArrowRight") this.moveRight = true;
            if (e.code === "Space") { e.preventDefault(); this._fireBullet(); }
        };
        this.keyupHandler = (e) => {
            if (e.code === "ArrowLeft") this.moveLeft = false;
            if (e.code === "ArrowRight") this.moveRight = false;
        };
        document.addEventListener("keydown", this.keydownHandler);
        document.addEventListener("keyup", this.keyupHandler);
    }

    _initGame() {
        const W = 480, H = 480;
        this.W = W; this.H = H;
        this.player = { x: W / 2 - 15, y: H - 50, w: 30, h: 18, speed: 4 };
        this.bullets = [];
        this.alienBullets = [];
        this.explosions = [];
        this.alienDir = 1;
        this.alienSpeed = 0.4 + this.state.level * 0.15;
        this.alienShootTimer = 0;
        this.frameCount = 0;

        const ALIEN_TYPES = [
            { color: "#f87171", points: 30 },
            { color: "#fb923c", points: 20 },
            { color: "#a78bfa", points: 10 },
        ];
        this.ALIEN_TYPES = ALIEN_TYPES;

        this.aliens = [];
        const rows = 3, cols = 10;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.aliens.push({
                    x: 30 + c * 42,
                    y: 40 + r * 36,
                    w: 28, h: 20,
                    type: r,
                    alive: true,
                    frame: 0,
                });
            }
        }

        this.shields = [];
        for (let i = 0; i < 4; i++) {
            const bx = 48 + i * 104;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 5; col++) {
                    if (!((row === 2 && col === 0) || (row === 2 && col === 4))) {
                        this.shields.push({ x: bx + col * 10, y: H - 90 + row * 10, w: 10, h: 10, hp: 3 });
                    }
                }
            }
        }
    }

    _fireBullet() {
        if (this.state.gameState !== "playing") return;
        if (this.bullets.length < 2) {
            this.bullets.push({ x: this.player.x + 14, y: this.player.y - 5 });
        }
    }

    _drawAlien(x, y, type, frame) {
        const ctx = this.ctx;
        const color = this.ALIEN_TYPES[type].color;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        if (type === 0) {
            ctx.fillRect(x+8,y,12,5); ctx.fillRect(x+4,y+5,20,5); ctx.fillRect(x,y+10,28,5);
            ctx.fillRect(x+4,y+15,4,5); ctx.fillRect(x+20,y+15,4,5);
            if (frame===0){ctx.fillRect(x,y+8,4,4);ctx.fillRect(x+24,y+8,4,4);}
            else{ctx.fillRect(x+2,y+12,4,4);ctx.fillRect(x+22,y+12,4,4);}
        } else if (type === 1) {
            ctx.fillRect(x+4,y,20,5); ctx.fillRect(x,y+5,28,5); ctx.fillRect(x+2,y+10,24,5);
            ctx.fillRect(x+2,y+15,8,5); ctx.fillRect(x+18,y+15,8,5);
            if (frame===0){ctx.fillRect(x,y+5,4,8);ctx.fillRect(x+24,y+5,4,8);}
            else{ctx.fillRect(x-2,y+8,4,6);ctx.fillRect(x+26,y+8,4,6);}
        } else {
            ctx.fillRect(x+10,y,8,4); ctx.fillRect(x+6,y+4,16,4); ctx.fillRect(x+2,y+8,24,4);
            ctx.fillRect(x,y+12,28,4); ctx.fillRect(x+4,y+16,6,4); ctx.fillRect(x+18,y+16,6,4);
            if (frame===0){ctx.fillRect(x+2,y+14,4,6);ctx.fillRect(x+22,y+14,4,6);}
            else{ctx.fillRect(x,y+12,4,6);ctx.fillRect(x+24,y+12,4,6);}
        }
        ctx.shadowBlur = 0;
    }

    _drawPlayer() {
        const ctx = this.ctx;
        const p = this.player;
        ctx.fillStyle = "#4ade80";
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x+12, p.y, 6, 6);
        ctx.fillRect(p.x+6, p.y+6, 18, 6);
        ctx.fillRect(p.x, p.y+12, 30, 6);
        ctx.shadowBlur = 0;
    }

    _draw() {
        const ctx = this.ctx;
        const W = this.W, H = this.H;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = "rgba(74,222,128,0.08)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
        for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

        // Stars
        for (let s = 0; s < 40; s++) {
            const sx = (s * 127 + 43) % W;
            const sy = (s * 89 + 17) % (H * 0.7);
            const br = this.frameCount * 0.02 + s;
            ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.25 * Math.abs(Math.sin(br))})`;
            ctx.fillRect(sx, sy, 1.5, 1.5);
        }

        // Shields
        this.shields.forEach(s => {
            ctx.fillStyle = `rgba(56,189,124,${s.hp / 3})`;
            ctx.fillRect(s.x, s.y, s.w, s.h);
        });

        // Aliens
        this.aliens.forEach(a => { if (a.alive) this._drawAlien(a.x, a.y, a.type, a.frame); });

        // Player
        this._drawPlayer();

        // Player bullets
        this.bullets.forEach(b => {
            ctx.fillStyle = "#4ade80"; ctx.shadowColor = "#4ade80"; ctx.shadowBlur = 8;
            ctx.fillRect(b.x, b.y, 3, 10); ctx.shadowBlur = 0;
        });

        // Alien bullets
        this.alienBullets.forEach(b => {
            ctx.fillStyle = "#f87171"; ctx.shadowColor = "#f87171"; ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, 3, 8); ctx.shadowBlur = 0;
        });

        // Explosions
        this.explosions = this.explosions.filter(e => e.life > 0);
        this.explosions.forEach(e => {
            ctx.globalAlpha = e.life / 20;
            ctx.fillStyle = e.color || "#fbbf24";
            for (let i = 0; i < 6; i++) {
                const a = (i/6)*Math.PI*2 + e.phase;
                const r = (20 - e.life) * 0.8;
                ctx.fillRect(e.x + Math.cos(a)*r - 2, e.y + Math.sin(a)*r - 2, 4, 4);
            }
            ctx.globalAlpha = 1;
            e.life--;
        });

        // Ground line
        ctx.strokeStyle = "rgba(74,222,128,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, H-30); ctx.lineTo(W, H-30); ctx.stroke();
    }

    _update() {
        const W = this.W, H = this.H;
        this.frameCount++;

        if (this.moveLeft && this.player.x > 0) this.player.x -= this.player.speed;
        if (this.moveRight && this.player.x + this.player.w < W) this.player.x += this.player.speed;

        this.bullets.forEach(b => b.y -= 8);
        this.bullets = this.bullets.filter(b => b.y > -10);
        this.alienBullets.forEach(b => b.y += 4);
        this.alienBullets = this.alienBullets.filter(b => b.y < H);

        let liveAliens = this.aliens.filter(a => a.alive);
        let edgeHit = false;
        liveAliens.forEach(a => {
            a.x += this.alienSpeed * this.alienDir;
            if (this.frameCount % 30 === 0) a.frame = 1 - a.frame;
            if (a.x <= 0 || a.x + a.w >= W) edgeHit = true;
        });
        if (edgeHit) {
            this.alienDir *= -1;
            liveAliens.forEach(a => { a.y += 12; });
        }

        this.alienShootTimer++;
        if (this.alienShootTimer > Math.max(40, 80 - this.state.level * 8)) {
            this.alienShootTimer = 0;
            if (liveAliens.length > 0) {
                const shooter = liveAliens[Math.floor(Math.random() * liveAliens.length)];
                this.alienBullets.push({ x: shooter.x + 12, y: shooter.y + shooter.h });
            }
        }

        // Bullet vs alien
        this.bullets.forEach((b, bi) => {
            this.aliens.forEach(a => {
                if (!a.alive) return;
                if (b.x < a.x+a.w && b.x+3 > a.x && b.y < a.y+a.h && b.y+10 > a.y) {
                    a.alive = false;
                    this.bullets.splice(bi, 1);
                    this.state.score += this.ALIEN_TYPES[a.type].points;
                    this.explosions.push({ x: a.x+14, y: a.y+10, life: 20, color: this.ALIEN_TYPES[a.type].color, phase: Math.random()*Math.PI });
                }
            });
            this.shields.forEach((s, si) => {
                if (b.x < s.x+s.w && b.x+3 > s.x && b.y < s.y+s.h && b.y+10 > s.y) {
                    s.hp--; this.bullets.splice(bi, 1);
                    if (s.hp <= 0) this.shields.splice(si, 1);
                }
            });
        });

        // Alien bullet vs player / shield
        this.alienBullets.forEach((b, bi) => {
            const p = this.player;
            if (b.x < p.x+p.w && b.x+3 > p.x && b.y < p.y+p.h && b.y+8 > p.y) {
                this.alienBullets.splice(bi, 1);
                this.state.lives--;
                this.explosions.push({ x: p.x+15, y: p.y+9, life: 25, color: "#4ade80", phase: 0 });
                if (this.state.lives <= 0) { this._gameOver(); return; }
            }
            this.shields.forEach((s, si) => {
                if (b.x < s.x+s.w && b.x+3 > s.x && b.y < s.y+s.h && b.y+8 > s.y) {
                    s.hp--; this.alienBullets.splice(bi, 1);
                    if (s.hp <= 0) this.shields.splice(si, 1);
                }
            });
        });

        liveAliens = this.aliens.filter(a => a.alive);
        if (liveAliens.length === 0) {
            this.state.level++;
            this._initGame();
            return;
        }
        if (liveAliens.some(a => a.y + a.h >= this.player.y)) {
            this._gameOver();
        }
    }

    _gameOver() {
        this.state.gameState = "over";
        cancelAnimationFrame(this.animId);
        this.state.overlayTitle = "GAME OVER";
        this.state.overlayColor = "#f87171";
        this.state.overlaySub1 = `puntos: ${this.state.score}`;
        this.state.overlaySub2 = `nivel alcanzado: ${this.state.level}`;
        this.state.btnLabel = "JUGAR DE NUEVO";
    }

    _gameLoop() {
        if (this.state.gameState !== "playing") return;
        this._update();
        this._draw();
        this.animId = requestAnimationFrame(this._gameLoop.bind(this));
    }

    onStartGame() {
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.state.gameState = "playing";
        this.state.overlayTitle = "SPACE INVADERS";
        this.state.overlayColor = "#4ade80";
        cancelAnimationFrame(this.animId);
        this._initGame();
        this._gameLoop();
    }

    onMobileFire() { this._fireBullet(); }
    onMobileLeftDown() { this.moveLeft = true; }
    onMobileLeftUp() { this.moveLeft = false; }
    onMobileRightDown() { this.moveRight = true; }
    onMobileRightUp() { this.moveRight = false; }
}

SpaceInvadersGame.template = "space_invaders.GameComponent";

// ── OWL XML Template (inline) ──────────────────────────────────────────────
const { xml } = owl;

SpaceInvadersGame.template = xml`
<div class="o_space_invaders_wrapper">
    <div class="o_space_invaders_title">SPACE INVADERS</div>
    <div class="o_space_invaders_subtitle">ODOO EDITION · v19</div>

    <div class="o_space_invaders_hud">
        <div>puntos: <span t-esc="state.score"/></div>
        <div>nivel: <span t-esc="state.level"/></div>
        <div>vidas: <span t-esc="state.lives"/></div>
    </div>

    <div class="o_space_invaders_canvas_wrap">
        <canvas t-ref="canvas"
            class="o_space_invaders_canvas"
            width="480" height="480"/>

        <t t-if="state.gameState !== 'playing'">
            <div class="o_space_invaders_overlay">
                <h2 t-att-style="'color:' + state.overlayColor"
                    t-esc="state.overlayTitle"/>
                <p t-esc="state.overlaySub1"/>
                <p t-esc="state.overlaySub2"/>
                <button class="o_space_invaders_btn"
                    t-on-click="onStartGame"
                    t-esc="state.btnLabel"/>
            </div>
        </t>
    </div>

    <div class="o_space_invaders_controls_hint">
        ← → mover · espacio disparar · botones táctiles abajo
    </div>

    <div class="o_space_invaders_mobile_controls">
        <button class="o_space_invaders_mobile_btn"
            t-on-mousedown="onMobileLeftDown"
            t-on-mouseup="onMobileLeftUp"
            t-on-touchstart.prevent="onMobileLeftDown"
            t-on-touchend="onMobileLeftUp">◀</button>
        <button class="o_space_invaders_mobile_btn"
            t-on-click="onMobileFire">FUEGO</button>
        <button class="o_space_invaders_mobile_btn"
            t-on-mousedown="onMobileRightDown"
            t-on-mouseup="onMobileRightUp"
            t-on-touchstart.prevent="onMobileRightDown"
            t-on-touchend="onMobileRightUp">▶</button>
    </div>

    <div class="o_space_invaders_legend">
        <span><i class="dot" style="background:#f87171"/> UFO · 30 pts</span>
        <span><i class="dot" style="background:#fb923c"/> Cangrejo · 20 pts</span>
        <span><i class="dot" style="background:#a78bfa"/> Calamar · 10 pts</span>
    </div>
</div>
`;

registry.category("actions").add("space_invaders_game", SpaceInvadersGame);

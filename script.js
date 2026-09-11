/**
 * Tic-Tac-Toe: ☠️ vs 😊
 * Features:
 * - Custom player names
 * - Choose between ☠️ Skull and 😊 Smiling face
 * - Real-time online multiplayer via WebRTC (PeerJS) with shareable links
 * - Local Pass & Play offline mode
 * - Synthesized sound effects, scoreboard, confetti celebration
 */

document.addEventListener("DOMContentLoaded", () => {
    // Standard Emojis
    const EMOJI_SKULL = "\u{2620}\u{FE0F}";
    const EMOJI_SMILEY = "\u{1F60A}";

    // DOM Elements - Main Game
    const board = document.getElementById("board");
    const boxes = document.querySelectorAll(".box");
    const turnX = document.getElementById("turnX");
    const turnO = document.getElementById("turnO");
    const turnXEmoji = document.getElementById("turn-x-emoji");
    const turnOEmoji = document.getElementById("turn-o-emoji");
    const turnXLabel = document.getElementById("turn-x-label");
    const turnOLabel = document.getElementById("turn-o-label");
    const turnRoleHint = document.getElementById("online-turn-hint");
    const results = document.getElementById("results");
    const playAgainBtn = document.getElementById("play-again");
    const resetScoreBtn = document.getElementById("reset-score");
    const scoreXEl = document.getElementById("score-x");
    const scoreOEl = document.getElementById("score-o");
    const scoreTiesEl = document.getElementById("score-ties");
    const scoreXName = document.getElementById("score-x-name");
    const scoreOName = document.getElementById("score-o-name");
    const scoreXEmoji = document.getElementById("score-x-emoji");
    const scoreOEmoji = document.getElementById("score-o-emoji");
    const soundToggleBtn = document.getElementById("sound-toggle");
    const soundIcon = document.getElementById("sound-icon");
    const confettiCanvas = document.getElementById("confetti-canvas");
    const openSetupBtn = document.getElementById("open-setup-btn");
    const onlineStatusPill = document.getElementById("online-status-pill");
    const onlineStatusText = document.getElementById("online-status-text");

    // DOM Elements - Setup Modal
    const setupModal = document.getElementById("setup-modal");
    const tabLocal = document.getElementById("tab-local");
    const tabOnline = document.getElementById("tab-online");
    const panelLocal = document.getElementById("panel-local");
    const panelOnline = document.getElementById("panel-online");
    const panelGuest = document.getElementById("panel-guest");

    // Local Setup Form
    const p1NameInput = document.getElementById("p1-name");
    const p2NameInput = document.getElementById("p2-name");
    const p2AssignedEmoji = document.getElementById("p2-assigned-emoji");
    const localEmojiBtns = document.querySelectorAll(".emoji-select-btn:not(.online-emoji-btn)");
    const startLocalBtn = document.getElementById("start-local-btn");

    // Online Host Setup Form
    const hostNameInput = document.getElementById("host-name");
    const onlineEmojiBtns = document.querySelectorAll(".online-emoji-btn");
    const createRoomBtn = document.getElementById("create-room-btn");
    const onlineCreateView = document.getElementById("online-create-view");
    const onlineWaitingView = document.getElementById("online-waiting-view");
    const shareLinkInput = document.getElementById("share-link-input");
    const copyLinkBtn = document.getElementById("copy-link-btn");
    const copyToast = document.getElementById("copy-toast");

    // Online Guest Setup Form
    const guestHostInfo = document.getElementById("guest-host-info");
    const guestNameInput = document.getElementById("guest-name");
    const guestAssignedEmoji = document.getElementById("guest-assigned-emoji");
    const joinRoomBtn = document.getElementById("join-room-btn");

    // Win Conditions
    const WIN_CONDITIONS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Game Configuration State
    let gameMode = "local"; // "local" or "online"
    let localPlayerEmoji = EMOJI_SKULL; // In online mode, the local browser's emoji
    let isHost = false;
    let peer = null;
    let connection = null;
    let pendingRoomId = null;

    // Player 1 (Player X) & Player 2 (Player O)
    let player1 = {
        name: "Player 1",
        emoji: EMOJI_SKULL
    };
    let player2 = {
        name: "Player 2",
        emoji: EMOJI_SMILEY
    };

    // Board State
    let currentPlayer = player1.emoji;
    let boardState = ["", "", "", "", "", "", "", "", ""];
    let isGameActive = true;
    let scores = { x: 0, o: 0, ties: 0 };
    let isMuted = false;

    // ----------------------------------------------------
    // Sound & Storage Initialization
    // ----------------------------------------------------
    try {
        const savedMute = localStorage.getItem("tictactoe_muted");
        if (savedMute !== null) {
            isMuted = JSON.parse(savedMute);
        }
    } catch (e) {}

    function updateSoundButton() {
        soundIcon.textContent = isMuted ? "\u{1F507}" : "\u{1F50A}";
        soundToggleBtn.setAttribute("aria-label", isMuted ? "Unmute Sound" : "Mute Sound");
        soundToggleBtn.title = isMuted ? "Unmute Sound" : "Mute Sound";
    }

    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        return audioCtx;
    }

    function playTone(freq, type = "sine", duration = 0.1, startDelay = 0, gainLevel = 0.2) {
        if (isMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        setTimeout(() => {
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (e) {}
        }, startDelay * 1000);
    }

    function playClickSound(isSkull) {
        if (isMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(isSkull ? 320 : 540, now);
            osc.frequency.exponentialRampToValueAtTime(isSkull ? 460 : 740, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.08);
        } catch (e) {}
    }

    function playWinSound() {
        if (isMuted) return;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            playTone(freq, "sine", 0.22, idx * 0.09, 0.25);
        });
    }

    function playDrawSound() {
        if (isMuted) return;
        playTone(380, "sawtooth", 0.15, 0, 0.12);
        playTone(320, "sawtooth", 0.25, 0.12, 0.12);
    }

    function playResetSound() {
        if (isMuted) return;
        playTone(480, "sine", 0.08, 0, 0.15);
        playTone(600, "sine", 0.1, 0.06, 0.15);
    }

    // ----------------------------------------------------
    // Confetti System
    // ----------------------------------------------------
    let confettiAnimationId = null;
    function launchConfetti() {
        if (!confettiCanvas) return;
        const ctx = confettiCanvas.getContext("2d");
        if (!ctx) return;
        if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;

        const particles = [];
        const colors = ["#f43f5e", "#fbbf24", "#34d399", "#38bdf8", "#a855f7", "#fb7185"];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 160,
                y: confettiCanvas.height * 0.4 + (Math.random() - 0.5) * 80,
                w: Math.random() * 8 + 5,
                h: Math.random() * 8 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 1.2) * 12 - 2,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                gravity: 0.35 + Math.random() * 0.15,
                opacity: 1,
                decay: 0.007 + Math.random() * 0.008
            });
        }

        const startTime = Date.now();
        function render() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let alive = 0;
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rot += p.rotSpeed;
                p.opacity -= p.decay;
                if (p.opacity > 0 && p.y < confettiCanvas.height + 20) {
                    alive++;
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, p.opacity);
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rot * Math.PI) / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            });
            if (alive > 0 && Date.now() - startTime < 2800) {
                confettiAnimationId = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
                confettiAnimationId = null;
            }
        }
        confettiAnimationId = requestAnimationFrame(render);
    }

    // ----------------------------------------------------
    // UI Updates (Scores, Turn Indicators, Cursors)
    // ----------------------------------------------------
    function updateScoreDisplay() {
        scoreXEl.textContent = scores.x;
        scoreOEl.textContent = scores.o;
        scoreTiesEl.textContent = scores.ties;

        scoreXEmoji.textContent = player1.emoji;
        scoreOEmoji.textContent = player2.emoji;
        scoreXName.textContent = player1.name;
        scoreOName.textContent = player2.name;

        turnXEmoji.textContent = player1.emoji;
        turnOEmoji.textContent = player2.emoji;
        turnXLabel.textContent = player1.name;
        turnOLabel.textContent = player2.name;
    }

    function updateTurn() {
        const isP1Turn = (currentPlayer === player1.emoji);
        if (isP1Turn) {
            turnX.classList.add("active");
            turnO.classList.remove("active");
        } else {
            turnO.classList.add("active");
            turnX.classList.remove("active");
        }

        // Online mode: update turn role hint ("Your Turn" vs "Opponent's Turn")
        if (gameMode === "online") {
            turnRoleHint.classList.remove("hidden");
            const isMyTurn = (currentPlayer === localPlayerEmoji);
            if (isMyTurn) {
                turnRoleHint.textContent = "👉 Your Turn!";
                turnRoleHint.style.color = "#34d399";
                turnRoleHint.style.borderColor = "rgba(52, 211, 153, 0.4)";
                turnRoleHint.style.background = "rgba(52, 211, 153, 0.15)";
            } else {
                turnRoleHint.textContent = "⏳ Opponent's Turn...";
                turnRoleHint.style.color = "#a5b4fc";
                turnRoleHint.style.borderColor = "rgba(165, 180, 252, 0.3)";
                turnRoleHint.style.background = "rgba(165, 180, 252, 0.1)";
            }

            // Update cell cursors
            boxes.forEach((box) => {
                if (!box.classList.contains("taken") && isGameActive) {
                    if (isMyTurn) {
                        box.classList.remove("not-my-turn");
                    } else {
                        box.classList.add("not-my-turn");
                    }
                } else {
                    box.classList.remove("not-my-turn");
                }
            });
        } else {
            turnRoleHint.classList.add("hidden");
            boxes.forEach((box) => box.classList.remove("not-my-turn"));
        }
    }

    function checkWin() {
        for (let condition of WIN_CONDITIONS) {
            const [a, b, c] = condition;
            if (
                boardState[a] &&
                boardState[a] === boardState[b] &&
                boardState[a] === boardState[c]
            ) {
                return {
                    winner: boardState[a],
                    combination: condition
                };
            }
        }
        if (!boardState.includes("")) {
            return { winner: "draw", combination: [] };
        }
        return null;
    }

    // ----------------------------------------------------
    // Box Click & Board Execution
    // ----------------------------------------------------
    function applyMove(index, playerEmoji, triggerAudio = true) {
        boardState[index] = playerEmoji;
        const box = document.querySelector(`.box[data-index="${index}"]`);
        if (box) {
            box.innerHTML = `<span class="emoji-pop">${playerEmoji}</span>`;
            box.classList.add("taken");
            box.classList.remove("not-my-turn");
            box.setAttribute("aria-label", `Cell ${index + 1}: ${playerEmoji}`);
        }

        if (triggerAudio) {
            playClickSound(playerEmoji === EMOJI_SKULL);
        }

        const winResult = checkWin();
        if (winResult) {
            isGameActive = false;
            boxes.forEach((b) => {
                b.classList.add("game-over");
                b.classList.remove("not-my-turn");
            });

            if (winResult.winner === "draw") {
                results.className = "results-text draw";
                results.textContent = "\u{1F91D} It's a Draw! \u{1F610}";
                scores.ties++;
                updateScoreDisplay();
                playDrawSound();
            } else {
                winResult.combination.forEach((idx) => {
                    const winBox = document.querySelector(`.box[data-index="${idx}"]`);
                    if (winBox) winBox.classList.add("winning-box");
                });

                const isP1Winner = (winResult.winner === player1.emoji);
                const winnerName = isP1Winner ? player1.name : player2.name;
                const winnerEmoji = winResult.winner;

                if (isP1Winner) {
                    results.className = "results-text win-x";
                    scores.x++;
                } else {
                    results.className = "results-text win-o";
                    scores.o++;
                }

                results.textContent = `\u{1F389} ${winnerEmoji} ${winnerName} Wins!`;
                updateScoreDisplay();
                playWinSound();
                launchConfetti();
            }
        } else {
            // Switch current player
            currentPlayer = (currentPlayer === player1.emoji) ? player2.emoji : player1.emoji;
            updateTurn();
        }
    }

    function handleBoxClick(event) {
        const box = event.currentTarget;
        const index = parseInt(box.getAttribute("data-index"), 10);

        if (!isGameActive || boardState[index]) return;

        // In online mode: only allow move if it is this player's turn
        if (gameMode === "online") {
            if (currentPlayer !== localPlayerEmoji) return;
            if (!connection || !connection.open) {
                alert("Waiting for opponent to connect!");
                return;
            }
        }

        const moveEmoji = currentPlayer;
        applyMove(index, moveEmoji, true);

        // Send move to peer if online
        if (gameMode === "online" && connection && connection.open) {
            connection.send({
                type: "MOVE",
                index: index,
                emoji: moveEmoji
            });
        }
    }

    function executeRestart(triggerSound = true) {
        if (triggerSound) playResetSound();
        currentPlayer = player1.emoji;
        boardState = ["", "", "", "", "", "", "", "", ""];
        isGameActive = true;
        results.textContent = "";
        results.className = "results-text";

        boxes.forEach((box, index) => {
            box.innerHTML = "";
            box.className = "box";
            box.setAttribute("aria-label", `Cell ${index + 1}`);
        });

        updateTurn();
    }

    function handlePlayAgain() {
        executeRestart(true);
        if (gameMode === "online" && connection && connection.open) {
            connection.send({ type: "RESTART" });
        }
    }

    function executeScoreReset(triggerSound = true) {
        if (triggerSound) playResetSound();
        scores = { x: 0, o: 0, ties: 0 };
        updateScoreDisplay();
        executeRestart(false);
    }

    function handleResetScore() {
        executeScoreReset(true);
        if (gameMode === "online" && connection && connection.open) {
            connection.send({ type: "SCORE_RESET" });
        }
    }

    // ----------------------------------------------------
    // Modal & Setup Flow
    // ----------------------------------------------------
    function openModal() {
        setupModal.classList.remove("hidden");
    }

    function closeModal() {
        setupModal.classList.add("hidden");
    }

    // Tab Switching
    tabLocal.addEventListener("click", () => {
        tabLocal.classList.add("active");
        tabOnline.classList.remove("active");
        panelLocal.classList.add("active");
        panelOnline.classList.remove("active");
    });

    tabOnline.addEventListener("click", () => {
        tabOnline.classList.add("active");
        tabLocal.classList.remove("active");
        panelOnline.classList.add("active");
        panelLocal.classList.remove("active");
    });

    // Local Emoji Selection
    localEmojiBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            localEmojiBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const selectedEmoji = btn.getAttribute("data-emoji");
            player1.emoji = selectedEmoji;
            player2.emoji = (selectedEmoji === EMOJI_SKULL) ? EMOJI_SMILEY : EMOJI_SKULL;
            p2AssignedEmoji.textContent = player2.emoji;
        });
    });

    // Online Host Emoji Selection
    onlineEmojiBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            onlineEmojiBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Start Local Game
    startLocalBtn.addEventListener("click", () => {
        gameMode = "local";
        player1.name = p1NameInput.value.trim() || "Player 1";
        player2.name = p2NameInput.value.trim() || "Player 2";
        const selectedBtn = document.querySelector(".emoji-select-btn.active:not(.online-emoji-btn)");
        const p1Emoji = selectedBtn ? selectedBtn.getAttribute("data-emoji") : EMOJI_SKULL;
        player1.emoji = p1Emoji;
        player2.emoji = (p1Emoji === EMOJI_SKULL) ? EMOJI_SMILEY : EMOJI_SKULL;

        scores = { x: 0, o: 0, ties: 0 };
        onlineStatusPill.classList.add("hidden");

        updateScoreDisplay();
        executeRestart(true);
        closeModal();
    });

    // ----------------------------------------------------
    // Realtime Online Multiplayer (WebRTC / PeerJS)
    // ----------------------------------------------------
    function setupPeerConnection(conn) {
        connection = conn;

        connection.on("open", () => {
            console.log("Peer connection established!");
            onlineStatusPill.classList.remove("hidden");
            onlineStatusText.textContent = `Live with ${isHost ? player2.name : player1.name}`;

            if (isHost) {
                // Host sends INIT state to Guest
                connection.send({
                    type: "INIT",
                    hostName: player1.name,
                    hostEmoji: player1.emoji,
                    guestEmoji: player2.emoji
                });
                closeModal();
                executeRestart(true);
            }
        });

        connection.on("data", (data) => {
            if (!data || !data.type) return;

            if (data.type === "GUEST_HELLO") {
                player2.name = data.guestName || "Player 2";
                updateScoreDisplay();
                onlineStatusText.textContent = `Live with ${player2.name}`;
            } else if (data.type === "INIT") {
                player1.name = data.hostName;
                player1.emoji = data.hostEmoji;
                player2.emoji = data.guestEmoji;
                localPlayerEmoji = data.guestEmoji;
                updateScoreDisplay();
                onlineStatusPill.classList.remove("hidden");
                onlineStatusText.textContent = `Live with ${player1.name}`;
                closeModal();
                executeRestart(true);
            } else if (data.type === "MOVE") {
                applyMove(data.index, data.emoji, true);
            } else if (data.type === "RESTART") {
                executeRestart(true);
            } else if (data.type === "SCORE_RESET") {
                executeScoreReset(true);
            }
        });

        connection.on("close", () => {
            onlineStatusText.textContent = "Opponent Disconnected";
            alert("Opponent has disconnected from the match.");
        });

        connection.on("error", (err) => {
            console.error("Peer connection error:", err);
        });
    }

    // Host Room Creation
    createRoomBtn.addEventListener("click", () => {
        if (typeof Peer === "undefined") {
            alert("Unable to load PeerJS library. Please check your internet connection.");
            return;
        }

        const hName = hostNameInput.value.trim() || "Player 1";
        const selectedBtn = document.querySelector(".online-emoji-btn.active");
        const hEmoji = selectedBtn ? selectedBtn.getAttribute("data-emoji") : EMOJI_SKULL;

        player1.name = hName;
        player1.emoji = hEmoji;
        player2.name = "Waiting...";
        player2.emoji = (hEmoji === EMOJI_SKULL) ? EMOJI_SMILEY : EMOJI_SKULL;
        localPlayerEmoji = hEmoji;
        isHost = true;
        gameMode = "online";

        // Generate clean Room ID
        const roomId = "ttt-" + Math.random().toString(36).substring(2, 9);
        peer = new Peer(roomId);

        peer.on("open", (id) => {
            const shareUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "#room=" + id;
            shareLinkInput.value = shareUrl;
            onlineCreateView.classList.add("hidden");
            onlineWaitingView.classList.remove("hidden");
        });

        peer.on("connection", (conn) => {
            setupPeerConnection(conn);
        });

        peer.on("error", (err) => {
            console.error("Peer error:", err);
            alert("Connection error: " + err.message);
        });
    });

    // Copy Link Button
    copyLinkBtn.addEventListener("click", () => {
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            copyToast.classList.remove("hidden");
            setTimeout(() => copyToast.classList.add("hidden"), 3000);
        }).catch(() => {
            document.execCommand("copy");
            copyToast.classList.remove("hidden");
            setTimeout(() => copyToast.classList.add("hidden"), 3000);
        });
    });

    // Guest Join Button
    joinRoomBtn.addEventListener("click", () => {
        if (typeof Peer === "undefined") {
            alert("Unable to load PeerJS library. Please check your internet connection.");
            return;
        }

        const gName = guestNameInput.value.trim() || "Player 2";
        player2.name = gName;
        isHost = false;
        gameMode = "online";

        peer = new Peer();
        peer.on("open", () => {
            const conn = peer.connect(pendingRoomId);
            conn.on("open", () => {
                conn.send({
                    type: "GUEST_HELLO",
                    guestName: gName
                });
            });
            setupPeerConnection(conn);
        });

        peer.on("error", (err) => {
            console.error("Guest peer error:", err);
            alert("Could not connect to room: " + err.message);
        });
    });

    // Check URL for Guest Room Invitation (#room=...)
    function checkUrlInvitation() {
        const hash = window.location.hash;
        if (hash && hash.includes("room=")) {
            const match = hash.match(/room=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                pendingRoomId = match[1];
                // Show Guest Panel
                panelLocal.classList.remove("active");
                panelOnline.classList.remove("active");
                panelGuest.classList.remove("active");
                document.getElementById("mode-tabs").classList.add("hidden");
                panelGuest.classList.remove("hidden");
                panelGuest.classList.add("active");
                openModal();
                return true;
            }
        }
        return false;
    }

    // ----------------------------------------------------
    // Global Event Listeners
    // ----------------------------------------------------
    boxes.forEach((box) => {
        box.addEventListener("click", handleBoxClick);
        box.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                box.click();
            }
        });
    });

    playAgainBtn.addEventListener("click", handlePlayAgain);
    resetScoreBtn.addEventListener("click", handleResetScore);
    openSetupBtn.addEventListener("click", openModal);

    soundToggleBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        updateSoundButton();
        try {
            localStorage.setItem("tictactoe_muted", JSON.stringify(isMuted));
        } catch (e) {}
        if (!isMuted) playTone(600, "sine", 0.1, 0, 0.2);
    });

    window.addEventListener("resize", () => {
        if (confettiCanvas && confettiAnimationId) {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
    });

    // Initialize Game
    updateSoundButton();
    const hasInvite = checkUrlInvitation();
    if (!hasInvite) {
        // Open modal on first visit for player setup
        openModal();
        updateScoreDisplay();
        executeRestart(false);
    }
});

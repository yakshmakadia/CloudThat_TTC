/**
 * Tic-Tac-Toe: ☠️ vs 😊
 * Features:
 * - Real-Time AI Trash-Talk & Hype Commentator (Gemini API + Contextual Smart Quips)
 * - Spoken Text-to-Speech (TTS) Voice Commentary
 * - Selectable AI Personalities (Savage Roaster ☠️, Hype Caster 🔥, Zen Coach 😊)
 * - Custom player names and emoji selection
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

    // AI Commentator Elements
    const aiAvatar = document.getElementById("ai-avatar");
    const aiPersonalityBadge = document.getElementById("ai-personality-badge");
    const commentaryText = document.getElementById("commentary-text");
    const ttsToggleBtn = document.getElementById("tts-toggle-btn");
    const ttsIcon = document.getElementById("tts-icon");
    const ttsLabel = document.getElementById("tts-label");
    const personalityBtns = document.querySelectorAll(".personality-btn");
    const geminiKeyInput = document.getElementById("gemini-key-input");

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
    let localPlayerEmoji = EMOJI_SKULL;
    let isHost = false;
    let peer = null;
    let connection = null;
    let pendingRoomId = null;

    // Player 1 & Player 2
    let player1 = { name: "Player 1", emoji: EMOJI_SKULL };
    let player2 = { name: "Player 2", emoji: EMOJI_SMILEY };

    // Board State
    let currentPlayer = player1.emoji;
    let boardState = ["", "", "", "", "", "", "", "", ""];
    let isGameActive = true;
    let scores = { x: 0, o: 0, ties: 0 };
    let isMuted = false;
    let isVoiceEnabled = true;
    let currentPersonality = "savage"; // "savage", "hype", "zen"
    let geminiApiKey = "";
    let moveCount = 0;

    // ----------------------------------------------------
    // AI Commentator Personalities & Quip Banks
    // ----------------------------------------------------
    const PERSONALITIES = {
        savage: {
            name: "Savage Roast ☠️",
            badge: "Savage Roast ☠️",
            pitch: 0.95,
            rate: 1.05,
            openings: [
                "Khel shuru! Dekhte hain kisme kitna dimaag hai aur kaun bas tukke maar raha hai.",
                "Arey waah, pehli hi chaal me itna overconfidence? Sahi hai guru!",
                "Center pe kabza? Arey waah, bade tejaswi log hain yahan!",
                "Chalo shuruaat toh hui, ab dekhte hain kitni der tik paate ho."
            ],
            blocks: [
                "Arey baap re! Block kar diya! Nice try babumoshai, par daal nahi galegi!",
                "Ruk ja re bande! Itni aasaani se jeetne thode hi denge!",
                "Khatarnak block! Khiladi ne seedha rasta hi band kar diya!"
            ],
            blunders: [
                "Kya gunda banega re tu! Khula chhod diya, ab toh bachha bhi jeet jaye!",
                "Aankh band karke click kiya kya? Yeh kaunsi chaal thi bhai?!",
                "Lagta hai haarne ki bohot jaldi hai tumhe!"
            ],
            general: [
                "Itna soch ke bhi yeh chaal chali? Gazab beizzati hai yaar!",
                "Arey bhai, thoda dimaag use kar lo, thoda sa bas!",
                "Aise kheloge toh agle janam me bhi nahi jeet paoge!",
                "Calculating your chances... Error: Dimaag not found!"
            ],
            wins: [
                "Khatam! Tata! Bye-bye! Ho gaya kaam tamaam!",
                "Ekdum dhuandhaar jeet! Opponent ki toh bolti band ho gayi!",
                "Yeh toh hona hi tha! Ek taraf sher, doosri taraf dher!"
            ],
            draws: [
                "Match tie ho gaya! Dono ne milkar solid timepass kiya hai aaj!",
                "Na tum jeete, na wo jeeta! Poora draw, zero result!",
                "Dono barabar ke nikle, dimaag kisi ne nahi lagaya!"
            ]
        },
        hype: {
            name: "Dhamakedar Hype 🔥",
            badge: "Dhamakedar Hype 🔥",
            pitch: 1.15,
            rate: 1.2,
            openings: [
                "SWAGAT HAI SABHI KA! KHEL SHURU HO CHUKA HAI POORE JOSH MEIN!",
                "PEHLI HI CHAAL MEIN TEHLKA MACHA DIYA HAI KHILADI NE!",
                "KYA SHURUAAT HAI! STADIUM MEIN TALIYAAN RUK NAHI RAHI!"
            ],
            blocks: [
                "BAWAAL BLOCK! KYA SOLID DEFENSE DIKHAYA HAI AAJ!",
                "OUTSTANDING MOVE! JEET KA RASTA PURA ROK DIYA!",
                "KAMAAL KA REFLEX! INHE MASTERMIND AISE HI NAHI KEHTE!"
            ],
            blunders: [
                "OH BHAI MAARO MUJHE! KYA CHANCE CHHOD DIYA KHILADI NE!",
                "KHATARNAAK MOD! AGLE TURN MEIN HOGA BADA DHAMAKA!"
            ],
            general: [
                "HAR MOVE MEIN SUSPENSE! AGLE KADAM PAR KYA HOGA?!",
                "PRESSURE HIGH HAI! DONO KHILADI AAMNE-SAAMNE DATT GAYE HAIN!",
                "UNBELIEVABLE TENSION! ITIHAAS RACHA JA RAHA HAI DOSTO!"
            ],
            wins: [
                "SHANDAR! ZABARDAST! ZINDABAD! KYA JEET HASIL KI HAI!",
                "VICTORY! CHAMPION KHILADI NE MAIDAN MAAR LIYA HAI!",
                "HISTORIC WIN! KYA KHELA HAI AAJ KA HERO!"
            ],
            draws: [
                "ROMAANCHAK DRAW! KANTE KI TAKKAR MEIN TIE HO GAYA!"
            ]
        },
        zen: {
            name: "Shanti Coach 😊",
            badge: "Shanti Coach 😊",
            pitch: 0.95,
            rate: 0.9,
            openings: [
                "Namaste dosto. Shanti se kheliye, har chaal jeevan ki seekh hai.",
                "Sanyam banaye rakhein. Is yatra ka anand lein."
            ],
            blocks: [
                "Bohot sundar bachav. Santulan bana hua hai.",
                "Dhairya se har mushkil tal jati hai."
            ],
            blunders: [
                "Koi baat nahi. Har galti ek naya sabak sikhati hai."
            ],
            general: [
                "Dhyan lagakar khelein, shanti hi asli jeet hai.",
                "Sundar soch. Khel ka shanti se anand lein."
            ],
            wins: [
                "Sundar jeet! Shanti aur parishram ka meetha phal mila.",
                "Badhai ho! Aapke dhairya ne kamaal kar diya."
            ],
            draws: [
                "Samaan santulan. Dono ne sundar sanyam dikhaya."
            ]
        }
    };

    // ----------------------------------------------------
    // Storage & State Initialization
    // ----------------------------------------------------
    try {
        const savedKey = localStorage.getItem("tictactoe_gemini_key");
        if (savedKey) {
            geminiApiKey = savedKey;
            geminiKeyInput.value = savedKey;
        }
        const savedPersonality = localStorage.getItem("tictactoe_personality");
        if (savedPersonality && PERSONALITIES[savedPersonality]) {
            currentPersonality = savedPersonality;
        }
        const savedVoice = localStorage.getItem("tictactoe_voice");
        if (savedVoice !== null) {
            isVoiceEnabled = JSON.parse(savedVoice);
        }
        const savedMute = localStorage.getItem("tictactoe_muted");
        if (savedMute !== null) {
            isMuted = JSON.parse(savedMute);
        }
    } catch (e) {}

    function updatePersonalityUI() {
        const p = PERSONALITIES[currentPersonality] || PERSONALITIES.savage;
        aiPersonalityBadge.textContent = p.badge;
        personalityBtns.forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-personality") === currentPersonality);
        });
    }

    function updateVoiceButton() {
        ttsToggleBtn.classList.toggle("active", isVoiceEnabled);
        ttsIcon.textContent = isVoiceEnabled ? "🗣️" : "🤫";
        ttsLabel.textContent = isVoiceEnabled ? "Voice ON" : "Voice OFF";
    }

    function updateSoundButton() {
        soundIcon.textContent = isMuted ? "\u{1F507}" : "\u{1F50A}";
        soundToggleBtn.setAttribute("aria-label", isMuted ? "Unmute Sound" : "Mute Sound");
        soundToggleBtn.title = isMuted ? "Unmute Sound" : "Mute Sound";
    }

    // ----------------------------------------------------
    // Text-to-Speech (TTS) Engine
    // ----------------------------------------------------
    function speakCommentary(text) {
        if (!isVoiceEnabled || !("speechSynthesis" in window)) return;
        try {
            window.speechSynthesis.cancel(); // Stop prior speech
            const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
            if (!cleanText) return;

            const utterance = new SpeechSynthesisUtterance(cleanText);
            const p = PERSONALITIES[currentPersonality] || PERSONALITIES.savage;
            utterance.pitch = p.pitch;
            utterance.rate = p.rate;

            // Pick Hindi (hi-IN / hi) or Indian English voice if available
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const hiVoice = voices.find((v) => v.lang.startsWith("hi") || v.lang.includes("IN") || v.name.includes("India") || v.name.includes("Hindi"));
                if (hiVoice) {
                    utterance.voice = hiVoice;
                } else {
                    const fallback = voices.find((v) => v.lang.startsWith("en"));
                    if (fallback) utterance.voice = fallback;
                }
            }

            aiAvatar.classList.add("talking");
            utterance.onend = () => aiAvatar.classList.remove("talking");
            utterance.onerror = () => aiAvatar.classList.remove("talking");

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            aiAvatar.classList.remove("talking");
        }
    }

    // ----------------------------------------------------
    // GenAI Commentary Engine (Gemini API + Fallback)
    // ----------------------------------------------------
    async function requestGeminiCommentary(promptText) {
        if (!geminiApiKey) return null;

        const models = ["gemini-flash-lite-latest", "gemini-flash-latest"];
        for (const model of models) {
            try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
                const body = {
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: {
                        maxOutputTokens: 50,
                        temperature: 0.95
                    }
                };
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (reply) return reply.replace(/^["']|["']$/g, "");
                }
            } catch (e) {
                // Fall back to next model or contextual quips
            }
        }
        return null;
    }

    function getLocalQuip(category) {
        const p = PERSONALITIES[currentPersonality] || PERSONALITIES.savage;
        const pool = p[category] || p.general;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function checkMoveContext(index, playerEmoji) {
        // Detect if this move blocked an opponent from winning
        const opponentEmoji = (playerEmoji === player1.emoji) ? player2.emoji : player1.emoji;
        let isBlock = false;
        for (let condition of WIN_CONDITIONS) {
            if (condition.includes(index)) {
                const otherTwo = condition.filter((idx) => idx !== index);
                if (boardState[otherTwo[0]] === opponentEmoji && boardState[otherTwo[1]] === opponentEmoji) {
                    isBlock = true;
                    break;
                }
            }
        }
        return { isBlock };
    }

    async function generateCommentary(contextType, activePlayerName, moveIndex = -1, moveEmoji = "") {
        let comment = "";
        const p = PERSONALITIES[currentPersonality] || PERSONALITIES.savage;
        const personalityDesc = (currentPersonality === "savage")
            ? "sarcastic, witty, savage roaster who mocks mistakes"
            : (currentPersonality === "hype")
            ? "hyper-energetic esports shoutcaster who screams in excitement"
            : "peaceful, zen meditation coach who stays balanced and calm";

        // If Gemini API Key is present, try LLM generation
        if (geminiApiKey) {
            let prompt = `You are a hilarious, witty Indian commentator for a 2-player Tic-Tac-Toe game.
Your persona: ${personalityDesc}.
LANGUAGE: Conversational Hindi / Hinglish (Latin alphabet, e.g. "Arey bhai kya move chal diya!", "Khatam tata bye bye!").
Rule: Under 12 words. Super funny, sarcastic or dramatic Indian humor. No hashtags. No English sentences.
Context: `;

            if (contextType === "win") {
                prompt += `Player "${activePlayerName}" match JEET gaya! Loser ko roast karo ya winner ko badhai do!`;
            } else if (contextType === "draw") {
                prompt += `Match DRAW / TIE ho gaya! Dono khiladiyon pe funny comment karo!`;
            } else if (contextType === "block") {
                prompt += `Player "${activePlayerName}" ne opponent ko BLOCK karke rasta band kar diya!`;
            } else if (moveCount <= 2) {
                prompt += `Pehla ya doosra move by Player "${activePlayerName}". Shuruaat pe comment karo.`;
            } else {
                prompt += `Player "${activePlayerName}" ne move chala. Match chal raha hai.`;
            }

            comment = await requestGeminiCommentary(prompt);
        }

        // Fallback to rich contextual smart quips if no API key or fetch error
        if (!comment) {
            if (contextType === "win") {
                comment = getLocalQuip("wins");
            } else if (contextType === "draw") {
                comment = getLocalQuip("draws");
            } else if (contextType === "block") {
                comment = getLocalQuip("blocks");
            } else if (moveCount <= 2) {
                comment = getLocalQuip("openings");
            } else {
                comment = getLocalQuip("general");
            }
        }

        // Display in UI and trigger voice
        commentaryText.textContent = `"${comment}"`;
        speakCommentary(comment);

        // In online mode: send commentary text to peer so both hear the same quip
        if (gameMode === "online" && connection && connection.open && isHost) {
            connection.send({
                type: "COMMENTARY",
                text: comment
            });
        }
    }

    // ----------------------------------------------------
    // Sound Synthesizer (Zero External Dependencies)
    // ----------------------------------------------------
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
    // UI Updates
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
    // Move Execution & Box Clicks
    // ----------------------------------------------------
    function applyMove(index, playerEmoji, triggerAudio = true) {
        boardState[index] = playerEmoji;
        moveCount++;

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

        const activePlayerName = (playerEmoji === player1.emoji) ? player1.name : player2.name;
        const moveContext = checkMoveContext(index, playerEmoji);

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
                generateCommentary("draw", activePlayerName);
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
                generateCommentary("win", winnerName);
            }
        } else {
            // Commentary on intermediate moves
            if (moveContext.isBlock) {
                generateCommentary("block", activePlayerName, index, playerEmoji);
            } else {
                generateCommentary("normal", activePlayerName, index, playerEmoji);
            }

            // Switch current player
            currentPlayer = (currentPlayer === player1.emoji) ? player2.emoji : player1.emoji;
            updateTurn();
        }
    }

    function handleBoxClick(event) {
        const box = event.currentTarget;
        const index = parseInt(box.getAttribute("data-index"), 10);

        if (!isGameActive || boardState[index]) return;

        if (gameMode === "online") {
            if (currentPlayer !== localPlayerEmoji) return;
            if (!connection || !connection.open) {
                alert("Waiting for opponent to connect!");
                return;
            }
        }

        const moveEmoji = currentPlayer;
        applyMove(index, moveEmoji, true);

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
        moveCount = 0;
        results.textContent = "";
        results.className = "results-text";

        boxes.forEach((box, index) => {
            box.innerHTML = "";
            box.className = "box";
            box.setAttribute("aria-label", `Cell ${index + 1}`);
        });

        commentaryText.textContent = `"Naya round shuru! Is baar dimaag lagana sabhi!"`;
        speakCommentary("Naya round shuru! Is baar dimaag lagana sabhi!");
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

    onlineEmojiBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            onlineEmojiBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Personality Selection
    personalityBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            currentPersonality = btn.getAttribute("data-personality");
            try {
                localStorage.setItem("tictactoe_personality", currentPersonality);
            } catch (e) {}
            updatePersonalityUI();
        });
    });

    // Gemini API Key Input
    geminiKeyInput.addEventListener("input", () => {
        geminiApiKey = geminiKeyInput.value.trim();
        try {
            localStorage.setItem("tictactoe_gemini_key", geminiApiKey);
        } catch (e) {}
    });

    // TTS Voice Toggle
    ttsToggleBtn.addEventListener("click", () => {
        isVoiceEnabled = !isVoiceEnabled;
        updateVoiceButton();
        try {
            localStorage.setItem("tictactoe_voice", JSON.stringify(isVoiceEnabled));
        } catch (e) {}
        if (!isVoiceEnabled && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            aiAvatar.classList.remove("talking");
        } else if (isVoiceEnabled) {
            speakCommentary("Hindi commentary shuru ho gayi hai!");
        }
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

        updatePersonalityUI();
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
            onlineStatusPill.classList.remove("hidden");
            onlineStatusText.textContent = `Live with ${isHost ? player2.name : player1.name}`;

            if (isHost) {
                connection.send({
                    type: "INIT",
                    hostName: player1.name,
                    hostEmoji: player1.emoji,
                    guestEmoji: player2.emoji,
                    personality: currentPersonality
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
                if (data.personality && PERSONALITIES[data.personality]) {
                    currentPersonality = data.personality;
                    updatePersonalityUI();
                }
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
            } else if (data.type === "COMMENTARY") {
                commentaryText.textContent = `"${data.text}"`;
                speakCommentary(data.text);
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
            alert("Connection error: " + err.message);
        });
    });

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
            alert("Could not connect to room: " + err.message);
        });
    });

    function checkUrlInvitation() {
        const hash = window.location.hash;
        if (hash && hash.includes("room=")) {
            const match = hash.match(/room=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                pendingRoomId = match[1];
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
    // Event Listeners
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
    updateVoiceButton();
    updatePersonalityUI();

    const hasInvite = checkUrlInvitation();
    if (!hasInvite) {
        openModal();
        updateScoreDisplay();
        executeRestart(false);
    }
});

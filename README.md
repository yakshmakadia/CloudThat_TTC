# Emoji Tic-Tac-Toe (☠️ vs 😊)

A responsive, real-time multiplayer Tic-Tac-Toe web application featuring custom player names, emoji themes (☠️ Skull vs 😊 Smiling Face), sound effects, and celebratory confetti.

## ✨ Features

- **Real-Time Online Multiplayer**: Play with a friend anywhere in the world by simply sharing a link. Powered by WebRTC via PeerJS (no backend required).
- **Local Pass & Play**: Play offline on the same device with custom player names.
- **Custom Player Setup**: Choose your player name and select either **☠️ (Skull)** or **😊 (Smiley)**.
- **Modern Responsive Design**: Glassmorphic dark theme built with CSS grid and fluid typography that scales seamlessly across mobile, tablet, and desktop.
- **Micro-Interactions & Animations**: Bouncy emoji pop-in animations, glowing active turn indicators, and pulse highlights on winning combinations.
- **Interactive Audio**: Synthesized sound effects using the Web Audio API with an easy mute toggle (🔊 / 🔇).
- **Celebration Confetti**: Physics-based canvas confetti burst on game victory.

## 🚀 Getting Started

Simply clone or download this repository and open index.html in any modern web browser.

`ash
git clone https://github.com/yakshmakadia/CloudThat_TTC.git
cd CloudThat_TTC
`

Open index.html in your browser to start playing!

## 🌐 How Online Multiplayer Works

1. Click **Play Online** in the setup menu.
2. Enter your name and pick your emoji.
3. Click **Create Game & Get Link**, then click **Copy Link**.
4. Send the link to a friend. When they open it, both browsers connect directly peer-to-peer!

## 🛠️ Built With

- Vanilla HTML5 & CSS3
- Modern JavaScript (ES6+)
- [PeerJS](https://peerjs.com/) (WebRTC DataChannels)
- Web Audio API
- HTML5 Canvas

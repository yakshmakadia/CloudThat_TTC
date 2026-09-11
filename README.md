# Emoji Tic-Tac-Toe (☠️ vs 😊) - With AI Trash-Talk Commentator

A responsive, real-time multiplayer Tic-Tac-Toe web application featuring an AI Trash-Talk & Hype Commentator, custom player names, emoji themes (☠️ Skull vs 😊 Smiling Face), sound effects, and celebratory confetti.

## ✨ Features

- **🎙️ Live AI Match Commentator & Trash-Talker**:
  - Live AI reactions to every move, clutch block, blunder, victory, and draw!
  - **Spoken Voice Commentary (TTS)**: The AI actually speaks the lines aloud via native Web Speech Synthesis.
  - **3 Selectable Personalities**:
    - **Savage Roaster ☠️**: Sarcastic, roasts blunders and slow moves.
    - **Hype Caster 🔥**: Hyper-energetic esports shoutcaster.
    - **Zen Coach 😊**: Wholesome, peaceful vibes and mindfulness.
  - **Dual Engine**: Works out of the box with rich contextual quips, plus support for **Google Gemini API** for endless custom dynamic roasts.
- **🌐 Real-Time Online Multiplayer**: Play with a friend anywhere by sharing a link. Powered by WebRTC via PeerJS (no backend required).
- **🎮 Local Pass & Play**: Play offline on the same device with custom player names.
- **Custom Player Setup**: Choose your player name and select either **☠️ (Skull)** or **😊 (Smiley)**.
- **Modern Responsive Design**: Glassmorphic dark theme built with CSS grid and fluid typography that scales seamlessly across mobile, tablet, and desktop.
- **Interactive Audio**: Synthesized sound effects using the Web Audio API with an easy mute toggle (🔊 / 🔇).
- **Celebration Confetti**: Physics-based canvas confetti burst on game victory.

## 🚀 Getting Started

Simply clone or download this repository and open index.html in any modern web browser:

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

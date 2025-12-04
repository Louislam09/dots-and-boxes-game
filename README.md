# 🎮 Dots & Boxes

A real-time multiplayer **Dots and Boxes** game built with React Native (Expo), featuring PocketBase for backend and Socket.io for real-time gameplay.

![React Native](https://img.shields.io/badge/React_Native-0.81-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-black)
![PocketBase](https://img.shields.io/badge/PocketBase-0.21-orange)

## 📸 Screenshots

*(Coming soon)*

## ✨ Features

- **🎯 Real-time Multiplayer** - Play with friends in real-time using Socket.io
- **👥 Game Modes** - 1v1 or 3-player matches
- **🏆 Leaderboards** - Compete globally across multiple categories
- **🏅 Achievements** - Unlock 20+ achievements as you play
- **📊 Statistics** - Track your wins, streaks, and progress
- **🔊 Sound & Haptics** - Immersive audio and tactile feedback
- **🌙 Dark Mode** - Beautiful dark and light themes
- **📱 Cross-Platform** - iOS, Android, and Web support

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [PocketBase](https://pocketbase.io/) server
- iOS Simulator / Android Emulator / Physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dots-and-boxes-game.git
   cd dots-and-boxes-game
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in root
   EXPO_PUBLIC_POCKETBASE_URL=http://localhost:8090
   EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

4. **Set up PocketBase**
   - Download PocketBase from [pocketbase.io](https://pocketbase.io/)
   - Run PocketBase: `./pocketbase serve`
   - Import the schema from `server/pocketbase/` (if available)
   - Or manually create collections as defined in `doc/final_design.md`

5. **Start the Socket.io server**
   ```bash
   cd server/socket-server
   bun install
   bun run dev
   ```

6. **Start the Expo app**
   ```bash
   # In the root directory
   bun start
   # or
   npx expo start
   ```

## 📁 Project Structure

```
dots-and-boxes-game/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/             # Auth screens (login, register)
│   │   ├── game/               # Game screens
│   │   ├── lobby/              # Room lobby
│   │   └── ...                 # Other screens
│   ├── components/
│   │   ├── game/               # Game-specific components
│   │   ├── ui/                 # Reusable UI components
│   │   └── ...
│   ├── contexts/               # React contexts (Auth, Socket, Game)
│   ├── services/
│   │   ├── pocketbase/         # PocketBase API services
│   │   ├── socket/             # Socket.io client service
│   │   └── game/               # Game logic
│   ├── types/                  # TypeScript type definitions
│   ├── constants/              # App constants & config
│   ├── utils/                  # Utility functions
│   └── assets/                 # Images, sounds, fonts
├── server/
│   ├── socket-server/          # Socket.io backend
│   └── pocketbase/             # PocketBase config
├── doc/                        # Design documents
└── ...
```

## 🎮 How to Play

1. **Create or Join a Room**
   - Create a new room and share the 6-character code
   - Or join an existing room using a code

2. **Wait for Players**
   - Wait in the lobby until all players join
   - Host can start the game when ready

3. **Take Turns**
   - Tap two adjacent dots to draw a line
   - Complete a box by drawing its fourth side
   - Completing a box earns you a point and another turn!

4. **Win the Game**
   - The player with the most completed boxes wins
   - All 64 boxes must be completed to end the game

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native | Mobile app framework |
| Expo | Development platform |
| Expo Router | File-based navigation |
| TypeScript | Type safety |
| NativeWind/Tailwind | Styling |
| Socket.io | Real-time communication |
| PocketBase | Backend (Auth, DB) |
| react-native-svg | Game board graphics |
| expo-av | Sound effects |
| expo-haptics | Haptic feedback |

## 📱 Running on Devices

### iOS Simulator
```bash
bun run ios
```

### Android Emulator
```bash
bun run android
```

### Web Browser
```bash
bun run web
```

### Physical Device
- Install **Expo Go** on your device
- Scan the QR code from the terminal

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_POCKETBASE_URL` | PocketBase server URL | `http://localhost:8090` |
| `EXPO_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:3000` |

### PocketBase Collections

Refer to `doc/final_design.md` for the complete PocketBase schema including:
- `users` - User accounts & profiles
- `rooms` - Game rooms
- `games` - Game history & replays
- `achievements` - Achievement definitions
- `user_achievements` - User progress
- `friends` - Friend relationships
- `game_invites` - Pending invitations

## 🧪 Testing

```bash
# Run unit tests
bun test

# Run linting
bun lint
```

## 📦 Building for Production

### Expo EAS Build
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Web Deployment
```bash
npx expo export -p web
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Game concept inspired by the classic Dots and Boxes paper game
- UI design inspired by modern mobile games
- Built with ❤️ using Expo and React Native

---

**Happy Gaming! 🎮**

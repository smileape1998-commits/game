import React from 'react';
import { useGameStore } from './state/gameStore';
import { MainMenuScreen } from './components/screens/MainMenuScreen';
import { AISetupScreen } from './components/screens/AISetupScreen';
import { LocalSetupScreen } from './components/screens/LocalSetupScreen';
import { OnlineMenuScreen } from './components/screens/OnlineMenuScreen';
import { OnlineLobbyScreen } from './components/screens/OnlineLobbyScreen';
import { GameplayScreen } from './components/screens/GameplayScreen';
import { RulesEditorModal } from './components/RulesEditorModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { CardSelectionModal } from './components/CardSelectionModal';

export const App: React.FC = () => {
  const {
    view,
    settings,
    setSettings,
    showRulesModal,
    setShowRulesModal,
    showHowToPlayModal,
    setShowHowToPlayModal,
    showCardSelectionModal,
    setShowCardSelectionModal,
    socket,
    roomInfo,
    activeViewerPlayerId
  } = useGameStore();

  const isHost = !roomInfo || roomInfo.hostId === activeViewerPlayerId;

  const handleSaveCardSelection = (newSettings: typeof settings) => {
    setSettings(newSettings);
    if (socket && roomInfo && isHost) {
      socket.emit('room:settings', newSettings);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Prompt',sans-serif]">
      {view === 'main_menu' && <MainMenuScreen />}
      {view === 'ai_setup' && <AISetupScreen />}
      {view === 'local_setup' && <LocalSetupScreen />}
      {view === 'online_menu' && <OnlineMenuScreen />}
      {view === 'online_lobby' && <OnlineLobbyScreen />}
      {view === 'gameplay' && <GameplayScreen />}

      {/* Global Card Selection Modal */}
      {showCardSelectionModal && (
        <CardSelectionModal
          settings={settings}
          onSave={handleSaveCardSelection}
          onClose={() => setShowCardSelectionModal(false)}
          isHost={isHost}
        />
      )}

      {/* Global Rules Modal */}
      {showRulesModal && (
        <RulesEditorModal
          currentSettings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Global How to Play Modal */}
      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}
    </div>
  );
};

export default App;

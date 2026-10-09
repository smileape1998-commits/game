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

export const App: React.FC = () => {
  const {
    view,
    settings,
    setSettings,
    showRulesModal,
    setShowRulesModal,
    showHowToPlayModal,
    setShowHowToPlayModal
  } = useGameStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Prompt',sans-serif]">
      {view === 'main_menu' && <MainMenuScreen />}
      {view === 'ai_setup' && <AISetupScreen />}
      {view === 'local_setup' && <LocalSetupScreen />}
      {view === 'online_menu' && <OnlineMenuScreen />}
      {view === 'online_lobby' && <OnlineLobbyScreen />}
      {view === 'gameplay' && <GameplayScreen />}

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

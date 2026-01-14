export const defaultBinds = $state({
    CANCEL_ACTION: 'escape',
    PLAYERS_MENU: 'a',
    SHOP_MENU: 'z',
    WAVE_MENU: 'e',
    READY: 'space',
    PLAYER1: '1',
    PLAYER2: '2',
    PLAYER3: '3',
    PLAYER4: '4',
    PLAYER5: '5',
    PLAYER6: '6',
    PLAYER7: '7',
    PLAYER8: '8',
});

const saved = localStorage.getItem('keybinds');
const initialBinds = saved ? JSON.parse(saved) : defaultBinds;

export const keybinds = $state(initialBinds);

export function updateKeybind(action: keyof typeof initialBinds, newKey: string) {
    keybinds[action] = newKey.toLowerCase();
    localStorage.setItem('keybinds', JSON.stringify($state.snapshot(keybinds)));
}
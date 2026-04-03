import { createContext, useContext } from 'react';
import { APP_THEME } from '../constants/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Providing a single global theme based on our constants file
    return (
        <ThemeContext.Provider value={{ theme: APP_THEME }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

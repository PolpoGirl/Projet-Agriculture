   import { createContext, useState, useContext, useEffect } from "react";

   const AuthContext = createContext<any>(null);

   const STORAGE_KEYS = {
     TOKEN: 'token',
     CURRENT_USER: 'currentUser',
   };

   const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);
   const getStoredUser = () => {
     const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
     return raw ? JSON.parse(raw) : null;
   };
   const clearStoredAuth = () => {
     localStorage.removeItem(STORAGE_KEYS.TOKEN);
     localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
   };

export const AuthProvider = ({ children }: any) => {
      const [user, setUser] = useState<any>(() => getStoredUser());
      const [token, setToken] = useState<string | null>(getStoredToken());6

      useEffect(() => {
        const storedToken = getStoredToken();
        if (storedToken && !token) {
          setToken(storedToken);
        }
      }, []);

     const login = async (username: string, password: string) => {
       // Authentification locale: admin:admin ou user:user
       if (username === 'admin' && password === 'admin') {
         const userData = {
           id: 1,
           username: 'admin',
           role: 'admin',
           email: 'admin@agrismart.com',
           first_name: 'Admin',
           last_name: 'System',
         };
         const mockToken = 'mock-token-admin-' + Date.now();
         localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
         localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
         setToken(mockToken);
         setUser(userData);
         return { success: true, user: userData };
       }

       if (username === 'user' && password === 'user') {
         const userData = {
           id: 2,
           username: 'user',
           role: 'user',
           email: 'user@agrismart.com',
           first_name: 'Jean',
           last_name: 'Dupont',
         };
         const mockToken = 'mock-token-user-' + Date.now();
         localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
         localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
         setToken(mockToken);
         setUser(userData);
         return { success: true, user: userData };
       }

       return {
         success: false,
         message: 'Identifiants incorrects. Utilisez admin:admin ou user:user',
       };
     };

     const logout = () => {
       clearStoredAuth();
       setToken(null);
       setUser(null);
     };

     return (
       <AuthContext.Provider
         value={{
           user,
           currentUser: user,
           token,
           login,
           logout,
           setUser,
           refreshUser: async () => {},
         }}
       >
         {children}
       </AuthContext.Provider>
     );
   };

  export const useAuth = () => useContext(AuthContext);

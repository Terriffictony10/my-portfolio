import React, { createContext, useContext, useState } from 'react';

const ProviderContext = createContext();

export const useProvider = () => useContext(ProviderContext);

export const ProviderContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      {children}
    </ProviderContext.Provider>
  );
};

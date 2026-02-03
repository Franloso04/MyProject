import { createContext, useState, useContext } from "react";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [evento, setEvento] = useState(null);

  return (
    <EventContext.Provider value={{ evento, setEvento }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvento = () => useContext(EventContext);

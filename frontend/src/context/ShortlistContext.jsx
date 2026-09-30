import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ShortlistContext = createContext();

export function ShortlistProvider({ children }) {
  const { user } = useAuth();
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [compareIds, setCompareIds] = useState([]);

  // Load shortlist on login
  useEffect(() => {
    if (user) {
      api.getShortlist()
        .then(data => {
          const ids = new Set(data.map(item => item.property_id));
          setShortlistedIds(ids);
        })
        .catch(err => console.log("Shortlist load:", err.message));
    } else {
      // Local fallback
      const saved = localStorage.getItem("local_shortlist");
      if (saved) {
        try { setShortlistedIds(new Set(JSON.parse(saved))); } catch(e){}
      }
    }
  }, [user]);

  const toggleShortlist = async (propertyId) => {
    const isSaved = shortlistedIds.has(propertyId);
    const updated = new Set(shortlistedIds);

    if (isSaved) {
      updated.delete(propertyId);
      setShortlistedIds(updated);
      if (user) {
        try { await api.removeFromShortlist(propertyId); } catch(e){}
      }
    } else {
      updated.add(propertyId);
      setShortlistedIds(updated);
      if (user) {
        try { await api.addToShortlist(propertyId); } catch(e){}
      }
    }
    localStorage.setItem("local_shortlist", JSON.stringify([...updated]));
  };

  const isShortlisted = (propertyId) => shortlistedIds.has(propertyId);

  const toggleCompare = (propertyId) => {
    if (compareIds.includes(propertyId)) {
      setCompareIds(compareIds.filter(id => id !== propertyId));
    } else {
      if (compareIds.length >= 4) {
        alert("You can compare a maximum of 4 properties side-by-side.");
        return;
      }
      setCompareIds([...compareIds, propertyId]);
    }
  };

  const clearCompare = () => setCompareIds([]);

  return (
    <ShortlistContext.Provider value={{
      shortlistedIds,
      toggleShortlist,
      isShortlisted,
      compareIds,
      toggleCompare,
      clearCompare
    }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  return useContext(ShortlistContext);
}

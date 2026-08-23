import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { activeUser, register, logout, login } = useAuth();

  return (
    <CustomerContext.Provider
      value={{
        activeCustomer: activeUser,
        customers: activeUser ? [activeUser] : [],
        selectCustomer: () => {},
        registerNewCustomer: register,
        refreshCustomers: () => {},
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    // Fallback to AuthContext if called directly
    const auth = useAuth();
    return {
      activeCustomer: auth.activeUser,
      customers: auth.activeUser ? [auth.activeUser] : [],
      selectCustomer: () => {},
      registerNewCustomer: auth.register,
      refreshCustomers: () => {},
    };
  }
  return context;
};

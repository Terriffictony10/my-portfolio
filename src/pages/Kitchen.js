// pages/Kitchen.js
import useSWR from 'swr';
import React from 'react';
import { useRouter } from 'next/router';
import { useAppKitAccount } from '@reown/appkit/react'

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Kitchen() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();

  // Fetch an ARRAY of kitchen tickets
  const { data: kitchenTickets, mutate } = useSWR('/api/kitchenTickets', fetcher);

  const handleGoBack = () => {
    router.push('/RestaurantDashboard');
  };

  const handleClearAllTickets = async () => {
    await fetch('/api/kitchenTickets', { method: 'DELETE' });
    mutate();
  };

  // While still loading...
  if (!kitchenTickets) {
    return (
      <div style={styles.mainContainer}>
        <h1 style={styles.title}>Kitchen Ticket Printer</h1>
        <p style={{ color: '#fff', textAlign: 'center' }}>Loading Kitchen Tickets...</p>
      </div>
    );
  }

  // If no tickets, we'll display "No tickets have been rung yet"
  const hasTickets = kitchenTickets.length > 0;

  return (
    <div style={styles.mainContainer}>
      <h1 style={styles.title}>Kitchen Ticket Printer</h1>

      {!hasTickets ? (
        <p style={{ color: '#fff', textAlign: 'center' }}>
          No tickets have been rung yet.
        </p>
      ) : (
        kitchenTickets.map((kitchenTicket) => {
          const { kitchenTicketId, posTicketId, posTicketName, items } = kitchenTicket;

          if (!items || items.length === 0) return null;

          return (
            <div key={kitchenTicketId} style={styles.ticketContainer}>
              <h2 style={{ color: '#fff' }}>Kitchen Ticket #{kitchenTicketId}</h2>
              <p style={{ color: '#fff' }}>
                POS Ticket ID: {posTicketId} <br />
                POS Ticket Name: {posTicketName}
              </p>

              {items.map((item, idx) => (
                <div key={idx} style={styles.itemBox}>
                  <strong>{item.name}</strong> — Cost: {item.cost} ETH
                </div>
              ))}
            </div>
          );
        })
      )}

      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <button style={styles.backButton} onClick={handleGoBack}>
          Go Back
        </button>

        <button style={styles.clearButton} onClick={handleClearAllTickets}>
          Clear All Tickets
        </button>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#001f3f',
    padding: '20px',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: '30px',
  },
  ticketContainer: {
    marginBottom: '30px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '15px',
  },
  itemBox: {
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '20px',
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#f39c12',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

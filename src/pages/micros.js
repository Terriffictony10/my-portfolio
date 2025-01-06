// pages/micros.js

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

// Interactions
import {
  loadMenuItemsForPOS,
  clearActiveTicket,
  loadFullTicketDetails,
  addTicketOrders
} from '../store/interactions';

// ABIs
import POS_ABI from '../abis/POS.json';

export default function Micros() {
  const dispatch = useDispatch();
  const router = useRouter();

  // The "activeTicket" we previously set in Redux
  // This ticket might only have partial info at first,
  // but loadFullTicketDetails will populate its orders.
  const activeTicket = useSelector((state) => state.DashboardRestaurant.activeTicket);

  // Local state for the POS's entire menu (to add new items if we want)
  const [posMenuItems, setPosMenuItems] = useState([]);

  // 1) If there's no activeTicket, redirect to /POSterminal
  useEffect(() => {
    if (!activeTicket) {
      router.replace('/POSterminal');
    }
  }, [activeTicket, router]);

  // 2) Once we know which ticket is active, load the FULL ticket (including orders)
  //    and the full POS menu for that ticket’s POS address.
  useEffect(() => {
    if (!activeTicket) return;

    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // 2a) Load the full ticket (with orders) from the contract
        await loadFullTicketDetails(
          provider,
          activeTicket.posAddress,
          POS_ABI,
          activeTicket.id,
          dispatch
        );

        // 2b) Also load the entire POS menu
        const items = await loadMenuItemsForPOS(
          provider,
          activeTicket.posAddress,
          POS_ABI.abi,
          dispatch
        );
        setPosMenuItems(items);
      } catch (error) {
        console.error('Error loading data for micros page:', error);
      }
    })();
  }, [activeTicket, dispatch]);

  // 3) If user wants to go back, we can clear the activeTicket
  //    from Redux so we don't mix up states next time.
  const handleGoBack = async () => {
    await clearActiveTicket(dispatch);
    router.push('/POSterminal');
  };

  // If we still have no ticket or it’s null, show a fallback
  if (!activeTicket) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>
        Redirecting to POS Terminal...
      </div>
    );
  }

  // 4) Gather the orders from activeTicket (populated in loadFullTicketDetails)
  const currentOrders = activeTicket.orders || [];
  const subtotal = currentOrders.reduce((acc, item) => acc + item.cost, 0);

  // Example: If you want to handle adding items to the ticket, you might do:
  // const handleAddItemToTicket = async (menuItem) => {
  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   await addTicketOrders(
  //     provider,
  //     activeTicket.posAddress,
  //     POS_ABI.abi,
  //     activeTicket.id,
  //     [{ cost: ethers.parseUnits(menuItem.cost.toString(), 'ether'), name: menuItem.name }],
  //     dispatch
  //   );
  //   // Then re-load the full ticket details to see the updated orders
  //   await loadFullTicketDetails(provider, activeTicket.posAddress, POS_ABI.abi, activeTicket.id, dispatch);
  // };

  return (
    <div
      className="BlueBackground"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        padding: '70px'
      }}
    >
      {/* Outer White Box */}
      <div
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid white',
          borderRadius: '10px',
          padding: '20px',
          overflow: 'auto'
        }}
      >
        <h1 style={{ color: '#fff', textAlign: 'center' }}>Micros System</h1>
        <h2 style={{ color: '#fff', textAlign: 'center' }}>
          Ticket: {activeTicket.name} (ID: {activeTicket.id})
        </h2>
        <p style={{ color: '#fff', textAlign: 'center' }}>
          POS Address: {activeTicket.posAddress}
          <br />
          Paid: {activeTicket.paid ? 'Yes' : 'No'}
        </p>

        <hr style={{ borderColor: '#fff' }} />

        {/* SECTION A: Display the POS Menu */}
        <h3 style={{ color: '#fff', textAlign: 'center' }}>POS Menu</h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginTop: '20px'
          }}
        >
          {posMenuItems.map((menuItem) => (
            <button
              key={menuItem.id}
              style={{
                border: '1px solid #ccc',
                backgroundColor: '#17a2b8',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  await addTicketOrders(
    provider,
    activeTicket.posAddress,
    POS_ABI,
    activeTicket.id,
    [
      {
        cost: ethers.parseUnits(menuItem.cost.toString(), 'ether'),
        name: menuItem.name
      }
    ],
    dispatch
  );
}}
            >
              {menuItem.name} <br />
              ${menuItem.cost}
            </button>
          ))}
        </div>

        <hr style={{ borderColor: '#fff', marginTop: '40px' }} />

        {/* SECTION B: Display the Current Ticket’s Items (the Check) */}
        <div style={{ maxWidth: '500px', margin: '20px auto' }}>
          <h3 style={{ color: '#fff', textAlign: 'center' }}>
            Items in This Ticket
          </h3>
          {currentOrders.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {currentOrders.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #fff'
                  }}
                >
                  <span style={{ color: '#fff' }}>{item.name}</span>
                  <span style={{ color: '#fff' }}>
                    ${item.cost.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#fff', textAlign: 'center' }}>No items yet.</p>
          )}

          {/* Subtotal */}
          <hr style={{ borderColor: '#fff' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ color: '#fff' }}>Subtotal:</strong>
            <span style={{ color: '#fff' }}>${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={handleGoBack}
            style={{
              padding: '10px 20px',
              backgroundColor: 'red',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

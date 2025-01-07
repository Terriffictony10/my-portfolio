// pages/micros.js

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

// Interactions
import {
  loadFullTicketDetails,
  loadMenuItemsForPOS,
  bufferItemForTicket,
  ringBufferedItems,
  clearActiveTicket
} from '../store/interactions';

// ABIs
import POS_ABI from '../abis/POS.json';

export default function Micros() {
  const dispatch = useDispatch();
  const router = useRouter();

  const activeTicket = useSelector((state) => state.DashboardRestaurant.activeTicket);

  // We’ll read from Redux the array of pending items for this ticket
  const pendingOrderBuffer = useSelector(
  (state) => state.DashboardRestaurant.pendingOrderBuffer
) || {};

const ticketStringId = activeTicket ? activeTicket.id.toString() : null;
const currentPendingItems = ticketStringId
  ? pendingOrderBuffer[ticketStringId] || []
  : [];

  // Local state for the POS menu
  const [posMenuItems, setPosMenuItems] = useState([]);

  // Local state to track if we’re in the middle of a ring transaction
  const [ringInProgress, setRingInProgress] = useState(false);

  // 1) If there's no activeTicket, redirect to /POSterminal
  useEffect(() => {
    if (!activeTicket) {
      router.replace('/POSterminal');
    }
  }, [activeTicket, router]);

  // 2) Load full ticket + menu
  useEffect(() => {
    if (!activeTicket) return;

    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Load the full ticket details:
        await loadFullTicketDetails(
          provider,
          activeTicket.posAddress,
          POS_ABI,
          activeTicket.id,
          dispatch
        )

        // Load the menu for the given POS
        const items = await loadMenuItemsForPOS(
          provider,
          activeTicket.posAddress,
          POS_ABI,
          dispatch
        );
        setPosMenuItems(items);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    })();
  }, [activeTicket, dispatch]);

  // 3) If user wants to go back
  const handleGoBack = async () => {
    await clearActiveTicket(dispatch);
    router.push('/POSterminal');
  };

  // Helper to sum up the rung items (on the left)
  const rungOrders = activeTicket?.orders || [];
  const rungSubtotal = rungOrders.reduce((acc, item) => acc + item.cost, 0);

  // Helper to sum up the *pending* items (on the right)
  let pendingSubtotal = 0;
for (let i = 0; i < currentPendingItems.length; i++) {
  pendingSubtotal += currentPendingItems[i].cost;
}

  // For adding an item to the “pending” list
  const handleAddItemToBuffer = (menuItem) => {
    dispatch(bufferItemForTicket(activeTicket.id, menuItem));
  };

  // For “ringing” all items that are in the buffer:
  const handleRing = async () => {
  try {
    setRingInProgress(true);
    const provider = new ethers.BrowserProvider(window.ethereum);

    // 1) ring in the items => dispatch ORDER_RING_SUCCESS => merges items
    await ringBufferedItems(
      provider,
      activeTicket.posAddress,
      pendingOrderBuffer,
      POS_ABI,
      activeTicket.id,
      dispatch,
      () => ({ DashboardRestaurant: { pendingOrderBuffer } })
    );

    // 2) Optionally reload the chain data, though the reducer has already updated
    await loadFullTicketDetails(
      provider,
      activeTicket.posAddress,
      POS_ABI,
      activeTicket.id,
      dispatch
    );
  } catch (error) {
    console.error('Error ringing items:', error);
  } finally {
    setRingInProgress(false);
  }
};

  if (!activeTicket) {
    return <div style={{ color: '#fff', textAlign: 'center' }}>Redirecting...</div>;
  }

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
      <div
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.1)',
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

        {/* SECTION A: The POS Menu (but we are not ringing them instantly) */}
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
              onClick={() => handleAddItemToBuffer(menuItem)}
            >
              {menuItem.name} <br />
              ${menuItem.cost}
            </button>
          ))}
        </div>

        <hr style={{ borderColor: '#fff', marginTop: '40px' }} />

        {/* SECTION B1: Display RUNG items (already on-chain) */}
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {/* LEFT half: rung items */}
          <div style={{ width: '45%' }}>
            <h3 style={{ color: '#fff', textAlign: 'center' }}>Rung Items</h3>
            {rungOrders.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {rungOrders.map((item, idx) => (
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
              <p style={{ color: '#fff', textAlign: 'center' }}>
                No rung items yet.
              </p>
            )}
            <hr style={{ borderColor: '#fff' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#fff' }}>Subtotal:</strong>
              <span style={{ color: '#fff' }}>${rungSubtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* RIGHT half: pending items */}
          <div style={{ width: '45%' }}>
            <h3 style={{ color: '#fff', textAlign: 'center' }}>Pending (Not Rung)</h3>
            {currentPendingItems.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {currentPendingItems.map((item, idx) => (
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
                    <span style={{ color: '#fff' }}>${item.cost.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#fff', textAlign: 'center' }}>No pending items.</p>
            )}
            <hr style={{ borderColor: '#fff' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#fff' }}>Pending Subtotal:</strong>
              <span style={{ color: '#fff' }}>${pendingSubtotal.toFixed(2)}</span>
            </div>

            {/* The RING button */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleRing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'green',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
                disabled={ringInProgress} // disable if transaction is in progress
              >
                {ringInProgress ? 'Ringing...' : 'Ring'}
              </button>
              {ringInProgress && (
                <p style={{ color: '#fff', marginTop: '10px' }}>
                  Please wait, ringing items...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer / Back button */}
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

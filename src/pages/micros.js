import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';

import Modal from 'react-modal';
import { QRCodeSVG } from 'qrcode.react'; // Using the named import for an SVG

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

import wagmi from "../context/appkit/index.tsx";
import { useAppKitAccount } from '@reown/appkit/react';
import { Configure, useClient, useConnectorClient } from 'wagmi';

export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  // Use the RPC URL provided by the transport.
  // (Make sure your configuration passes a valid URL instead of defaulting to localhost)
  return new ethers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId } = {}) {
  const client = useClient({ chainId });
  return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
}
export function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts && chain.contracts.ensRegistry ? chain.contracts.ensRegistry.address : undefined,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

export default function Micros() {

  const { address, isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const dispatch = useDispatch();
  const router = useRouter();

  const activeTicket = useSelector((state) => state.DashboardRestaurant.activeTicket);
  const kitchenTickets = useSelector((state) => state.DashboardRestaurant.kitchenTickets);
  const pendingOrderBuffer = useSelector(
    (state) => state.DashboardRestaurant.pendingOrderBuffer
  ) || {};

  // For referencing pending items
  const ticketStringId = activeTicket ? activeTicket.id.toString() : null;
  const currentPendingItems = ticketStringId
    ? pendingOrderBuffer[ticketStringId] || []
    : [];

  // Local states
  const [posMenuItems, setPosMenuItems] = useState([]);
  const [ringInProgress, setRingInProgress] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // 1) If there's no activeTicket, go back to /POSterminal
  

  // 2) Load the ticket + menu
  useEffect(() => {
    

    (async () => {
      try {
        const { provider, address} = await ethersSigner;

        // Load the full ticket details:
        await loadFullTicketDetails(
          ethersSigner,
          activeTicket.posAddress,
          POS_ABI,
          activeTicket.id,
          dispatch
        );

        // Load the menu
        const items = await loadMenuItemsForPOS(
          ethersSigner,
          activeTicket.posAddress,
          POS_ABI,
          dispatch
        );
        setPosMenuItems(items);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    })();
  }, [ kitchenTickets, dispatch, ethersSigner, isConnected]);

  // 3) Go back handler
  const handleGoBack = async () => {
    await clearActiveTicket(dispatch);
    router.push('/POSterminal');
  };

  // Summation of rung items
  const rungOrders = activeTicket?.orders || [];
  const rungSubtotal = rungOrders.reduce((acc, item) => acc + item.cost, 0);

  // Summation of pending items
  let pendingSubtotal = 0;
  for (let i = 0; i < currentPendingItems.length; i++) {
    pendingSubtotal += currentPendingItems[i].cost;
  }

  // Add item to buffer
  const handleAddItemToBuffer = (menuItem) => {
    dispatch(bufferItemForTicket(activeTicket.id, menuItem));
  };

  // RING the buffered items
  const handleRing = async () => {
    try {
      setRingInProgress(true);
      

      // 1) "Ring" on chain
      await ringBufferedItems(
        ethersSigner,
        activeTicket.posAddress,
        pendingOrderBuffer,
        POS_ABI,
        activeTicket.id,
        dispatch,
        () => ({ DashboardRestaurant: { pendingOrderBuffer } })
      );

      // 2) POST to Next.js (kitchenTickets)
      const itemsToRing = currentPendingItems;
      if (itemsToRing.length > 0) {
        await fetch('/api/kitchenTickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            posTicketId: activeTicket.id.toString(),
            posTicketName: activeTicket.name,
            items: itemsToRing,
          }),
        });
      }

      // 3) Clear local buffer
      dispatch({
        type: 'CLEAR_PENDING_BUFFER',
        payload: { ticketId: activeTicket.id },
      });

      // 4) Reload the chain data
      await loadFullTicketDetails(
        ethersSigner,
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

  // Payment link for scanning or direct navigation
  const payUrl = activeTicket
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/pay?posAddress=${activeTicket.posAddress}&ticketId=${activeTicket.id}`
    : '';

  // Modal toggles
  const handleOpenPayModal = () => setIsPayModalOpen(true);
  const handleClosePayModal = () => setIsPayModalOpen(false);

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

        {/* SECTION A: POS Menu */}
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

        {/* SECTION B: Rung items vs. Pending items */}
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {/* LEFT: Rung items */}
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

          {/* RIGHT: Pending items */}
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
                disabled={ringInProgress}
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

        <hr style={{ borderColor: '#fff', marginTop: '40px' }} />

        {/* Pay Ticket Button */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleOpenPayModal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Pay Ticket
          </button>
        </div>

        {/* Pay Modal with QR Code */}
        <Modal
          isOpen={isPayModalOpen}
          onRequestClose={handleClosePayModal}
          contentLabel="Pay Ticket Modal"
          style={{
            content: {
              maxWidth: '400px',
              margin: 'auto',
              height: 'auto',
              textAlign: 'center'
            }
          }}
        >
          <h2>Scan to Pay</h2>
          <p>Use your mobile device to scan and pay this ticket:</p>
          {/* Render the QR code */}
          {payUrl && <QRCodeSVG value={payUrl} size={256} />}

          {/* 
            NEW BUTTON: This will navigate the user directly
            to the pay page, skipping scanning the QR code. 
          */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleClosePayModal}
              style={{
                padding: '8px 16px',
                backgroundColor: 'red',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <button
              onClick={() => router.push("./pay")}
              style={{
                padding: '8px 16px',
                backgroundColor: 'green',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Pay Page
            </button>
          </div>
        </Modal>

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

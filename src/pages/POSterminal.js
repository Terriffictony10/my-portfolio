// pages/POSterminal.js

import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Modal } from 'react-bootstrap'; // If you have bootstrap
import { useRouter } from 'next/router';
import { useProvider } from '../context/ProviderContext';
import Image from 'next/image';

// Import our new interactions
import { 
  createTicketForPOS, 
  loadAllTicketsForPOS 
} from '../store/interactions';

import POS_ABI from '../abis/POS.json';  // If you need the ABI locally for reference

export default function POSterminal() {
  
  const { provider, setProvider } = useProvider();
  const router = useRouter();
  const dispatch = useDispatch();

  // Grab the POS array from Redux
  const posArray = useSelector((state) => state.DashboardRestaurant.currentRelevantPOS);
  // Grab all tickets from Redux
  const allTickets = useSelector(
  (state) => state.DashboardRestaurant.allTickets?.data || []
)



  // Local states
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketName, setNewTicketName] = useState('');

  // This is your currently logged in user's address (server). 
  // If you store it in Redux, fetch it from state, or set it in context, etc.
  // For example:
  const account = useSelector((state) => state.provider.account); 
  // Or get it from wherever you're storing the user’s address.

  // If you have a provider in Redux:
  

  /**
   * Load tickets for each POS in posArray
   */
  useEffect(() => {
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    const loadTickets = async () => {
      // if (!provider || !posArray || posArray.length === 0) return;
      for (let pos of posArray) {
        
        await loadAllTicketsForPOS(ethersProvider, pos.address, POS_ABI.abi, dispatch);
      }
    };
    loadTickets();
  }, [posArray]);

  /**
   * Handler for creating a new ticket
   */
  const handleCreateTicket = async () => {

    // For example, we create the ticket on the first POS in the array. 
    // Or you could let the user select which POS to create it on.
    const posToUse = posArray[0]; 
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    try {
      await createTicketForPOS(
        ethersProvider, 
        posToUse.address, 
        POS_ABI, 
        newTicketName, 
        account,   // server address 
        dispatch
      );
      setShowNewTicketModal(false);
      setNewTicketName('');
    } catch (error) {
      console.error('Ticket creation failed:', error);
    }
  };

  return (
    <div className="BlueBackground" style={{ width: '100%', height: '100vh', position: 'relative' }}>
      
      {/* Logo to go back home */}
      <div
        width={250}
        height={250}
        onClick={() => router.push('/')}
        style={{ position: 'absolute', top: 0, left: 0, cursor: 'pointer' }}
      >
        <Image
          src="/Decentralized.png"
          alt="Decentralized Image"
          width={250}
          height={250}
          priority={true}
          style={{ position: 'relative', top: 0, left: 0 }}
        />
      </div>

      {/* Centered Box */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid white',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          minWidth: '300px'
        }}
      >
        <h2 style={{ color: 'white', marginBottom: '20px' }}>POS Terminal</h2>

        <h4 style={{ color: 'white' }}>Active POS Systems for your Restaurant:</h4>
        {posArray && posArray.length > 0 ? posArray.map((pos, index) => (
          <div key={index} style={{ color: '#fff', marginTop: '10px' }}>
            POS {pos.id}: {pos.name} ({pos.address})
          </div>
        )) : (
          <p style={{ color: '#fff', fontSize: '16px' }}>No POS systems found.</p>
        )}

        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: 'white' }}>Open Tickets:</h4>
          {allTickets && allTickets.length > 0 ? (
            allTickets.map((ticket) => (
              <div 
                key={`${ticket.posAddress}-${ticket.id}`} 
                style={{ display: 'inline-block', margin: '10px' }}
              >
                {/* Example icon for each ticket */}
                <Image 
                  src="/ticket-icon.png" 
                  alt="Ticket Icon" 
                  width={40} 
                  height={40} 
                  style={{ display: 'block', margin: '0 auto 5px auto' }}
                />
                <button
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    backgroundColor: ticket.paid ? '#6c757d' : '#17a2b8',
                    color: '#fff',
                    border: 'none'
                  }}
                  // On click, maybe navigate to a page to view ticket details
                  onClick={() => console.log(`Clicked on ticket #${ticket.id}`)}
                >
                  {ticket.name} <br />
                  (POS: {ticket.posAddress.slice(0,6)}...)
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: '#fff', fontSize: '16px' }}>No open tickets.</p>
          )}
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none'
          }}
        >
          New Ticket
        </button>
      </div>

      {/* New Ticket Modal */}
      <Modal show={showNewTicketModal} onHide={() => setShowNewTicketModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Ticket Name"
            value={newTicketName}
            onChange={(e) => setNewTicketName(e.target.value)}
            style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
          />
          {/* Additional fields if necessary */}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setShowNewTicketModal(false)}>Cancel</button>
          <button onClick={handleCreateTicket}>Create Ticket</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

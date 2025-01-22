// pages/api/kitchenTickets.js

let kitchenTicketsInMemory = [];
let nextKitchenTicketId = 1; // We'll auto-increment this for each new kitchen ticket

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return the entire array of kitchen tickets
    return res.status(200).json(kitchenTicketsInMemory);
  }

  if (req.method === 'POST') {
    // Expect something like:
    // {
    //   posTicketId: '1',
    //   posTicketName: 'MyTicket',
    //   items: [{ name: 'Salad', cost: 1.2 }, ...]
    // }
    const { posTicketId, posTicketName, items } = req.body;
    if (!posTicketId || !items) {
      return res.status(400).json({ error: 'Missing posTicketId or items' });
    }

    // Create a new "kitchen ticket" record
    const newKitchenTicket = {
      kitchenTicketId: nextKitchenTicketId,
      posTicketId,
      posTicketName,
      items,
      timestamp: Date.now(),
    };
    nextKitchenTicketId++;

    // Push to in-memory array
    kitchenTicketsInMemory.push(newKitchenTicket);

    return res.status(200).json({
      success: true,
      kitchenTicket: newKitchenTicket,
      allKitchenTickets: kitchenTicketsInMemory,
    });
  }

  if (req.method === 'DELETE') {
    // If called without query params => clear everything
    // Could also do `?kitchenTicketId=123` to delete just one
    const { kitchenTicketId } = req.query;
    if (kitchenTicketId) {
      kitchenTicketsInMemory = kitchenTicketsInMemory.filter(
        (ticket) => ticket.kitchenTicketId.toString() !== kitchenTicketId
      );
    } else {
      // Clear everything
      kitchenTicketsInMemory = [];
      nextKitchenTicketId = 1;
    }
    return res.status(200).json({
      success: true,
      allKitchenTickets: kitchenTicketsInMemory,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

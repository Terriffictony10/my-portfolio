import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

// In-memory refund data storage for demonstration.
let refundRecords = [];

/**
 * Expected refund record format:
 * {
 *   address: "0x...",        // buyer's address (lowercase)
 *   contribution: "1000000000000000000", // contribution in wei (as string)
 *   tokensBought: "1000000000000000000", // tokens bought (as string)
 *   proof: [ "0x...", "0x...", ... ]
 * }
 */

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(refundRecords);
  } else if (req.method === 'POST') {
    const { address, contribution, tokensBought, proof } = req.body;
    if (!address || !contribution || !tokensBought || !proof) {
      return res.status(400).json({ error: 'Missing refund data fields' });
    }
    const lowerCaseAddress = address.toLowerCase();
    const exists = refundRecords.find((r) => r.address === lowerCaseAddress);
    if (!exists) {
      refundRecords.push({
        address: lowerCaseAddress,
        contribution,
        tokensBought,
        proof
      });
      return res.status(200).json({ message: 'Refund data recorded' });
    } else {
      return res.status(200).json({ message: 'Refund data already exists' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

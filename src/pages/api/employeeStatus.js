// pages/api/employeeStatus.js
import { ethers } from 'ethers';

// Change to your real read-only RPC, e.g. local Hardhat at http://127.0.0.1:8545
// or a public testnet node (Infura, Alchemy, etc.)
const READ_ONLY_RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/bql2av9VfQgvrsog9dCYuLXajvw3bKje';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { userAddress, contractAddress, abi } = req.body;
    if (!userAddress || !contractAddress || !abi) {
      return res
        .status(400)
        .json({ error: 'Missing userAddress, contractAddress, or abi.' });
    }

    // Create a read-only provider
    const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
    const restaurantContract = new ethers.Contract(contractAddress, abi, provider);

    // Get all employee IDs
    const employeeIds = await restaurantContract.getEmployeeIds();

    // Track which employee ID belongs to this user, if any
    let foundEmployeeId = null;
    let foundClockStamp = null;

    for (let i = 0; i < employeeIds.length; i++) {
      const idBN = employeeIds[i]; // BigInt
      const empStruct = await restaurantContract.employees(idBN);

      if (empStruct.employeeAddress.toLowerCase() === userAddress.toLowerCase()) {
        foundEmployeeId = idBN.toString();
        foundClockStamp = empStruct.clockStamp; // BigInt
        break;
      }
    }

    if (!foundEmployeeId) {
      // Not an employee
      return res.status(200).json({
        isClockedIn: false,
        clockInTime: null,
        message: 'No employee record found.'
      });
    }

    // If clockStamp === 0, not clocked in
    const clockStampNum = Number(foundClockStamp);
    if (clockStampNum === 0) {
      return res.status(200).json({
        isClockedIn: false,
        clockInTime: null,
        message: `Employee ${foundEmployeeId} is currently clocked out.`
      });
    }

    // They are clocked in! Calculate how long they've been in so far
    const latestBlock = await provider.getBlock('latest');
    const now = latestBlock.timestamp; // current block's timestamp
    const shiftSeconds = now - clockStampNum;

    return res.status(200).json({
      isClockedIn: true,
      clockInTime: clockStampNum,  // We'll let the client offset to local time
      shiftSeconds,
      message: `Employee ${foundEmployeeId} is clocked in.`
    });
  } catch (error) {
    console.error('Error in /api/employeeStatus:', error);
    res.status(500).json({ error: error.message });
  }
}

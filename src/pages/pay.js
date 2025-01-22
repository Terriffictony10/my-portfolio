// pages/pay.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import POS_ABI from '../abis/POS.json';
import { useSelector, useDispatch } from 'react-redux';
export default function PayPage() {
  const router = useRouter();
  const  posAddress = useSelector((state) => state.DashboardRestaurant.currentRelevantPOS[0].address);
  const ticketId =  useSelector((state) => state.DashboardRestaurant.activeTicket.id);

  useEffect(() => {
    

    const payTicket = async () => {
      try {
        
        // 1) Connect to blockchain
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // 2) Load POS contract
        const posContract = new ethers.Contract(posAddress, POS_ABI, signer);

        // 3) Fetch the ticket to sum up costs in Wei
        
        const ticketStruct = await posContract.getTicket(ticketId);
        let totalCost = 0
        console.log(posAddress)
        for (let i = 0; i < ticketStruct.orders.length; i++) {
          totalCost = totalCost + Number(ticketStruct.orders[i].cost);
        }

        // 4) Call payTicket, passing in the signer’s address & totalCost as msg.value
        const userAddress = await signer.getAddress();
        const tx = await posContract.payTicket(ticketId, userAddress, { value: BigInt(totalCost) });
        await tx.wait();

        // 5) Once confirmed, redirect back to /POSterminal
        router.replace('/POSterminal');
      } catch (error) {
        console.error('Payment failed:', error);
        // You could optionally redirect them back anyway or show an error page
        // router.replace('/POSterminal');
      }
    };

    payTicket();
  }, [router, posAddress, ticketId]);

  // No UI at all
  return null;
}

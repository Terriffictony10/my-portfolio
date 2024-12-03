import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';

const Buy = ({ provider, price, crowdsale, setIsLoading }) => {
    const [amount, setAmount] = useState('0');
    const [isWaiting, setIsWaiting] = useState(false);

    const buyHandler = async (e) => {
        e.preventDefault();
        setIsWaiting(true);

        try {
            const signer = await provider.getSigner();

            // We need to calculate the required ETH in order to buy the tokens...
            const value = ethers.parseUnits((amount * price).toString(), 'ether');
            const formattedAmount = ethers.parseUnits(amount.toString(), 'ether');

            const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, { value: value });
            await transaction.wait();
        } catch {
            window.alert('User rejected or transaction reverted');
        }

        setIsLoading(true);
        setIsWaiting(false); // Reset isWaiting after the transaction
    };

    return (
        <Form onSubmit={buyHandler}>
            <Form.Group as={Row}>
                <Col>
                    <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </Col>
                <Col>
                    {isWaiting ? (
                        <Spinner animation="border" />
                    ) : (
                        <button type="submit">Buy Tokens</button>
                    )}
                </Col>
            </Form.Group>
        </Form>
    );
};

export default Buy;

const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Decentratality', () => {
  let decentratality, accounts, deployer, receiver, exchange

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Decentratality')
    decentratality = await Token.deploy()

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
    exchange = accounts[2]
    user1 = accounts[3]
  })

  describe('Deployment', () => {
    

  
  describe('Restaurant Creation', () => {
    let restaurantAddress, restaurantId;
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await decentratality.createRestaurant('Montecito', ether(100), { value: ether(100) })
        result = await transaction.wait()

        
        const event = result.logs.find(log => 
                log.topics[0] === ethers.id("RestaurantCreated(address,uint256)")
            );

            const decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'uint256'], 
                event.data
            );

            restaurantAddress = decodedEvent[0];
            restaurantId = decodedEvent[1]; // Get the restaurant address from the decoded event // Log the address
      })
      it('creates the restaurant and stores it in the restaurants mapping properly', async() => {
        const restaurantContract = await decentratality.restaurants(restaurantId);
        expect(restaurantContract).to.equal(restaurantAddress);
      })
       it('ensures the restaurant has received the starting cash in Ether', async () => {
        // Get the balance of the restaurant contract
        const restaurantBalance = await ethers.provider.getBalance(restaurantAddress);

        // Check that the balance equals 100 ether
        expect(restaurantBalance).to.equal(ether(100));
    });

       it('emits the fundsAdded event with correct arguments', async () => {
            // Ensure the fundsAdded event is emitted with the correct arguments
            await expect(transaction)
                .to.emit(decentratality, 'fundsAdded')
                .withArgs(restaurantAddress, restaurantId, (await ethers.provider.getBlock(result.blockNumber)).timestamp);
        });

    })

    describe('Failure', async () => {
      it('rejects restaurant creation by non-token holders', async () => {
            // Transfer all tokens from user1 to deployer to ensure user1 has no tokens
            await decentratality.connect(user1).transfer(deployer.address, await decentratality.balanceOf(user1.address));

            // Try to create a restaurant with user1 (who now has no tokens)
            await expect(
                decentratality.connect(user1).createRestaurant('Santa Barbara', ether(100), { value: ether(100) })
            ).to.be.revertedWith('must be token holder');
        });
    })

  })

})})
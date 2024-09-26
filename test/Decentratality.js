const { expect } = require('chai');
const { ethers } = require('hardhat');

const restaurantABI = require('../src/abis/Restaurant.json').abi;

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
};

const ether = tokens;

describe('Decentratality', () => {
  let decentratality,
    accounts,
    deployer,
    receiver,
    exchange,
    decentratalityServiceFactory,
    user1,
    restaurant,
    customer,
    restaurantDeployer,
    posDeployer;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Decentratality');
    decentratality = await Token.deploy();

    const POSDeployer = await ethers.getContractFactory('POSDeployer');
    posDeployer = await POSDeployer.deploy();

    const RestaurantDeployer = await ethers.getContractFactory('RestaurantDeployer');
    restaurantDeployer = await RestaurantDeployer.deploy();

    const Factory = await ethers.getContractFactory('decentratalityServiceFactory');

    const decentratalityAddress = await decentratality.getAddress();
    const restaurantDeployerAddress = await restaurantDeployer.getAddress();
    const posDeployerAddress = await posDeployer.getAddress();

    decentratalityServiceFactory = await Factory.deploy(
      decentratalityAddress,
      restaurantDeployerAddress,
      posDeployerAddress
    );

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
    user1 = accounts[3];
    customer = accounts[4];
  });

  describe('Deployment', () => {
    

  
    describe('Restaurant Creation', () => {
    let restaurantAddress, restaurantId;
    describe('Success', () => {
      beforeEach(async () => {
        transaction  = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) })
        result = await transaction.wait()

        
         // Access the event data
        const blockNumber = result.blockNumber;

        const events = await decentratalityServiceFactory.queryFilter(
          decentratalityServiceFactory.filters.RestaurantCreated(),
          blockNumber,
          blockNumber
        );

        if (events.length === 0) {
          throw new Error('RestaurantCreated event not found');
        }

        const event = events[0];
        const { restaurant: restaurantAddr, id, owner } = event.args;
        restaurant = restaurantAddr;
        restaurantId = id;
        restaurantOwner = owner;
            
      })
      it('creates the restaurant and stores it in the restaurants mapping properly', async() => {
        const address1 = await decentratalityServiceFactory.restaurants(restaurantId)
        expect(address1).to.equal(restaurant);
      })
       it('ensures the restaurant has received the starting cash in Ether', async () => {
        // Get the balance of the restaurant contract
        const restaurantBalance = await ethers.provider.getBalance(restaurant);

        // Check that the balance equals 100 ether
        expect(restaurantBalance).to.equal(ether(100));
    });

       it('emits the fundsAdded event with correct arguments', async () => {
            // Ensure the fundsAdded event is emitted with the correct arguments
            await expect(transaction)
                .to.emit(decentratalityServiceFactory, 'FundsAdded')
                .withArgs(restaurant, restaurantId, (await ethers.provider.getBlock(result.blockNumber)).timestamp);
        });

    })

    describe('Failure', () => {
      beforeEach(async () => {
         await decentratalityServiceFactory.connect(deployer).transfer(deployer.address, await decentratalityServiceFactory.balanceOf(user1.address));
      })
     
      it('rejects restaurant creation by non-token holders', async () => {
           // Try to create a restaurant with user1 (who now has no tokens)
          await expect(
                decentratalityServiceFactory.connect(user1).createRestaurant('Santa Barbara', ether(100), { value: ether(100) })
           ).to.be.revertedWith('must be token holder');
      });
    })

    })

    describe('Restaurant Job and Employee Management', () => {
    let restaurant, restaurantId, transaction, transaction2, result, restaurantContract, jobId, job, timestamp;
    const employeeName = "John Doe";
    const hourlyWage = 2000000000000000; // Example: $20.00/hour in cents

    describe('Success', () => {
      
      beforeEach(async () => {
    transaction  = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) });
    result = await transaction.wait();

    const blockNumber = result.blockNumber;

    // Retrieve the RestaurantCreated event
    const events = await decentratalityServiceFactory.queryFilter(
      decentratalityServiceFactory.filters.RestaurantCreated(),
      blockNumber,
      blockNumber
    );

    if (events.length === 0) {
      throw new Error('RestaurantCreated event not found');
    }

    const event = events[0];
    ({ restaurant: restaurantAddr, id: restaurantId, owner: restaurantOwner } = event.args);
    restaurant = restaurantAddr;

    // Initialize the restaurant contract instance
    restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

    // Add a job
    transaction2 = await restaurantContract.addJob(hourlyWage, 'Chef');
    const receipt2 = await transaction2.wait();
    const blockNumber2 = receipt2.blockNumber;

    // Retrieve the JobAdded event
    const jobEvents = await restaurantContract.queryFilter(
      restaurantContract.filters.JobAdded(),
      blockNumber2,
      blockNumber2
    );

    if (jobEvents.length === 0) {
      throw new Error('JobAdded event not found');
    }

    const jobEvent = jobEvents[0];
    ({ id: jobId, timestamp: Timestamp, job: jobStruct } = jobEvent.args);
    job = jobStruct;
    timestamp = Timestamp
});

      it('adds a job and stores it in the jobs mapping', async () => {
         const functionData = restaurantContract.interface.encodeFunctionData('jobs', [jobId]);

    const data = await ethers.provider.call({
        to: await restaurantContract.getAddress(),
        data: functionData,
    });

    const outputTypes = ['uint256', 'string'];

    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(outputTypes, data);

    const [hourlyWageInWei, jobName] = decoded;

    expect(jobName).to.equal('Chef');
    expect(hourlyWageInWei).to.equal(hourlyWage);
      });

      it('emits the JobAdded event with correct arguments', async () => {
         await expect(transaction2)
    .to.emit(restaurantContract, 'JobAdded')
    .withArgs(
      jobId,
      timestamp, // Use anyValue for the timestamp since it's non-deterministic
      // We can't compare structs directly, so we'll check the arguments manually
      // You can pass a function to compare the struct
      (jobStruct) => {
        expect(jobStruct[0]).to.equal(hourlyWage);
        expect(jobStruct[1]).to.equal('Chef');
        return true;
      }
    );
      });

     describe('Hiring Employee', () => {
    let hireTransaction, hireResult, employeeAddress, employeeId;

    beforeEach(async () => {
        employeeAddress = user1.address;

        restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

        hireTransaction = await restaurantContract.hireEmployee(jobId, employeeName, employeeAddress);
        await restaurantContract.hireEmployee(jobId, 'server 1', accounts[7].address);
        await restaurantContract.hireEmployee(jobId, 'server 2', accounts[8].address);
        hireResult = await hireTransaction.wait();

        // Log the raw logs to debug

        // Find the EmployeeHired event in the logs (v6 uses ethers.EventLog)
        const employeeEvent = hireResult.logs.find(log => log.fragment.name === "EmployeeHired");

        if (!employeeEvent) {
            throw new Error('EmployeeHired event not found in logs');
        }

        // Decode the EmployeeHired event data (v6 handles fragment-based decoding)
        const decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
            ['uint256', 'uint256', 'tuple(uint256,string,address,uint256,uint256)'], 
            employeeEvent.data
        );

        // Extract the employeeId from the decoded event
        employeeId = decodedEvent[0];
    });

    it('stores the employee in the employees mapping', async () => {
        const employee = await restaurantContract.employees(employeeId);
        expect(employee.name).to.equal(employeeName);
        expect(employee.employeeAddress).to.equal(employeeAddress);
        expect(employee.jobId).to.equal(jobId);
    });

    it('emits the EmployeeHired event with correct arguments', async () => {
        await expect(hireTransaction)
            .to.emit(restaurantContract, 'EmployeeHired')
            .withArgs(
                employeeId, // The employee ID
                (await ethers.provider.getBlock(hireResult.blockNumber)).timestamp, // The block timestamp
                [
                    jobId, // The job ID from the Employee struct
                    employeeName, // The employee name from the Employee struct
                    employeeAddress, // The employee address from the Employee struct
                    0, // clockStamp
                    0  // employeePension
                ]
            );
    });
});


    });

    describe('Failure', async () => {
     it('rejects adding a duplicate job with the same ID and name', async () => {
    const restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);
    await restaurantContract.addJob(hourlyWage, 'ChefChocolate');
    await expect(restaurantContract.addJob(hourlyWage, 'ChefChocolate')).to.be.revertedWith('Job with the same name and ID already exists.');
});

it('rejects hiring an employee for a non-existent job', async () => {
    const nonExistentJobId = 999;
    const restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);
    await expect(
        restaurantContract.hireEmployee(nonExistentJobId, employeeName, user1.address)
    ).to.be.reverted;
});
    });
  });
  
  describe('POS Creation and Payment', () => {
    let pos, posId, posContract, transaction, result, event, decodedEvent, posTransaction;

    describe('Success', () => {
        beforeEach(async () => {
  // Create the restaurant
  const transaction = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) });
  const receipt = await transaction.wait();
  const blockNumber = receipt.blockNumber;

  // Retrieve the RestaurantCreated event
  const events = await decentratalityServiceFactory.queryFilter(
    decentratalityServiceFactory.filters.RestaurantCreated(),
    blockNumber,
    blockNumber
  );

  if (events.length === 0) {
    throw new Error('RestaurantCreated event not found');
  }

  const event = events[0];
  const { restaurant: restaurantAddr, id: restaurantId, owner: restaurantOwner } = event.args;
  restaurant = restaurantAddr;

  // Initialize the restaurant contract instance
  restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

  // Create the POS
  posTransaction = await restaurantContract.createPOS('POS #1');
  const posReceipt = await posTransaction.wait();
  const posBlockNumber = posReceipt.blockNumber;

  // Retrieve the POSCreated event
  const posEvents = await restaurantContract.queryFilter(
    restaurantContract.filters.POSCreated(),
    posBlockNumber,
    posBlockNumber
  );

  if (posEvents.length === 0) {
    throw new Error('POSCreated event not found');
  }

  const posEvent = posEvents[0];
  ({ pos: posAddress, id: posId, owner: posOwner } = posEvent.args);

  pos = posAddress;
  posId = posId;

  // Initialize the POS contract instance with the correct ABI
  const posABI = require('../src/abis/POS.json').abi;
  posContract = new ethers.Contract(pos, posABI, deployer);
});


        it('creates a POS and stores it in the POS mapping properly', async () => {
            const createdPOS = await restaurantContract.POSMapping(posId);
            expect(createdPOS).to.equal(pos);
        });

        it('emits the POSCreated event with correct arguments', async () => {
  await expect(posTransaction)
    .to.emit(restaurantContract, 'POSCreated')
    .withArgs(pos, posId, deployer.address);
});
    });

    describe('Failure', () => {

    });
});

  describe('POS Menu Items Management', () => {
    let pos, posId, posContract, transaction, result, event, decodedEvent;
    const itemName = "Burger";
    const itemCost = ethers.parseUnits('5', 'ether'); // Example: 5 ether for a burger

    describe('Success', () => {
        beforeEach(async () => {
  // Create the restaurant
  const transaction = await decentratalityServiceFactory.createRestaurant(
    'Montecito',
    ether(100),
    { value: ether(100) }
  );
  const receipt = await transaction.wait();
  const blockNumber = receipt.blockNumber;

  // Retrieve the RestaurantCreated event
  const events = await decentratalityServiceFactory.queryFilter(
    decentratalityServiceFactory.filters.RestaurantCreated(),
    blockNumber,
    blockNumber
  );

  if (events.length === 0) {
    throw new Error('RestaurantCreated event not found');
  }

  const event = events[0];
  const { restaurant: restaurantAddr, id: restaurantId, owner: restaurantOwner } = event.args;
  restaurant = restaurantAddr;

  // Initialize the restaurant contract instance
  restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

  // Create the POS
  const posTransaction = await restaurantContract.createPOS('POS #1', { value: ether(50) });
  const posReceipt = await posTransaction.wait();
  const posBlockNumber = posReceipt.blockNumber;

  // Retrieve the POSCreated event
  const posEvents = await restaurantContract.queryFilter(
    restaurantContract.filters.POSCreated(),
    posBlockNumber,
    posBlockNumber
  );

  if (posEvents.length === 0) {
    throw new Error('POSCreated event not found');
  }

  const posEvent = posEvents[0];
  const { pos: posAddress, id: posId, owner: posOwner } = posEvent.args;

  pos = posAddress;
  // posId is already assigned from event.args
  // Initialize the POS contract instance with the correct ABI
  const posABI = require('../src/abis/POS.json').abi;
  posContract = new ethers.Contract(pos, posABI, deployer);
});

        it('adds a menu item successfully', async () => {
            // Add a menu item
            transaction = await posContract.addMenuItem(itemCost, itemName);
            result = await transaction.wait();

            // Verify the menu item has been added
            const menuItem = await posContract.menu(1);
            expect(menuItem.cost).to.equal(itemCost);
            expect(menuItem.name).to.equal(itemName);
        });

        it('removes a menu item successfully', async () => {
            // Add a menu item first
            transaction = await posContract.addMenuItem(itemCost, itemName);
            result = await transaction.wait();

            event = result.logs.find(log => 
                log.topics[0] === ethers.id("menuItemAdded(string,uint256,uint256)")
            );

            decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['string', 'uint256', 'uint256'], 
                event.data
            );

            const index = decodedEvent[1]

            // Remove the menu item
            transaction = await posContract.removeMenuItem(1, index);
            result = await transaction.wait();

            // Verify the menu item has been removed
            const menuItem = await posContract.menu(1);
            expect(menuItem.cost).to.equal(0); // Deleted item should reset the cost to 0
            expect(menuItem.name).to.equal(''); // Deleted item should reset the name to an empty string
        });

        it('correctly tracks menu item IDs', async () => {
            // Add two menu items
            await posContract.addMenuItem(itemCost, 'Burger');
            await posContract.addMenuItem(itemCost, 'Pizza');

            // Verify that the IDs are correctly tracked
            const menuItemIds = await posContract.getMenuItemIds();
            expect(menuItemIds.length).to.equal(2);
            expect(Number(menuItemIds[0])).to.equal(1);
            expect(Number(menuItemIds[1])).to.equal(2);
        });
    });

    describe('Failure', () => {
        it('reverts when removing a non-existent menu item', async () => {
            await expect(posContract.removeMenuItem(999, 1)).to.be.reverted;
        });
    });
});
describe('POS Ticket Payment', () => {
    let pos, posId, posContract, transaction, result, event, decodedEvent;
    const itemName1 = "Burger";
    const itemCost1 = ethers.parseUnits('5', 'ether'); // 5 ether for a burger
    const itemName2 = "Pizza";
    const itemCost2 = ethers.parseUnits('7', 'ether'); // 7 ether for a pizza
    let customer, totalCost;

    beforeEach(async () => {
  // Create the restaurant
  const transaction = await decentratalityServiceFactory.createRestaurant(
    'Montecito',
    ether(100),
    { value: ether(100) }
  );
  const receipt = await transaction.wait();
  const blockNumber = receipt.blockNumber;

  // Retrieve the RestaurantCreated event
  const events = await decentratalityServiceFactory.queryFilter(
    decentratalityServiceFactory.filters.RestaurantCreated(),
    blockNumber,
    blockNumber
  );

  if (events.length === 0) {
    throw new Error('RestaurantCreated event not found');
  }

  const event = events[0];
  const { restaurant: restaurantAddr, id: restaurantId, owner: restaurantOwner } = event.args;
  restaurant = restaurantAddr;

  // Initialize the restaurant contract instance
  restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

  // Create the POS
  const posTransaction = await restaurantContract.createPOS('POS #1', { value: ether(50) });
  const posReceipt = await posTransaction.wait();
  const posBlockNumber = posReceipt.blockNumber;

  // Retrieve the POSCreated event
  const posEvents = await restaurantContract.queryFilter(
    restaurantContract.filters.POSCreated(),
    posBlockNumber,
    posBlockNumber
  );

  if (posEvents.length === 0) {
    throw new Error('POSCreated event not found');
  }

  const posEvent = posEvents[0];
  const { pos: posAddress, id: posId, owner: posOwner } = posEvent.args;

  pos = posAddress;
  // Initialize the POS contract instance with the correct ABI
  const posABI = require('../src/abis/POS.json').abi;
  posContract = new ethers.Contract(pos, posABI, deployer);

  customer = accounts[4]; // Assign customer account

  // Add some menu items
  await posContract.addMenuItem(itemCost1, itemName1);
  await posContract.addMenuItem(itemCost2, itemName2);

  totalCost = itemCost1 + itemCost2; // ethers.js v6 BigInt arithmetic
});


    it('should allow a customer to pay for a ticket after adding orders', async () => {
        // Create a ticket
        await posContract.createTicket(customer.address, 'Order 1');
        
        // Get ticket ID
        const ticketId = await posContract.nextTicketId();

        // Add orders to the ticket
        const orders = [
            { cost: itemCost1, name: itemName1 },
            { cost: itemCost2, name: itemName2 }
        ];
        await posContract.addTicketOrders(ticketId, orders);

        // Pay for the ticket
        await expect(() => 
            posContract.connect(customer).payTicket(ticketId, customer.address, { value: totalCost })
        ).to.changeEtherBalance(customer, -totalCost);

        // Ensure the ticket is marked as paid
        const ticket = await posContract.tickets(ticketId);
        expect(ticket.paid).to.equal(true);
    });

    it('should fail if the customer does not provide enough Ether', async () => {
        // Create a ticket
        await posContract.createTicket(customer.address, 'Order 2');
        
        // Get ticket ID
        const ticketId = await posContract.nextTicketId();

        // Add orders to the ticket
        const orders = [
            { cost: itemCost1, name: itemName1 },
            { cost: itemCost2, name: itemName2 }
        ];
        await posContract.addTicketOrders(ticketId, orders);
        // Try to pay with insufficient Ether
        await expect(
            posContract.connect(customer).payTicket(ticketId, customer.address, { value: itemCost1 }) // Less than totalCost
        ).to.be.revertedWith('Insufficient balance input');
    });
});
describe('Restaurant Service Management and POS and Employee Payment', () => {
    let pos1, pos2, posId1, posId2, posContract1, posContract2, customer1, customer2, server1, server2, restaurantInitialBalance, restaurantFinalBalance;
    const itemName1 = "Burger";
    const itemCost1 = ethers.parseUnits('5', 'ether'); // 5 ether for a burger
    const itemName2 = "Pizza";
    const itemCost2 = ethers.parseUnits('7', 'ether'); // 7 ether for a pizza
    const hourlyWage = 2000000000000000 // 1 ether/hour wage

    beforeEach(async () => {
  // Create the restaurant
  const transaction = await decentratalityServiceFactory.createRestaurant(
    'Montecito',
    ether(100),
    { value: ether(100) }
  );
  const receipt = await transaction.wait();
  const blockNumber = receipt.blockNumber;

  // Retrieve the RestaurantCreated event
  const events = await decentratalityServiceFactory.queryFilter(
    decentratalityServiceFactory.filters.RestaurantCreated(),
    blockNumber,
    blockNumber
  );

  if (events.length === 0) {
    throw new Error('RestaurantCreated event not found');
  }

  const event = events[0];
  const { restaurant: restaurantAddr } = event.args;
  restaurant = restaurantAddr;

  // Initialize the restaurant contract instance
  restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

  // Create POS #1
  let posTransaction = await restaurantContract.createPOS('POS #1');
  let posReceipt = await posTransaction.wait();
  let posBlockNumber = posReceipt.blockNumber;

  // Retrieve the POSCreated event for POS #1
  let posEvents = await restaurantContract.queryFilter(
    restaurantContract.filters.POSCreated(),
    posBlockNumber,
    posBlockNumber
  );

  if (posEvents.length === 0) {
    throw new Error('POSCreated event not found for POS #1');
  }

  let posEvent = posEvents[0];
  const { pos: posAddress1 } = posEvent.args;

  pos1 = posAddress1;
  const posABI = require('../src/abis/POS.json').abi;
  posContract1 = new ethers.Contract(pos1, posABI, deployer);

  // Create POS #2
  posTransaction = await restaurantContract.createPOS('POS #2');
  posReceipt = await posTransaction.wait();
  posBlockNumber = posReceipt.blockNumber;

  // Retrieve the POSCreated event for POS #2
  posEvents = await restaurantContract.queryFilter(
    restaurantContract.filters.POSCreated(),
    posBlockNumber,
    posBlockNumber
  );

  if (posEvents.length === 0) {
    throw new Error('POSCreated event not found for POS #2');
  }

  posEvent = posEvents[0];
  const { pos: posAddress2 } = posEvent.args;

  pos2 = posAddress2;
  posContract2 = new ethers.Contract(pos2, posABI, deployer);

  customer1 = accounts[4];
  customer2 = accounts[5];

  // Add menu items to both POS systems
  await posContract1.addMenuItem(itemCost1, itemName1);
  await posContract2.addMenuItem(itemCost2, itemName2);

  // Record initial balance of the restaurant
  restaurantInitialBalance = await ethers.provider.getBalance(restaurant);

  // Add servers (employees)
  server1 = accounts[7];
  server2 = accounts[8];

  // Add jobs for servers and hire them
  await restaurantContract.addJob(hourlyWage, "Server");
  const jobId = await restaurantContract.nextJobId();

  await restaurantContract.hireEmployee(jobId, "Server1", server1.address);
  await restaurantContract.hireEmployee(jobId, "Server2", server2.address);

  // Servers clock in
  await restaurantContract.connect(server1).clockIn(1); // Employee ID 1
  await restaurantContract.connect(server2).clockIn(2); // Employee ID 2

  // Simulate some time passing (e.g., 1 hour)
  await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour in seconds
  await ethers.provider.send("evm_mine"); // Force a new block
});


    it('should toggle service state and settle payments when service ends', async () => {
        // Start the service
        await restaurantContract.startService();
        let serviceStatus = await restaurantContract.service();
        expect(serviceStatus).to.equal(true);

        // Create tickets and make payments on POS systems
        await posContract1.createTicket(customer1.address, 'Order 1');
        await posContract1.addTicketOrders(1, [{ cost: itemCost1, name: itemName1 }]);
        await posContract1.connect(customer1).payTicket(1, customer1.address, { value: itemCost1 });

        await posContract2.createTicket(customer2.address, 'Order 2');
        await posContract2.addTicketOrders(1, [{ cost: itemCost2, name: itemName2 }]);
        await posContract2.connect(customer2).payTicket(1, customer2.address, { value: itemCost2 });

        // End the service
        await restaurantContract.endService();

        serviceStatus = await restaurantContract.service();
        expect(serviceStatus).to.equal(false);

        // Check that both POS balances have been transferred to the restaurant
        restaurantFinalBalance = await ethers.provider.getBalance(restaurant);
        const expectedBalanceIncrease = itemCost1 + itemCost2; // Total payment from both POS systems
        expect(restaurantFinalBalance).to.equal(restaurantInitialBalance + expectedBalanceIncrease);
    });

    it('should pay servers their wages when service ends, accounting for gas', async () => {
    // Start the service
    await restaurantContract.startService();
    let serviceStatus = await restaurantContract.service();
    expect(serviceStatus).to.equal(true);

    // Create tickets and make payments on POS systems
    await posContract1.createTicket(customer1.address, 'Order 1');
    await posContract1.addTicketOrders(1, [{ cost: itemCost1, name: itemName1 }]);
    await posContract1.connect(customer1).payTicket(1, customer1.address, { value: itemCost1 });

    await posContract2.createTicket(customer2.address, 'Order 2');
    await posContract2.addTicketOrders(1, [{ cost: itemCost2, name: itemName2 }]);
    await posContract2.connect(customer2).payTicket(1, customer2.address, { value: itemCost2 });

    // Record initial balance of the servers
    const server1InitialBalance = await ethers.provider.getBalance(server1.address);
    const server2InitialBalance = await ethers.provider.getBalance(server2.address);

    // Servers clock out
    const tx1 = await restaurantContract.connect(server1).clockOut(1); // Employee ID 1
    const tx1Receipt = await tx1.wait();
    const tx2 = await restaurantContract.connect(server2).clockOut(2); // Employee ID 2
    const tx2Receipt = await tx2.wait();

    // Get gas prices and calculate gas cost in wei for each transaction
    const tx1GasCost = tx1Receipt.gasUsed * tx1Receipt.gasPrice;
    const tx2GasCost = tx2Receipt.gasUsed * tx2Receipt.gasPrice;

    // End the service
    const endServiceTx = await restaurantContract.endService();
    await endServiceTx.wait();

    // Record final balance of the servers
    const server1FinalBalance = await ethers.provider.getBalance(server1.address);
    const server2FinalBalance = await ethers.provider.getBalance(server2.address);

    // Expected wage for 1 hour of work (in wei)
    const expectedWage = hourlyWage * 1; // Assuming 1 hour of work

    // Calculate actual payouts (taking into account gas costs)
        // Calculate actual payouts (taking into account gas costs)
    const server1BalanceChange = server1FinalBalance - server1InitialBalance;
    const server2BalanceChange = server2FinalBalance - server2InitialBalance;

    // Ensure the final balance is greater than the initial balance plus the gas cost
    expect(server1FinalBalance).to.be.greaterThan(server1InitialBalance, 'Server 1 did not make a profit');
    expect(server2FinalBalance).to.be.greaterThan(server2InitialBalance, 'Server 2 did not make a profit');

});



    it('should toggle the service state to true when startService is called', async () => {
        // Initially, the service should be false
        let serviceStatus = await restaurantContract.service();
        expect(serviceStatus).to.equal(false);

        // Start the service
        const transaction = await restaurantContract.startService();
        const result = await transaction.wait();

        // Service should now be true
        serviceStatus = await restaurantContract.service();
        expect(serviceStatus).to.equal(true);
    });

    it('should store the timestamp when the service starts', async () => {
        // Start the service
        const transaction = await restaurantContract.startService();
        const result = await transaction.wait();

        // Get the block number and timestamp
        const block = await ethers.provider.getBlock(result.blockNumber);
        const expectedTimestamp = block.timestamp;

        // Retrieve the stored service start timestamp
        const serviceStartTimestamp = await restaurantContract.serviceStart();

        // Check if the stored timestamp matches the expected timestamp
        expect(serviceStartTimestamp).to.equal(expectedTimestamp);
    });
});


  })
})
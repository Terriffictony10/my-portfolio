const { expect } = require('chai');
const { ethers } = require('hardhat');

const restaurantABI = require('../src/abis/Restaurant.json').abi;

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Decentratality', () => {
  let decentratality, accounts, deployer, receiver, exchange, decentratalityServiceFactory, user1, restaurant, customer

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Decentratality')
    decentratality = await Token.deploy()

    decentratalityServiceFactory = await ethers.deployContract('decentratalityServiceFactory', [decentratality.target])

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
    exchange = accounts[2]
    user1 = accounts[3]
    customer = accounts[4];
  })

  describe('Deployment', () => {
    

  
    describe('Restaurant Creation', () => {
    let restaurantAddress, restaurantId;
    describe('Success', () => {
      beforeEach(async () => {
        transaction  = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) })
        result = await transaction.wait()

        
        const event = result.logs.find(log => 
                log.topics[0] === ethers.id("RestaurantCreated(address,uint256,address)")
            );

            const decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'uint256', 'address'], 
                event.data
            );

            restaurant = decodedEvent[0];
            restaurantId = decodedEvent[1]; // Get the restaurant address from the decoded event // Log the address
            restaurantOwner = decodedEvent[2];
            
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
                .to.emit(decentratalityServiceFactory, 'fundsAdded')
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
    let restaurant, restaurantId, transaction, result, restaurantContract, jobId, job;
    const employeeName = "John Doe";
    const hourlyWage = 20; // Example: $20.00/hour in cents

    describe('Success', () => {
      
      beforeEach(async () => {
        transaction  = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) })
        result = await transaction.wait()

        
        const event = result.logs.find(log => 
                log.topics[0] === ethers.id("RestaurantCreated(address,uint256,address)")
            );

            const decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'uint256', 'address'], 
                event.data
            );

            restaurant = decodedEvent[0];
            restaurantId = decodedEvent[1]; // Get the restaurant address from the decoded event // Log the address
            restaurantOwner = decodedEvent[2];
            restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer); 

            transaction = await restaurantContract.addJob(hourlyWage, 'Chef');
            result = await transaction.wait();

            const jobEvent = result.logs.find(log => 
                log.topics[0] === ethers.id("JobAdded(uint256,uint256,(uint256,string))")
            );

            const jobDecodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint256', 'uint256', 'tuple(uint256,string)'], 
                jobEvent.data
            );
            jobId = jobDecodedEvent[0];
            job = jobDecodedEvent[2];
      })

      it('adds a job and stores it in the jobs mapping', async () => {
        const job = await restaurantContract.jobs(jobId);
        expect(job.jobName).to.equal('Chef');
        expect(job.hourlyWage).to.equal(hourlyWage * 100);
      });

      it('emits the JobAdded event with correct arguments', async () => {
        await expect(transaction)
          .to.emit(restaurantContract, 'JobAdded')
          .withArgs(
            jobId,  // The job ID
            (await ethers.provider.getBlock(result.blockNumber)).timestamp,  // The timestamp from the block
            [hourlyWage * 100,  // The `hourlyWage` from the struct
            'Chef'] // The `jobName` from the struct
        );
      });

      describe('Hiring Employee', () => {
        let hireTransaction, hireResult, employeeAddress;
        

        beforeEach(async () => {
    employeeAddress = user1.address;

    restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

    hireTransaction = await restaurantContract.hireEmployee(jobId, employeeName, employeeAddress);
    hireResult = await hireTransaction.wait();
     // Add this to check if the event is in the logs
    // Find the EmployeeHired event in the logs
    const employeeEvent = await hireResult.logs.find(log =>
        log.topics[0] === ethers.id("EmployeeHired(uint256,uint256,(uint256,string,address))")
    );

    
    if (!employeeEvent) {
        throw new Error('EmployeeHired event not found in logs');
    }

    // Decode the EmployeeHired event data
    const employeeDecodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
        [ 'uint256', 'uint256', 'tuple(uint256,string,address)'], 
        employeeEvent.data
    );

    // Extract employeeId from the decoded event
    employeeId = employeeDecodedEvent[0];
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
      employeeId, // This is the employeeId from the Employee struct
      (await ethers.provider.getBlock(hireResult.blockNumber)).timestamp, // The block timestamp
      [
        jobId, // This is the jobId from the Employee struct
        employeeName, // This is the employee name from the Employee struct
        employeeAddress, // This is the employee address from the Employee struct
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
    let pos, posId, posContract, transaction, result, event, decodedEvent;

    describe('Success', () => {
        beforeEach(async () => {

            transaction  = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) })
            result = await transaction.wait()

        
            event = result.logs.find(log => 
                log.topics[0] === ethers.id("RestaurantCreated(address,uint256,address)")
            );

            decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'uint256', 'address'], 
                event.data
            );

            restaurant = decodedEvent[0];
            restaurantId = decodedEvent[1]; // Get the restaurant address from the decoded event // Log the address
            restaurantOwner = decodedEvent[2];
            restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer); 
            transaction = await restaurantContract.createPOS('POS #1');
            result = await transaction.wait();

            event = result.logs.find(log => 
                log.topics[0] === ethers.id("POSCreated(address,uint256,address)")
            );

            decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'uint256', 'address'], 
                event.data
            );

            pos = decodedEvent[0];
            posId = decodedEvent[1];
            posContract = new ethers.Contract(pos, restaurantABI, deployer);
        });

        it('creates a POS and stores it in the POS mapping properly', async () => {
            const createdPOS = await restaurantContract.POSMapping(posId);
            expect(createdPOS).to.equal(pos);
        });

        it('emits the POSCreated event with correct arguments', async () => {
            await expect(transaction)
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
            // Create the restaurant and POS first
            transaction = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) });
            result = await transaction.wait();

            event = result.logs.find(log => 
                log.topics[0] === ethers.id("RestaurantCreated(address,uint256,address)")
            );

            decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'uint256', 'address'], 
                event.data
            );

            restaurant = decodedEvent[0];
            restaurantId = decodedEvent[1];
            restaurantOwner = decodedEvent[2];
            restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

            // Create the POS
            transaction = await restaurantContract.createPOS('POS #1', { value: ether(50) });
            result = await transaction.wait();

            event = result.logs.find(log => 
                log.topics[0] === ethers.id("POSCreated(address,uint256,address)")
            );

            decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'uint256', 'address'], 
                event.data
            );

            pos = decodedEvent[0];
            posId = decodedEvent[1];
            const posABI = require('../src/abis/POS.json').abi;
            posContract = new ethers.Contract(pos, posABI, deployer); // Use POS ABI here
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
        // Create the restaurant and POS first
        transaction = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) });
        result = await transaction.wait();

        event = result.logs.find(log => 
            log.topics[0] === ethers.id("RestaurantCreated(address,uint256,address)")
        );

        decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
            ['address', 'uint256', 'address'], 
            event.data
        );

        restaurant = decodedEvent[0];
        restaurantId = decodedEvent[1];
        restaurantOwner = decodedEvent[2];
        restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

        // Create the POS
        transaction = await restaurantContract.createPOS('POS #1', { value: ether(50) });
        result = await transaction.wait();

        event = result.logs.find(log => 
            log.topics[0] === ethers.id("POSCreated(address,uint256,address)")
        );

        decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
            ['address', 'uint256', 'address'], 
            event.data
        );

        pos = decodedEvent[0];
        posId = decodedEvent[1];
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
    describe('Restaurant Service Management and POS Payment', () => {
    let pos1, pos2, posId1, posId2, posContract1, posContract2, customer1, customer2, restaurantInitialBalance, restaurantFinalBalance;

    const itemName1 = "Burger";
    const itemCost1 = ethers.parseUnits('5', 'ether'); // 5 ether for a burger
    const itemName2 = "Pizza";
    const itemCost2 = ethers.parseUnits('7', 'ether'); // 7 ether for a pizza

    beforeEach(async () => {
        // Create the restaurant and two POS terminals
        let transaction = await decentratalityServiceFactory.createRestaurant('Montecito', ether(100), { value: ether(100) });
        let result = await transaction.wait();

        let event = result.logs.find(log =>
            log.topics[0] === ethers.id("RestaurantCreated(address,uint256,address)")
        );

        let decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
            ['address', 'uint256', 'address'],
            event.data
        );

        restaurant = decodedEvent[0];
        restaurantContract = new ethers.Contract(restaurant, restaurantABI, deployer);

        // Create two POS systems
        transaction = await restaurantContract.createPOS('POS #1');
        result = await transaction.wait();

        event = result.logs.find(log =>
            log.topics[0] === ethers.id("POSCreated(address,uint256,address)")
        );

        decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
            ['address', 'uint256', 'address'],
            event.data
        );

        pos1 = decodedEvent[0];
        posId1 = decodedEvent[1];
        const posABI = require('../src/abis/POS.json').abi;
        posContract1 = new ethers.Contract(pos1, posABI, deployer);

        transaction = await restaurantContract.createPOS('POS #2');
        result = await transaction.wait();

        event = result.logs.find(log =>
            log.topics[0] === ethers.id("POSCreated(address,uint256,address)")
        );

        decodedEvent = ethers.AbiCoder.defaultAbiCoder().decode(
            ['address', 'uint256', 'address'],
            event.data
        );

        pos2 = decodedEvent[0];
        posId2 = decodedEvent[1];
        posContract2 = new ethers.Contract(pos2, posABI, deployer);

        customer1 = accounts[4];
        customer2 = accounts[5];

        // Add menu items to both POS systems
        await posContract1.addMenuItem(itemCost1, itemName1);
        await posContract2.addMenuItem(itemCost2, itemName2);

        // Record initial balance of the restaurant
        restaurantInitialBalance = await ethers.provider.getBalance(restaurant);
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
    // Connect to the POS contracts with the correct owner (deployer)

    await restaurantContract.endService();

    serviceStatus = await restaurantContract.service();
    expect(serviceStatus).to.equal(false);

    // Check that both POS balances have been transferred to the restaurant
    restaurantFinalBalance = await ethers.provider.getBalance(restaurant);

    const expectedBalanceIncrease = itemCost1 + itemCost2; // Total payment from both POS systems
    expect(restaurantFinalBalance).to.equal(restaurantInitialBalance + expectedBalanceIncrease);
});

});









  })
})
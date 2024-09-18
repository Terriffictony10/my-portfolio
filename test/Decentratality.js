const { expect } = require('chai');
const { ethers } = require('hardhat');

const restaurantABI = require('../src/abis/Restaurant.json').abi;

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Decentratality', () => {
  let decentratality, accounts, deployer, receiver, exchange, decentratalityServiceFactory, user1, restaurant

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Decentratality')
    decentratality = await Token.deploy()

    decentratalityServiceFactory = await ethers.deployContract('decentratalityServiceFactory', [decentratality.target])

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

            // Remove the menu item
            transaction = await posContract.removeMenuItem(1);
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
            await expect(posContract.removeMenuItem(999)).to.be.reverted;
        });
    });
});



  })
})
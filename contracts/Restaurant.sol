// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./POS.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract Restaurant is Ownable{

	struct Job {
    uint256 hourlyWage; // wage in cents
    string jobName;
	}

	struct Employee {
    uint256 jobId; // wage in cents
    string name;
    address employeeAddress;
	}

	event POSCreated(
        POS pos, 
        uint256 id, 
        address owner
    );

	event JobAdded( 
        uint256 id,
        uint256 timestamp,
        Job job
    );
    event EmployeeHired( 
        uint256 id,
        uint256 timestamp,
        Employee employee
    );
    uint256 public nextJobId;
    uint256 public nextPOSId;
    uint256 public nextEmployeeId;
	string public name;
	mapping(uint256 => Job) public jobs; // maps an ID to a Restaurant (which includes the wage and name)
	uint256[] public jobIds; // array to keep track of all job IDs

	mapping(uint256 => Employee) public employees;

	mapping(uint256 => POS) public POSMapping;
	uint256[] public POSIds; // array to keep track of all job IDs

	constructor(
		string memory _name, 
		address _owner
	) Ownable(_owner){
		name = _name;
	}
	
	receive() external payable {
		
	}

	function createPOS(
        string memory _name
    ) public payable returns(uint256, POS){

    for (uint256 i = 0; i < POSIds.length; i++) {
            uint256 posId = POSIds[i];
            require(
                keccak256(bytes(POSMapping[posId].name())) != keccak256(bytes(_name)),
                "Job with the same name and ID already exists."
            );
        }
    // Increment the nextRestaurantId for the newly created restaurant
    nextPOSId++;

    // Create the new Restaurant contract
    POS pos = new POS(_name, msg.sender);

    // Map the newly created restaurant contract to the nextRestaurantId
    POSMapping[nextPOSId] = pos;

    POSIds.push(nextPOSId);

    // Emit an event with the address and the ID of the new restaurant
    emit POSCreated(pos, nextPOSId, pos.owner());

    // Return the newly created restaurant contract
    return (nextPOSId, pos);
    }

	function payOwner(uint256 _amount) public {
		// Require that the contract has enough Ether to perform the transaction
        require(address(this).balance >= _amount, "Insufficient contract balance to perform the transaction");
        
		(bool sent, ) = owner().call{value: _amount}("");
		require(sent);
	}
	// Example of how you could add an entry
	 function addJob(uint256 wageInCents, string memory _name) public onlyOwner {
        // Iterate through the jobIds array to check if a job with the same name exists
        for (uint256 i = 0; i < jobIds.length; i++) {
            uint256 jobId = jobIds[i];
            require(
                keccak256(bytes(jobs[jobId].jobName)) != keccak256(bytes(_name)),
                "Job with the same name and ID already exists."
            );
        }

        // Increment job ID and add the job
        nextJobId++;
        jobs[nextJobId] = Job(wageInCents * 100, _name);
        jobIds.push(nextJobId); // Track the new job ID
        emit JobAdded(nextJobId, block.timestamp, jobs[nextJobId]);
    }
    function hireEmployee(uint256 _jobId, string memory _name, address employeeAddress) public onlyOwner{
    require(jobs[_jobId].hourlyWage != 0, "Job does not exist");
    nextEmployeeId++;
    employees[nextEmployeeId] = Employee(_jobId, _name, employeeAddress);
    emit EmployeeHired(nextEmployeeId, block.timestamp, employees[nextEmployeeId]);
	}

}
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./POS.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPOSDeployer {
    function deployPOS(
        string memory _name,
        address _owner,
        address _restaurant
    ) external returns (address);
}

interface IPOS {
    function name() external view returns (string memory);
    function owner() external view returns (address);
    function payRestaurant() external;
    // Add other functions as needed
}

contract Restaurant is Ownable {
    struct Job {
        uint256 hourlyWageInWei; // Wage is now in wei
        string jobName;
    }

    struct Employee {
        uint256 jobId; 
        string name;
        address employeeAddress;
        uint256 clockStamp;
        uint256 employeePension;
    }

    struct Service {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 cost;
        uint256 profit;
        uint256 revenue;
    }

    event ServiceEnded(
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint256 cost,
        uint256 profit,
        uint256 revenue
    );
    event POSCreated(address pos, uint256 id, address owner);
    event JobAdded(uint256 id, uint256 timestamp, Job job);
    event EmployeeHired(uint256 id, uint256 timestamp, Employee employee);

    bool public service;
    uint256 public serviceStart;
    uint256 public serviceStop;
    uint256 public nextJobId;
    uint256 public nextPOSId;
    uint256 public nextEmployeeId;
    string public name;
    uint256 public nextServiceId;
    mapping(uint256 => Service) public services;
    uint256[] public serviceIds;
    uint256 public serviceStartBalance;

    mapping(uint256 => Job) public jobs;
    uint256[] public jobIds;
    mapping(uint256 => Employee) public employees;
    uint256[] public employeeIds;
    mapping(uint256 => address) public POSMapping;
    uint256[] public POSIds;

    IPOSDeployer public posDeployer;

    constructor(string memory _name, address _owner, IPOSDeployer _posDeployer) Ownable(_owner) {
        name = _name;
        posDeployer = _posDeployer;
    }

    receive() external payable {}

    function createPOS(string memory _name) public payable returns (uint256, address) {
        for (uint256 i = 0; i < POSIds.length; i++) {
            uint256 posId = POSIds[i];
            address posAddress = POSMapping[posId];
            string memory existingName = IPOS(posAddress).name();
            require(
                keccak256(bytes(existingName)) != keccak256(bytes(_name)),
                "POS with the same name already exists."
            );
        }
        nextPOSId++;
        address pos = posDeployer.deployPOS(_name, owner(), address(this));
        POSMapping[nextPOSId] = pos;
        POSIds.push(nextPOSId);
        emit POSCreated(pos, nextPOSId, IPOS(pos).owner());
        return (nextPOSId, pos);
    }

    function payOwner(uint256 _amount) public {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        (bool sent, ) = owner().call{value: _amount}("");
        require(sent, "Transfer failed");
    }

    function addJob(uint256 wageInWei, string memory _name) public onlyOwner {
        for (uint256 i = 0; i < jobIds.length; i++) {
            uint256 jobId = jobIds[i];
            require(
                keccak256(bytes(jobs[jobId].jobName)) != keccak256(bytes(_name)),
                "Job with the same name already exists."
            );
        }
        nextJobId++;
        jobs[nextJobId] = Job(wageInWei, _name); // Wage stored in wei
        jobIds.push(nextJobId);
        emit JobAdded(nextJobId, block.timestamp, jobs[nextJobId]);
    }

    function hireEmployee(uint256 _jobId, string memory _name, address employeeAddress) public onlyOwner {
        require(jobs[_jobId].hourlyWageInWei != 0, "Job does not exist");
        nextEmployeeId++;
        employees[nextEmployeeId] = Employee(_jobId, _name, employeeAddress, 0, 0);
        employeeIds.push(nextEmployeeId);
        emit EmployeeHired(nextEmployeeId, block.timestamp, employees[nextEmployeeId]);
    }

    function startService() public onlyOwner {
        require(!service, "Service is already active");
        service = true;
        serviceStart = block.timestamp;

        // Increment service ID and create a new service record
        nextServiceId++;
        Service storage newService = services[nextServiceId];
        newService.id = nextServiceId;
        newService.startTime = block.timestamp;
        serviceIds.push(nextServiceId);

        // Record the starting balance
        serviceStartBalance = address(this).balance;
    }

    function clockIn(uint256 _id) public {
        require(employees[_id].clockStamp == 0, "Already clocked in");
        employees[_id].clockStamp = block.timestamp;
    }

    function clockOut(uint256 _id) public {
        require(employees[_id].clockStamp != 0, "Must clock in first");
        uint256 timeWorked = block.timestamp - employees[_id].clockStamp; // Seconds worked
        uint256 amountEarned = (jobs[employees[_id].jobId].hourlyWageInWei * timeWorked) / 3600; // Time to be paid in wei
        employees[_id].employeePension += amountEarned;
        employees[_id].clockStamp = 0;
    }

    function endService() public onlyOwner {
    require(service, "Service is not active");
    service = false;

    // 1) Collect balances from each POS before distributing to employees
    for (uint256 i = 0; i < POSIds.length; i++) {
        address posAddress = POSMapping[POSIds[i]];
        IPOS(posAddress).payRestaurant(); 
        // ^ calls the payRestaurant function in each POS, 
        //   transferring its balance to this Restaurant contract
    }

    // 2) Now proceed with your existing endService logic
    //    Set the end time of the current service
    Service storage currentService = services[nextServiceId];
    currentService.endTime = block.timestamp;

    // 3) Pay employees (cost)
    uint256 totalCost = 0;
    for (uint256 i = 0; i < employeeIds.length; i++) {
        uint256 empId = employeeIds[i];
        Employee storage emp = employees[empId];
        if (emp.employeePension > 0) {
            totalCost += emp.employeePension;
            payable(emp.employeeAddress).transfer(emp.employeePension);
            emp.employeePension = 0;
        }
    }

    // 4) Calculate revenue from difference in balances
    uint256 serviceEndBalance = address(this).balance;
    uint256 totalRevenue = serviceEndBalance - serviceStartBalance;

    // 5) Calculate profit
    uint256 totalProfit = 0;
    if (totalRevenue > totalCost) {
        totalProfit = totalRevenue - totalCost;
    }

    // 6) Update the currentService data
    currentService.cost = totalCost;
    currentService.revenue = totalRevenue;
    currentService.profit = totalProfit;

    // 7) Reset serviceStartBalance
    serviceStartBalance = 0;

    // 8) Emit the ServiceEnded event
    emit ServiceEnded(
        currentService.id,
        currentService.startTime,
        currentService.endTime,
        currentService.cost,
        currentService.profit,
        currentService.revenue
    );
}

    function getJobIds() public view returns (uint256[] memory) {
        return jobIds;
    }

    function getEmployeeIds() public view returns (uint256[] memory) {
        return employeeIds;
    }

    function getServiceIds() public view returns (uint256[] memory) {
        return serviceIds;
    }

    // New function to retrieve all POS addresses, only callable by the owner
    function getAllPOSAddresses() public view onlyOwner returns (address[] memory) {
        uint256 posCount = POSIds.length;
        address[] memory posAddresses = new address[](posCount);
        for (uint256 i = 0; i < posCount; i++) {
            uint256 posId = POSIds[i];
            posAddresses[i] = POSMapping[posId];
        }
        return posAddresses;
    }
    function getPOSIds() public view returns (uint256[] memory) {
    return POSIds;
}

}

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
    // ============================================================
    //                     DATA STRUCTURES
    // ============================================================
    struct Job {
        uint256 hourlyWageInWei; // Wage is in wei
        string jobName;
    }

    struct Employee {
        uint256 jobId;          // ID references the jobs mapping
        string name;
        address employeeAddress;
        uint256 clockStamp;     // Tracks time employee last clocked in
        uint256 employeePension; // Accumulated wages (paid out on endService)
    }

    struct Service {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 cost;
        uint256 profit;
        uint256 revenue;
    }

    // ============================================================
    //                     STATE VARIABLES
    // ============================================================
    bool public service;           // indicates if service is active
    uint256 public serviceStart;   // block.timestamp when service last began
    uint256 public serviceStop;    // block.timestamp when service ended
    uint256 public nextJobId;
    uint256 public nextPOSId;
    uint256 public nextEmployeeId;
    string public name;            // Restaurant name
    uint256 public nextServiceId;  
    uint256 public serviceStartBalance;

    mapping(uint256 => Service) public services;
    uint256[] public serviceIds;

    // Jobs
    mapping(uint256 => Job) public jobs;
    uint256[] public jobIds;

    // Employees
    mapping(uint256 => Employee) public employees;
    uint256[] public employeeIds;

    // POS
    mapping(uint256 => address) public POSMapping;
    uint256[] public POSIds;

    IPOSDeployer public posDeployer;

    // ============================================================
    //                          EVENTS
    // ============================================================
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

    // Optional: events for clockIn/clockOut
    event EmployeeClockedIn(uint256 indexed employeeId, uint256 timestamp);
    event EmployeeClockedOut(
        uint256 indexed employeeId, 
        uint256 timestamp, 
        uint256 shiftSeconds, 
        uint256 shiftPay
    );

    // ============================================================
    //                       CONSTRUCTOR
    // ============================================================
    constructor(string memory _name, address _owner, IPOSDeployer _posDeployer) Ownable(_owner) {
        name = _name;
        posDeployer = _posDeployer;
    }

    // ============================================================
    //                          RECEIVE
    // ============================================================
    receive() external payable {}

    // ============================================================
    //                          FUNCTIONS
    // ============================================================

    // --------------------- CREATE POS ---------------------
    function createPOS(string memory _name)
        public
        payable
        returns (uint256, address)
    {
        // Ensure no duplicate POS by name
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

    // --------------------- PAY OWNER ---------------------
    function payOwner(uint256 _amount) public {
        require(
            address(this).balance >= _amount,
            "Insufficient contract balance"
        );
        (bool sent, ) = owner().call{value: _amount}("");
        require(sent, "Transfer failed");
    }

    // --------------------- ADD JOB ---------------------
    function addJob(uint256 wageInWei, string memory _name) public onlyOwner {
        // Check for duplicate job name
        // The test suite expects a revert reason:
        // "Job with the same name and ID already exists."
        for (uint256 i = 0; i < jobIds.length; i++) {
            uint256 existingJobId = jobIds[i];
            require(
                keccak256(bytes(jobs[existingJobId].jobName)) 
                    != keccak256(bytes(_name)),
                "Job with the same name and ID already exists."
            );
        }

        nextJobId++;
        jobs[nextJobId] = Job(wageInWei, _name);
        jobIds.push(nextJobId);

        emit JobAdded(nextJobId, block.timestamp, jobs[nextJobId]);
    }

    // --------------------- HIRE EMPLOYEE ---------------------
    function hireEmployee(
        uint256 _jobId,
        string memory _name,
        address employeeAddress
    ) 
        public
        onlyOwner 
    {
        // Must be a valid job
        require(
            jobs[_jobId].hourlyWageInWei != 0,
            "Job does not exist"
        );

        nextEmployeeId++;
        employees[nextEmployeeId] = Employee(
            _jobId,
            _name,
            employeeAddress,
            0,
            0
        );
        employeeIds.push(nextEmployeeId);

        emit EmployeeHired(nextEmployeeId, block.timestamp, employees[nextEmployeeId]);
    }

    // --------------------- CLOCK IN ---------------------
    function clockIn(uint256 _id) public {
        Employee storage emp = employees[_id];
        // Must be the correct employee
        require(
            emp.employeeAddress == msg.sender, 
            "Not authorized or employee does not exist"
        );
        // Must not be already clocked in
        require(emp.clockStamp == 0, "Employee is already clocked in");

        // Set the clock-in timestamp
        emp.clockStamp = block.timestamp;

        emit EmployeeClockedIn(_id, block.timestamp);
    }

    // --------------------- CLOCK OUT ---------------------
    function clockOut(uint256 _id) public {
        Employee storage emp = employees[_id];
        // Must be the correct employee
        require(
            emp.employeeAddress == msg.sender, 
            "Not authorized or employee does not exist"
        );
        // Must be currently clocked in
        require(emp.clockStamp != 0, "Employee is not clocked in");

        uint256 shiftSeconds = block.timestamp - emp.clockStamp;

        // Calculate pay: (shiftSeconds * wage) / 3600
        uint256 wagePerHour = jobs[emp.jobId].hourlyWageInWei;
        uint256 shiftPay = (shiftSeconds * wagePerHour) / 3600;

        // Add to their pending pension (paid out in endService)
        emp.employeePension += shiftPay;

        // Reset clockStamp
        emp.clockStamp = 0;

        emit EmployeeClockedOut(
            _id, 
            block.timestamp, 
            shiftSeconds, 
            shiftPay
        );
    }

    // --------------------- START SERVICE ---------------------
    function startService() public onlyOwner {
        require(!service, "Service is already active");
        service = true;
        serviceStart = block.timestamp;

        nextServiceId++;
        Service storage newService = services[nextServiceId];
        newService.id = nextServiceId;
        newService.startTime = block.timestamp;
        serviceIds.push(nextServiceId);

        serviceStartBalance = address(this).balance;
    }

    // --------------------- END SERVICE ---------------------
    function endService() public onlyOwner {
        require(service, "Service is not active");
        service = false;

        // Ask each POS to pay its balance to Restaurant
        for (uint256 i = 0; i < POSIds.length; i++) {
            address posAddress = POSMapping[POSIds[i]];
            IPOS(posAddress).payRestaurant();
        }

        // This session's service
        Service storage currentService = services[nextServiceId];
        currentService.endTime = block.timestamp;

        // Pay out employees
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

        // Calculate revenue & profit
        uint256 serviceEndBalance = address(this).balance;
        uint256 totalRevenue = serviceEndBalance - serviceStartBalance;
        uint256 totalProfit = 0;
        if (totalRevenue > totalCost) {
            totalProfit = totalRevenue - totalCost;
        }

        currentService.cost = totalCost;
        currentService.revenue = totalRevenue;
        currentService.profit = totalProfit;

        // Reset serviceStartBalance
        serviceStartBalance = 0;

        emit ServiceEnded(
            currentService.id,
            currentService.startTime,
            currentService.endTime,
            currentService.cost,
            currentService.profit,
            currentService.revenue
        );
    }

    // ============================================================
    //                        GETTERS
    // ============================================================
    function getName() external view returns (string memory) {
        return name;
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

    function getPOSIds() public view returns (uint256[] memory) {
        return POSIds;
    }

    function getAllPOSAddresses() public view onlyOwner returns (address[] memory) {
        uint256 posCount = POSIds.length;
        address[] memory posAddresses = new address[](posCount);
        for (uint256 i = 0; i < posCount; i++) {
            uint256 posId = POSIds[i];
            posAddresses[i] = POSMapping[posId];
        }
        return posAddresses;
    }
}

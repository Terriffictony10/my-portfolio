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
    
}

contract Restaurant is Ownable {
    
    struct Job {
        uint256 hourlyWageInWei; 
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

    
    bool public service;           
    uint256 public serviceStart;   
    uint256 public serviceStop;    
    uint256 public nextJobId;
    uint256 public nextPOSId;
    uint256 public nextEmployeeId;
    string public name;            
    uint256 public nextServiceId;  
    uint256 public serviceStartBalance;

    mapping(uint256 => Service) public services;
    uint256[] public serviceIds;

    
    mapping(uint256 => Job) public jobs;
    uint256[] public jobIds;

    
    mapping(uint256 => Employee) public employees;
    uint256[] public employeeIds;

    
    mapping(uint256 => address) public POSMapping;
    uint256[] public POSIds;

    IPOSDeployer public posDeployer;

    
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

    
    event EmployeeClockedIn(uint256 indexed employeeId, uint256 timestamp);
    event EmployeeClockedOut(
        uint256 indexed employeeId, 
        uint256 timestamp, 
        uint256 shiftSeconds, 
        uint256 shiftPay
    );

    
    constructor(string memory _name, address _owner, IPOSDeployer _posDeployer) Ownable(_owner) {
        name = _name;
        posDeployer = _posDeployer;
    }

    
    receive() external payable {}

    

    
    function createPOS(string memory _name)
        public
        payable
        returns (uint256, address)
    {
        
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
        require(
            address(this).balance >= _amount,
            "Insufficient contract balance"
        );
        (bool sent, ) = owner().call{value: _amount}("");
        require(sent, "Transfer failed");
    }

    
    function addJob(uint256 wageInWei, string memory _name) public onlyOwner {
        
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

    
    function hireEmployee(
        uint256 _jobId,
        string memory _name,
        address employeeAddress
    ) 
        public
        onlyOwner 
    {
        
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

   
    function clockIn(uint256 _id) public {
        Employee storage emp = employees[_id];
        
        require(
            emp.employeeAddress == msg.sender, 
            "Not authorized or employee does not exist"
        );
        
        require(emp.clockStamp == 0, "Employee is already clocked in");

        
        emp.clockStamp = block.timestamp;

        emit EmployeeClockedIn(_id, block.timestamp);
    }

    
    function clockOut(uint256 _id) public {
        Employee storage emp = employees[_id];
        
        require(
            emp.employeeAddress == msg.sender, 
            "Not authorized or employee does not exist"
        );
        
        require(emp.clockStamp != 0, "Employee is not clocked in");

        uint256 shiftSeconds = block.timestamp - emp.clockStamp;

        
        uint256 wagePerHour = jobs[emp.jobId].hourlyWageInWei;
        uint256 shiftPay = (shiftSeconds * wagePerHour) / 3600;

        
        emp.employeePension += shiftPay;

       
        emp.clockStamp = 0;

        emit EmployeeClockedOut(
            _id, 
            block.timestamp, 
            shiftSeconds, 
            shiftPay
        );
    }

    
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

    
    function endService() public onlyOwner {
        require(service, "Service is not active");
        service = false;

        
        for (uint256 i = 0; i < POSIds.length; i++) {
            address posAddress = POSMapping[POSIds[i]];
            IPOS(posAddress).payRestaurant();
        }

        
        Service storage currentService = services[nextServiceId];
        currentService.endTime = block.timestamp;

        
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

        
        uint256 serviceEndBalance = address(this).balance;
        uint256 totalRevenue = serviceEndBalance - serviceStartBalance;
        uint256 totalProfit = 0;
        if (totalRevenue > totalCost) {
            totalProfit = totalRevenue - totalCost;
        }

        currentService.cost = totalCost;
        currentService.revenue = totalRevenue;
        currentService.profit = totalProfit;

        
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

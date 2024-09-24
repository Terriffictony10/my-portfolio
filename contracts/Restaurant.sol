// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./POS.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

    event POSCreated(POS pos, uint256 id, address owner);
    event JobAdded(uint256 id, uint256 timestamp, Job job);
    event EmployeeHired(uint256 id, uint256 timestamp, Employee employee);

    bool public service;
    uint256 public serviceStart;
    uint256 public serviceStop;
    uint256 public nextJobId;
    uint256 public nextPOSId;
    uint256 public nextEmployeeId;
    string public name;

    mapping(uint256 => Job) public jobs;
    uint256[] public jobIds;
    mapping(uint256 => Employee) public employees;
    uint256[] public employeeIds;
    mapping(uint256 => POS) public POSMapping;
    uint256[] public POSIds;

    constructor(string memory _name, address _owner) Ownable(_owner) {
        name = _name;
    }

    receive() external payable {}

    function createPOS(string memory _name) public payable returns (uint256, POS) {
        for (uint256 i = 0; i < POSIds.length; i++) {
            uint256 posId = POSIds[i];
            require(
                keccak256(bytes(POSMapping[posId].name())) != keccak256(bytes(_name)),
                "POS with the same name and ID already exists."
            );
        }
        nextPOSId++;
        POS pos = new POS(_name, owner(), address(this));
        POSMapping[nextPOSId] = pos;
        POSIds.push(nextPOSId);
        emit POSCreated(pos, nextPOSId, pos.owner());
        return (nextPOSId, pos);
    }

    function payOwner(uint256 _amount) public {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        (bool sent, ) = owner().call{value: _amount}("");
        require(sent);
    }

    function addJob(uint256 wageInWei, string memory _name) public onlyOwner {
        for (uint256 i = 0; i < jobIds.length; i++) {
            uint256 jobId = jobIds[i];
            require(
                keccak256(bytes(jobs[jobId].jobName)) != keccak256(bytes(_name)),
                "Job with the same name and ID already exists."
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
        service = true;
        serviceStart = block.timestamp;
    }

    function clockIn(uint256 _id) public {
        require(employees[_id].clockStamp == 0, "Already clocked in");
        employees[_id].clockStamp = block.timestamp;
    }

    function clockOut(uint256 _id) public {
        require(employees[_id].clockStamp != 0, "Must clock in first");
        uint256 timeWorked = block.timestamp - employees[_id].clockStamp; // Seconds worked
        uint256 amountEarned = jobs[employees[_id].jobId].hourlyWageInWei * timeWorked / 3600; // Time to be paid in wei
        employees[_id].employeePension += amountEarned;
        employees[_id].clockStamp = 0;
    }

    function endService() public onlyOwner {
        service = false;
        for (uint256 i = 0; i < POSIds.length; i++) {
            POS pos = POSMapping[POSIds[i]];
            pos.payRestaurant();
        }
        for (uint256 i = 0; i < employeeIds.length; i++) {
            if (employees[employeeIds[i]].employeePension > 0) {
                payable(employees[employeeIds[i]].employeeAddress).transfer(employees[employeeIds[i]].employeePension);
                employees[employeeIds[i]].employeePension = 0;
            }
        }
    }
}

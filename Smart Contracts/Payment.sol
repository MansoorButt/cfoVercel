// SPDX-License-Identifier: MIT

//1685300400 time

pragma solidity ^0.8.0;

interface IERC20 {
  function transfer(address to, uint256 amount) external returns (bool);

  //contract address 0x86aF33eB1c2a06F30A212304dB2e607F4141E8Ce
  function balanceOf(address account) external view returns (uint256);

  function transferFrom(address from, address to, uint256 amount) external returns (bool);

  function approve(address spender, uint256 amount) external returns (bool);

  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract Bulk {
  struct MyData {
    uint256 number;
    address addr;
    address sentBy;
    uint256 time;
    bool withdrawn;
    bool paused;
    bool cancelled;
    uint txId;
    address token;
  }

  struct Token {
    address token;
    string name;
    string symbol;
    uint256 depositedAmount;
    uint256 id;
  }

  MyData[] public combinedArray;
  mapping(address => mapping(address => uint)) public balances;
  mapping(address => mapping(address => uint)) public withdrawals;
  mapping(address => uint256[]) public traverseTx; // This is a mapping where we keep track of all Tx_id created on a particular address

  mapping(address => Token[]) public employerTokens;
  mapping(address => mapping(address => uint256)) public employeeBalances;
  mapping(address => mapping(address => bool)) public tokenExist;
  mapping(address => mapping(address => uint)) public tokenID;

  event tokenList(address indexed employer, address indexed token, string name, string symbol, uint256 depositedAmount);
  event EmployeePaid(
    address indexed employee,
    address indexed tokenAddress,
    string name,
    string symbol,
    uint256 amount
  );
  event EmployeeWithdraw(
    address indexed employee,
    address indexed tokenAddress,
    string name,
    string symbol,
    uint256 amount
  );

  uint public count;
  uint public tID;

  function combineArrays(
    uint256[] memory numbers,
    address[] memory addresses,
    uint256[] memory time,
    address token
  ) public {
    require(numbers.length == addresses.length, 'Array lengths must match');
    uint index = combinedArray.length;
    for (uint256 i = 0; i < numbers.length; i++) {
      combinedArray.push(MyData(numbers[i], addresses[i], msg.sender, time[i], false, false, false, count, token));
      traverseTx[addresses[i]].push(count);
      count++;
    }
    sendBulkPayments(index);
  }

  function sendBulkPayments(uint index) public {
    require(combinedArray.length > 0, 'Empty Array');
    for (uint256 i = index; i < combinedArray.length; i++) {
      // token.transfer(combinedArray[i].addr,combinedArray[i].number * (10**18));
      balances[combinedArray[i].addr][combinedArray[i].token] += combinedArray[i].number;
      uint x = tokenID[combinedArray[i].sentBy][combinedArray[i].token];
      employerTokens[combinedArray[i].sentBy][x].depositedAmount -= combinedArray[i].number;
      emit EmployeePaid(
        combinedArray[i].addr,
        combinedArray[i].token,
        employerTokens[combinedArray[i].sentBy][x].name,
        employerTokens[combinedArray[i].sentBy][x].symbol,
        employerTokens[combinedArray[i].sentBy][x].depositedAmount
      );
    }
  }

  function depositToken(address _token, string memory name, string memory symbol, uint256 depositedAmount) external {
    require(bytes(name).length != 0, 'Name cannot be empty');
    require(bytes(symbol).length != 0, 'Symbol cannot be empty');
    require(depositedAmount > 0, 'Deposited amount must be greater than 0');
    require(!tokenExist[msg.sender][_token], 'Token Already Deposited');

    IERC20 token = IERC20(_token);
    require(token.balanceOf(msg.sender) >= depositedAmount, 'Insufficient balance');

    Token memory newToken = Token(_token, name, symbol, depositedAmount, tID);
    employerTokens[msg.sender].push(newToken);
    tokenID[msg.sender][_token] = tID;
    token.transferFrom(msg.sender, address(this), depositedAmount * (10 ** 18));
    tID++;
    emit tokenList(msg.sender, _token, name, symbol, depositedAmount);
  }

  function tokenTopUp(address tokenAddress, uint256 additionalAmount) external {
    require(msg.sender != address(0), 'Invalid employer address');
    uint _tokenId = tokenID[msg.sender][tokenAddress];
    require(additionalAmount > 0, 'Additional amount must be greater than 0');
    IERC20 token = IERC20(tokenAddress);
    token.transferFrom(msg.sender, address(this), additionalAmount * (10 ** 18));
    employerTokens[msg.sender][_tokenId].depositedAmount += additionalAmount;
  }

  function getEmployerTokens(address employer) external view returns (Token[] memory) {
    require(employer != address(0), 'Invalid employer address');
    return employerTokens[employer];
  }

  function withdraw(uint _txId) external {
    MyData storage mydata = combinedArray[_txId];
    require(!mydata.withdrawn, 'Already withdrawn');
    require(block.timestamp >= mydata.time, 'Release time not reached');
    require(mydata.number <= balances[msg.sender][mydata.token], 'Insufficient Balance Availabe');
    uint amount = mydata.number;
    balances[msg.sender][mydata.token] -= amount;
    withdrawals[msg.sender][mydata.token] += amount;
    IERC20 tokenx = IERC20(mydata.token);
    tokenx.transfer(msg.sender, amount * (10 ** 18));
    mydata.withdrawn = true;
  }

  function pauseStream(uint _txId) external {
    MyData storage mydata = combinedArray[_txId];
    require(!mydata.withdrawn, 'Already withdrawn');
    require(!mydata.paused, 'Already Paused');
    mydata.paused = true;
  }

  function resumeStream(uint _txId) external {
    MyData storage mydata = combinedArray[_txId];
    require(!mydata.withdrawn, 'Already withdrawn');
    require(mydata.paused, 'Already Resumed');
    mydata.paused = false;
  }

  function cancelStream(uint _txId) external {
    MyData storage mydata = combinedArray[_txId];
    require(!mydata.withdrawn, 'Already withdrawn');
    require(!mydata.cancelled, 'Already Cancelled');
    uint amount = mydata.number;
    balances[mydata.addr][mydata.token] -= amount;
    mydata.cancelled = true;
  }

  function getAvailableAmount(address _token) public returns (uint, address) {
    //This will mark the status of all available tx as withdrawn=true
    uint totalamount;
    for (uint i = 0; i < traverseTx[msg.sender].length; i++) {
      MyData storage mydata = combinedArray[traverseTx[msg.sender][i]];
      if (!mydata.withdrawn && mydata.time <= block.timestamp && mydata.token == _token) {
        totalamount += mydata.number;
        mydata.withdrawn = true;
      }
    }
    return (totalamount, _token);
  }

  function viewAvailableAmount(address _token) public view returns (uint) {
    // this is only to view Total Amount Available for withdrawal
    uint totalamount;
    for (uint i = 0; i < traverseTx[msg.sender].length; i++) {
      MyData storage mydata = combinedArray[traverseTx[msg.sender][i]];
      if (!mydata.withdrawn && mydata.time <= block.timestamp && mydata.token == _token) {
        totalamount += mydata.number;
      }
    }
    return totalamount;
  }

  function withdrawAll(address _token) external {
    (uint amount, address _tokenx) = getAvailableAmount(_token);
    require(amount > 0, 'Zero Amount available At the Moment');
    balances[msg.sender][_tokenx] -= amount;
    withdrawals[msg.sender][_tokenx] += amount;
    IERC20 tokenx = IERC20(_tokenx);
    tokenx.transfer(msg.sender, amount * (10 ** 18));
  }

  function clearArray() public {
    delete combinedArray;
  }

  function getData() public view returns (MyData[] memory) {
    return combinedArray;
  }

  function getBalance(address _tokenAddress) external view returns (uint256) {
    IERC20 tokenx = IERC20(_tokenAddress);
    return tokenx.balanceOf(address(this));
  }
}

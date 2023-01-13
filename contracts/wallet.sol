//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract MultiSignatureWallet {
    event Deposit(address sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed transactionId, 
        address indexed transactionTo,
        uint256 value, 
        bytes data
    );

    event ConfirmationTransaction(address indexed owner, uint256 indexed transactionId);
    event RevokeConfirmation(address indexed owner, uint256 indexed transactionId);
    event ExecuteTransaction(address indexed owner, uint256 indexed transactionId);

    address[] owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationRequired;

    struct Transaction{
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    mapping(uint256 => mapping(address => bool)) public inConfirmed;

    Transaction[] transactions; 

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Only owner allowed");
        _;
    } 

    modifier transactionExists(uint256 _transactionId) {
        require(
            _transactionId < transactions.length, 
            "Transaction does not exist"
        );
        _;
    }

    modifier notExecuted(uint256 _transactionId){
        require(
            !transactions[_transactionId].executed,
            "transaction already executed"
    );
    _;
    }

    modifier notConfirmed(uint256 _transactionId){
        require(
            !inConfirmed[_transactionId][msg.sender], 
            "transaction already confirmed"
        );
        _;
    }

    constructor(address[] memory _owners, uint256 _numOfConfirmationsRequired){
        require(_owners.length > 0, "owners required");
        require(_numOfConfirmationsRequired > 0 && _numOfConfirmationsRequired <= _owners.length,
        "Invalid number of required confirmations"
    );
    
    for (uint256 i = 0; i < _owners.length; i++){
        address owner = _owners[i];

        require(owner != address(0), "Invalid owner");
        require(!isOwner[owner], "Owner not unique");

        isOwner[owner] = true;
        owners.push(owner);
    }

    numConfirmationRequired = _numOfConfirmationsRequired;

    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _to, 
        uint256 _value,
        bytes memory _data
        ) public onlyOwner {
        uint256 transactionId = transactions.length;

        transactions.push(
            Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, transactionId, _to, _value, _data);
    }

    function confirmationTransaction(uint256 _txIndex) 
        public 
        onlyOwner 
        transactionExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex) {
            Transaction storage transaction = transactions[_txIndex];
            transaction.numConfirmations += 1;
            inConfirmed[_txIndex][msg.sender] = true;

            emit  ConfirmationTransaction(msg.sender, _txIndex);
        }

        function executeTransaction(uint256 _txIndex) 
        public 
        onlyOwner 
        transactionExists(_txIndex)
        notExecuted(_txIndex)
        {
            Transaction storage transaction = transactions[_txIndex];
    
            require(transaction.numConfirmations >= numConfirmationRequired, "cannot execute this transaction");

            transaction.executed = true;
            (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
            require(success, "Transaction falied");

            emit ExecuteTransaction(msg.sender, _txIndex);
        }

        function removeConfirmation(uint256 _txIndex) 
        public
        onlyOwner
        transactionExists(_txIndex)
        notExecuted(_txIndex)
        {
                Transaction storage transaction = transactions[_txIndex];

                require(inConfirmed[_txIndex][msg.sender], "Transaction not confirmated");

                transaction.numConfirmations -= 1;
                inConfirmed[_txIndex][msg.sender] = false;

                emit RevokeConfirmation(msg.sender, _txIndex);
        }

        function getOwners() public view returns(address[] memory) {
            return owners;
        }

        function getTransactionsCount() public view returns (uint256) {
            return transactions.length;
        }

        function getTransaction(uint256 _txIndex) public view returns(
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        ){
            Transaction storage transaction = transactions[_txIndex];
            return (
                transaction.to,
                transaction.value,
                transaction.data,
                transaction.executed,
                transaction.numConfirmations
            );
        }
    
}
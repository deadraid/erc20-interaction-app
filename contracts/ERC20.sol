// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./IERC20.sol";

contract ERC20 is IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner, address indexed spender, uint256 value
    );

    /// @notice Address of the current owner.
    address public owner;
    /// @notice Total number of tokens in existence.
    uint256 public totalSupply;
    /// @notice Mapping from account address to token balance.
    mapping(address => uint256) public balanceOf;
    /// @notice Mapping from owner address to spender address to approved amount.
    mapping(address => mapping(address => uint256)) public allowance;
    /// @notice The name of the token.
    string public name;
    /// @notice The symbol of the token.
    string public symbol;
    /// @notice The number of decimal places the token uses.
    uint8 public decimals;

    modifier onlyOwner {
        require(msg.sender == owner, "ERC20: caller is not the owner");
        _;
    }

    /// @notice Sets the values for {name}, {symbol}, {decimals}, and {owner}.
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
    }

    /// @notice See {IERC20-transfer}.
    function transfer(address recipient, uint256 amount)
        external
        override
        returns (bool)
    {
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;

        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    /// @notice See {IERC20-approve}.
    function approve(address spender, uint256 amount)
        external
        override
        returns (bool)
    {
        require(spender != address(0), "ERC20: approve to the zero address");

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice See {IERC20-transferFrom}.
    function transferFrom(address sender, address recipient, uint256 amount)
        external
        override
        returns (bool)
    {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[sender] >= amount, "ERC20: transfer amount exceeds balance");

        uint256 currentAllowance = allowance[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");

        if (currentAllowance != type(uint256).max) {
             allowance[sender][msg.sender] = currentAllowance - amount;
        }
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;

        emit Transfer(sender, recipient, amount);
        return true;
    }

    /// @notice Internal function to mint tokens.
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "ERC20: mint to the zero address");

        totalSupply += amount;
        balanceOf[to] += amount;

        emit Transfer(address(0), to, amount);
    }

    /// @notice Internal function to burn tokens.
    function _burn(address from, uint256 amount) internal {
        require(from != address(0), "ERC20: burn from the zero address");
        require(balanceOf[from] >= amount, "ERC20: burn amount exceeds balance");

        balanceOf[from] -= amount;
        totalSupply -= amount;

        emit Transfer(from, address(0), amount);
    }

    /// @notice Creates `amount` tokens and assigns them to `to`. Emits a {Transfer} event.
    /// @dev Only the owner can call this function.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Destroys `amount` tokens from the caller. Emits a {Transfer} event.
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice Destroys `amount` tokens from `account`, deducting from the caller's allowance.
    /// Emits a {Transfer} event.
    function burnFrom(address account, uint256 amount) external {
         require(account != address(0), "ERC20: burn from the zero address");

         uint256 currentAllowance = allowance[account][msg.sender];
         require(currentAllowance >= amount, "ERC20: burn amount exceeds allowance");

         if (currentAllowance != type(uint256).max) {
             allowance[account][msg.sender] = currentAllowance - amount;
         }
         _burn(account, amount);
     }

    /// @notice Transfers ownership of the contract to a new account (`newOwner`).
    /// @dev Only the current owner can call this function.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ERC20: new owner is the zero address");
        owner = newOwner;
    }
} 

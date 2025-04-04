const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ERC20 Token', function () {
  // Contract instance and signers
  let token;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Constants for token info
  const TOKEN_NAME = 'Test Token';
  const TOKEN_SYMBOL = 'TST';
  const TOKEN_DECIMALS = 18;
  const INITIAL_MINT = ethers.parseUnits('1000', TOKEN_DECIMALS);
  const TRANSFER_AMOUNT = ethers.parseUnits('100', TOKEN_DECIMALS);

  // Setup for each test
  beforeEach(async function () {
    // ARRANGE: Setup the contract and accounts
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const ERC20Factory = await ethers.getContractFactory('ERC20');
    token = await ERC20Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS);

    // Mint some tokens to owner for testing
    await token.mint(owner.address, INITIAL_MINT);
  });

  // Test basic token information
  describe('Token Information', function () {
    it('should have the correct name', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      const name = await token.name();

      // ASSERT
      expect(name).to.equal(TOKEN_NAME);
    });

    it('should have the correct symbol', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      const symbol = await token.symbol();

      // ASSERT
      expect(symbol).to.equal(TOKEN_SYMBOL);
    });

    it('should have the correct decimals', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      const decimals = await token.decimals();

      // ASSERT
      expect(decimals).to.equal(TOKEN_DECIMALS);
    });

    it('should have the correct total supply after minting', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      const totalSupply = await token.totalSupply();

      // ASSERT
      expect(totalSupply).to.equal(INITIAL_MINT);
    });

    it('should assign the total supply to the owner', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      const ownerBalance = await token.balanceOf(owner.address);

      // ASSERT
      expect(ownerBalance).to.equal(INITIAL_MINT);
    });
  });

  // Test basic transfer functionality
  describe('Transfer', function () {
    it('should transfer tokens correctly', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      await token.transfer(addr1.address, TRANSFER_AMOUNT);
      const addr1Balance = await token.balanceOf(addr1.address);
      const ownerBalance = await token.balanceOf(owner.address);

      // ASSERT
      expect(addr1Balance).to.equal(TRANSFER_AMOUNT);
      expect(ownerBalance).to.equal(INITIAL_MINT - TRANSFER_AMOUNT);
    });

    it('should emit Transfer event', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(token.transfer(addr1.address, TRANSFER_AMOUNT))
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, addr1.address, TRANSFER_AMOUNT);
    });

    it('should fail if sender does not have enough tokens', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.connect(addr1).transfer(addr2.address, TRANSFER_AMOUNT),
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
    });

    it('should fail when transferring to the zero address', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.transfer(ethers.ZeroAddress, TRANSFER_AMOUNT),
      ).to.be.revertedWith('ERC20: transfer to the zero address');
    });
  });

  // Test approval mechanism
  describe('Approval & TransferFrom', function () {
    const APPROVAL_AMOUNT = ethers.parseUnits('200', TOKEN_DECIMALS);

    it('should approve tokens correctly', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      await token.approve(addr1.address, APPROVAL_AMOUNT);
      const allowance = await token.allowance(owner.address, addr1.address);

      // ASSERT
      expect(allowance).to.equal(APPROVAL_AMOUNT);
    });

    it('should emit Approval event', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(token.approve(addr1.address, APPROVAL_AMOUNT))
        .to.emit(token, 'Approval')
        .withArgs(owner.address, addr1.address, APPROVAL_AMOUNT);
    });

    it('should transferFrom correctly when approved', async function () {
      // ARRANGE
      await token.approve(addr1.address, APPROVAL_AMOUNT);

      // ACT
      await token
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, TRANSFER_AMOUNT);

      const ownerBalance = await token.balanceOf(owner.address);
      const addr2Balance = await token.balanceOf(addr2.address);
      const remainingAllowance = await token.allowance(
        owner.address,
        addr1.address,
      );

      // ASSERT
      expect(ownerBalance).to.equal(INITIAL_MINT - TRANSFER_AMOUNT);
      expect(addr2Balance).to.equal(TRANSFER_AMOUNT);
      expect(remainingAllowance).to.equal(APPROVAL_AMOUNT - TRANSFER_AMOUNT);
    });

    it('should not reduce allowance if it is set to maximum value', async function () {
      // ARRANGE
      const MAX_UINT256 = ethers.MaxUint256;
      await token.approve(addr1.address, MAX_UINT256);

      // ACT
      await token
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, TRANSFER_AMOUNT);

      const remainingAllowance = await token.allowance(
        owner.address,
        addr1.address,
      );

      // ASSERT
      expect(remainingAllowance).to.equal(MAX_UINT256);
    });

    it('should fail if transferFrom without approval', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, TRANSFER_AMOUNT),
      ).to.be.revertedWith('ERC20: transfer amount exceeds allowance');
    });

    it('should fail if transferFrom with insufficient approved amount', async function () {
      // ARRANGE
      const smallApproval = ethers.parseUnits('50', TOKEN_DECIMALS);
      await token.approve(addr1.address, smallApproval);

      // ACT & ASSERT
      await expect(
        token
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, TRANSFER_AMOUNT),
      ).to.be.revertedWith('ERC20: transfer amount exceeds allowance');
    });

    it('should fail when approving to the zero address', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.approve(ethers.ZeroAddress, APPROVAL_AMOUNT),
      ).to.be.revertedWith('ERC20: approve to the zero address');
    });
  });

  // Test minting functionality
  describe('Minting', function () {
    const MINT_AMOUNT = ethers.parseUnits('500', TOKEN_DECIMALS);

    it('should allow only owner to mint tokens', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      await token.mint(addr1.address, MINT_AMOUNT);
      const addr1Balance = await token.balanceOf(addr1.address);
      const totalSupply = await token.totalSupply();

      // ASSERT
      expect(addr1Balance).to.equal(MINT_AMOUNT);
      expect(totalSupply).to.equal(INITIAL_MINT + MINT_AMOUNT);
    });

    it('should emit Transfer event on mint', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(token.mint(addr1.address, MINT_AMOUNT))
        .to.emit(token, 'Transfer')
        .withArgs(ethers.ZeroAddress, addr1.address, MINT_AMOUNT);
    });

    it('should fail when non-owner tries to mint', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.connect(addr1).mint(addr1.address, MINT_AMOUNT),
      ).to.be.revertedWith('ERC20: caller is not the owner');
    });

    it('should fail when minting to the zero address', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.mint(ethers.ZeroAddress, MINT_AMOUNT),
      ).to.be.revertedWith('ERC20: mint to the zero address');
    });
  });

  // Test burning functionality
  describe('Burning', function () {
    const BURN_AMOUNT = ethers.parseUnits('300', TOKEN_DECIMALS);

    beforeEach(async function () {
      // Additional ARRANGE for burn tests
      await token.transfer(addr1.address, TRANSFER_AMOUNT);
    });

    it('should allow token holders to burn their tokens', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      await token.connect(addr1).burn(TRANSFER_AMOUNT);
      const addr1Balance = await token.balanceOf(addr1.address);
      const totalSupply = await token.totalSupply();

      // ASSERT
      expect(addr1Balance).to.equal(0);
      expect(totalSupply).to.equal(INITIAL_MINT - TRANSFER_AMOUNT);
    });

    it('should emit Transfer event on burn', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(token.connect(addr1).burn(TRANSFER_AMOUNT))
        .to.emit(token, 'Transfer')
        .withArgs(addr1.address, ethers.ZeroAddress, TRANSFER_AMOUNT);
    });

    it('should fail if burning more than balance', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(token.connect(addr1).burn(BURN_AMOUNT)).to.be.revertedWith(
        'ERC20: burn amount exceeds balance',
      );
    });

    it('should allow burnFrom with allowance', async function () {
      // ARRANGE
      await token.connect(addr1).approve(owner.address, TRANSFER_AMOUNT);

      // ACT
      await token.connect(owner).burnFrom(addr1.address, TRANSFER_AMOUNT);
      const addr1Balance = await token.balanceOf(addr1.address);
      const totalSupply = await token.totalSupply();

      // ASSERT
      expect(addr1Balance).to.equal(0);
      expect(totalSupply).to.equal(INITIAL_MINT - TRANSFER_AMOUNT);
    });

    it('should fail when burnFrom without allowance', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.connect(addr2).burnFrom(addr1.address, TRANSFER_AMOUNT),
      ).to.be.revertedWith('ERC20: burn amount exceeds allowance');
    });
  });

  // Test ownership functionality
  describe('Ownership', function () {
    it('should have the correct initial owner', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      const contractOwner = await token.owner();

      // ASSERT
      expect(contractOwner).to.equal(owner.address);
    });

    it('should allow owner to transfer ownership', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      await token.transferOwnership(addr1.address);
      const newOwner = await token.owner();

      // ASSERT
      expect(newOwner).to.equal(addr1.address);
    });

    it('should fail when non-owner tries to transfer ownership', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.connect(addr1).transferOwnership(addr2.address),
      ).to.be.revertedWith('ERC20: caller is not the owner');
    });

    it('should fail when transferring ownership to the zero address', async function () {
      // ARRANGE is done in beforeEach

      // ACT & ASSERT
      await expect(
        token.transferOwnership(ethers.ZeroAddress),
      ).to.be.revertedWith('ERC20: new owner is the zero address');
    });
  });

  // Test edge cases and security considerations
  describe('Edge Cases & Security', function () {
    it('should not allow minting after ownership transfer', async function () {
      // ARRANGE
      await token.transferOwnership(addr1.address);

      // ACT & ASSERT - First check original owner can't mint
      await expect(
        token.mint(addr2.address, TRANSFER_AMOUNT),
      ).to.be.revertedWith('ERC20: caller is not the owner');

      // ACT - Then check new owner can mint
      await token.connect(addr1).mint(addr2.address, TRANSFER_AMOUNT);
      const addr2Balance = await token.balanceOf(addr2.address);

      // ASSERT
      expect(addr2Balance).to.equal(TRANSFER_AMOUNT);
    });

    it('should handle zero token transfers correctly', async function () {
      // ARRANGE
      const initialOwnerBalance = await token.balanceOf(owner.address);
      const initialAddr1Balance = await token.balanceOf(addr1.address);

      // ACT
      await token.transfer(addr1.address, 0);
      const finalOwnerBalance = await token.balanceOf(owner.address);
      const finalAddr1Balance = await token.balanceOf(addr1.address);

      // ASSERT
      expect(finalOwnerBalance).to.equal(initialOwnerBalance);
      expect(finalAddr1Balance).to.equal(initialAddr1Balance);
    });

    it('should handle multiple transfers correctly', async function () {
      // ARRANGE is done in beforeEach

      // ACT
      await token.transfer(addr1.address, TRANSFER_AMOUNT);
      await token.transfer(addr2.address, TRANSFER_AMOUNT);

      const addr1Balance = await token.balanceOf(addr1.address);
      const addr2Balance = await token.balanceOf(addr2.address);
      const ownerBalance = await token.balanceOf(owner.address);

      // ASSERT
      expect(addr1Balance).to.equal(TRANSFER_AMOUNT);
      expect(addr2Balance).to.equal(TRANSFER_AMOUNT);
      expect(ownerBalance).to.equal(INITIAL_MINT - TRANSFER_AMOUNT * 2n);
    });

    it('should correctly handle allowance updates', async function () {
      // ARRANGE
      await token.approve(addr1.address, TRANSFER_AMOUNT);

      // ACT
      const newAllowance = ethers.parseUnits('50', TOKEN_DECIMALS);
      await token.approve(addr1.address, newAllowance);
      const currentAllowance = await token.allowance(
        owner.address,
        addr1.address,
      );

      // ASSERT
      expect(currentAllowance).to.equal(newAllowance);
    });
  });
});

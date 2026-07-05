const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PetitionPlatform", function () {
  let contract;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const PetitionPlatform = await ethers.getContractFactory("PetitionPlatform");
    contract = await PetitionPlatform.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ──
  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should start with zero petitions", async function () {
      expect(await contract.getTotalPetitions()).to.equal(0);
    });
  });

  // ── Creating Petitions ──
  describe("createPetition", function () {
    it("should create a petition and emit event", async function () {
      await expect(
        contract.connect(user1).createPetition("Save the Ocean", "We need clean oceans", "Environment", 30)
      )
        .to.emit(contract, "PetitionCreated")
        .withArgs(1, user1.address, "Save the Ocean", "Environment", await getDeadline(30));
    });

    it("should increment petitionCount", async function () {
      await contract.connect(user1).createPetition("Title", "Description", "Category", 7);
      expect(await contract.getTotalPetitions()).to.equal(1);
    });

    it("should store petition data correctly", async function () {
      await contract.connect(user1).createPetition("Save the Ocean", "We need clean oceans", "Environment", 30);
      const petition = await contract.getPetition(1);
      expect(petition.title).to.equal("Save the Ocean");
      expect(petition.creator).to.equal(user1.address);
      expect(petition.signatureCount).to.equal(0);
      expect(petition.active).to.equal(true);
    });

    it("should revert with empty title", async function () {
      await expect(
        contract.createPetition("", "Description", "Category", 7)
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("should revert with title over 100 chars", async function () {
      await expect(
        contract.createPetition("a".repeat(101), "Description", "Category", 7)
      ).to.be.revertedWith("Title too long (max 100 chars)");
    });

    it("should revert with duration of 0 days", async function () {
      await expect(
        contract.createPetition("Title", "Description", "Category", 0)
      ).to.be.revertedWith("Duration must be at least 1 day");
    });

    it("should revert with duration over 365 days", async function () {
      await expect(
        contract.createPetition("Title", "Description", "Category", 366)
      ).to.be.revertedWith("Duration cannot exceed 365 days");
    });
  });

  // ── Signing Petitions ──
  describe("signPetition", function () {
    beforeEach(async function () {
      await contract.connect(user1).createPetition("Save the Ocean", "Description", "Environment", 30);
    });

    it("should allow a wallet to sign a petition", async function () {
      await expect(contract.connect(user2).signPetition(1))
        .to.emit(contract, "PetitionSigned")
        .withArgs(1, user2.address, 1);
    });

    it("should increment signature count", async function () {
      await contract.connect(user2).signPetition(1);
      await contract.connect(user3).signPetition(1);
      const petition = await contract.getPetition(1);
      expect(petition.signatureCount).to.equal(2);
    });

    it("should record hasSigned correctly", async function () {
      await contract.connect(user2).signPetition(1);
      expect(await contract.hasWalletSigned(1, user2.address)).to.equal(true);
      expect(await contract.hasWalletSigned(1, user3.address)).to.equal(false);
    });

    it("should revert if wallet signs twice", async function () {
      await contract.connect(user2).signPetition(1);
      await expect(contract.connect(user2).signPetition(1))
        .to.be.revertedWith("You already signed this petition");
    });

    it("should revert if petition deadline has passed", async function () {
      await time.increase(31 * 24 * 60 * 60); // advance 31 days
      await expect(contract.connect(user2).signPetition(1))
        .to.be.revertedWith("Petition deadline has passed");
    });

    it("should revert if petition does not exist", async function () {
      await expect(contract.connect(user2).signPetition(99))
        .to.be.revertedWith("Petition does not exist");
    });
  });

  // ── Owner: Remove Petition ──
  describe("removePetition", function () {
    beforeEach(async function () {
      await contract.connect(user1).createPetition("Bad Petition", "Description", "Other", 7);
    });

    it("should allow owner to remove a petition", async function () {
      await expect(contract.connect(owner).removePetition(1, "Violates platform rules"))
        .to.emit(contract, "PetitionRemoved")
        .withArgs(1, owner.address, "Violates platform rules");

      const petition = await contract.getPetition(1);
      expect(petition.active).to.equal(false);
    });

    it("should prevent signing a removed petition", async function () {
      await contract.connect(owner).removePetition(1, "Spam");
      await expect(contract.connect(user2).signPetition(1))
        .to.be.revertedWith("Petition has been removed");
    });

    it("should revert if non-owner tries to remove", async function () {
      await expect(contract.connect(user1).removePetition(1, "I don't like it"))
        .to.be.revertedWith("Not the platform owner");
    });

    it("should revert with empty reason", async function () {
      await expect(contract.connect(owner).removePetition(1, ""))
        .to.be.revertedWith("Must provide a reason");
    });
  });

  // ── View Functions ──
  describe("View functions", function () {
    beforeEach(async function () {
      await contract.connect(user1).createPetition("Petition 1", "Desc", "Category", 30);
      await contract.connect(user2).signPetition(1);
      await contract.connect(user3).signPetition(1);
    });

    it("should return correct signers list", async function () {
      const signersList = await contract.getSigners(1);
      expect(signersList).to.include(user2.address);
      expect(signersList).to.include(user3.address);
      expect(signersList.length).to.equal(2);
    });

    it("should return isPetitionOpen as true for active petition", async function () {
      expect(await contract.isPetitionOpen(1)).to.equal(true);
    });

    it("should return isPetitionOpen as false after deadline", async function () {
      await time.increase(31 * 24 * 60 * 60);
      expect(await contract.isPetitionOpen(1)).to.equal(false);
    });

    it("should return all petition IDs", async function () {
      await contract.connect(user1).createPetition("Petition 2", "Desc", "Category", 7);
      const ids = await contract.getAllPetitionIds();
      expect(ids.length).to.equal(2);
    });
  });

  // ── Ownership ──
  describe("transferOwnership", function () {
    it("should transfer ownership", async function () {
      await contract.connect(owner).transferOwnership(user1.address);
      expect(await contract.owner()).to.equal(user1.address);
    });

    it("sho

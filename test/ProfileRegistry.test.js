const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProfileRegistry", function () {
  let registry;
  let user1, user2;

  beforeEach(async function () {
    [, user1, user2] = await ethers.getSigners();
    const ProfileRegistry = await ethers.getContractFactory("ProfileRegistry");
    registry = await ProfileRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("setProfile", function () {
    it("should create a profile and emit event", async function () {
      await expect(registry.connect(user1).setProfile("alice", "Ocean lover"))
        .to.emit(registry, "ProfileSet")
        .withArgs(user1.address, "alice", "Ocean lover");

      const [username, bio, , exists] = await registry.getProfile(user1.address);
      expect(username).to.equal("alice");
      expect(bio).to.equal("Ocean lover");
      expect(exists).to.equal(true);
    });

    it("should enforce case-insensitive username uniqueness", async function () {
      await registry.connect(user1).setProfile("Alice", "bio");
      await expect(registry.connect(user2).setProfile("ALICE", "other bio"))
        .to.be.revertedWith("Username already taken");
    });

    it("should let the same wallet keep its username when updating", async function () {
      await registry.connect(user1).setProfile("alice", "v1");
      await registry.connect(user1).setProfile("alice", "v2");
      const [, bio] = await registry.getProfile(user1.address);
      expect(bio).to.equal("v2");
    });

    it("should free the old username when the user renames", async function () {
      await registry.connect(user1).setProfile("alice", "bio");
      await registry.connect(user1).setProfile("alice2", "bio");
      // "alice" is now available for someone else
      await registry.connect(user2).setProfile("alice", "taken over");
      const [username] = await registry.getProfile(user2.address);
      expect(username).to.equal("alice");
    });

    it("should revert on empty username", async function () {
      await expect(registry.connect(user1).setProfile("", "bio"))
        .to.be.revertedWith("Username cannot be empty");
    });

    it("should revert on username over 24 chars", async function () {
      await expect(registry.connect(user1).setProfile("a".repeat(25), "bio"))
        .to.be.revertedWith("Username too long (max 24 chars)");
    });

    it("should revert on bio over 160 chars", async function () {
      await expect(registry.connect(user1).setProfile("alice", "b".repeat(161)))
        .to.be.revertedWith("Bio too long (max 160 chars)");
    });
  });

  describe("clearProfile", function () {
    it("should clear the profile and release the username", async function () {
      await registry.connect(user1).setProfile("alice", "bio");
      await expect(registry.connect(user1).clearProfile())
        .to.emit(registry, "ProfileCleared")
        .withArgs(user1.address);

      const [, , , exists] = await registry.getProfile(user1.address);
      expect(exists).to.equal(false);
      expect(await registry.isUsernameAvailable("alice")).to.equal(true);
    });

    it("should revert when there is no profile to clear", async function () {
      await expect(registry.connect(user1).clearProfile())
        .to.be.revertedWith("No profile to clear");
    });
  });

  describe("isUsernameAvailable", function () {
    it("should report availability correctly", async function () {
      expect(await registry.isUsernameAvailable("bob")).to.equal(true);
      await registry.connect(user1).setProfile("bob", "bio");
      expect(await registry.isUsernameAvailable("bob")).to.equal(false);
      expect(await registry.isUsernameAvailable("BOB")).to.equal(false);
    });
  });
});

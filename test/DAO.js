const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
  let token, accounts, DAO, funder, deployer,
  investor1, 
  investor2, 
  investor3, 
  investor4, 
  investor5, 
  recipient,
  user
  
  beforeEach(async () => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    funder = accounts[1]
    investor1 = accounts[2]
    investor2 = accounts[3]
    investor3 = accounts[4]
    investor4 = accounts[5]
    investor5 = accounts[6]
    recipient = accounts[7]
    user = accounts[8]
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Decentratality', 'DHPT', '1000000')

    transaction = await token.connect(deployer).transfer(investor1.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor2.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor3.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor4.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor5.address, tokens(200000))
    await transaction.wait()

    const Dao = await ethers.getContractFactory("DAO")
    DAO = await Dao.deploy(token.target, '500000000000000000000001')

    

    await funder.sendTransaction({ to: DAO.target, value: ether(100) })
    
  })

  describe('Deployment', () => {
    it('sends Ether to the DAO treasury', async () => {
      expect(await ethers.provider.getBalance(DAO.target)).to.equal(ether(100))
    })

    it('returns token address', async () => {
      expect(await DAO.token()).to.equal(token.target)
    })
    it('returns quorum', async () => {
      expect(await DAO.quorum()).to.equal('500000000000000000000001')
    })

    

  })

  describe('Proposal Creation', () => {
    let transaction, result
      describe('Success', () => {
        
        beforeEach(async () => {
          transaction = await DAO.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
          result = await transaction.wait()
        })

        it('updates proposal count', async () => {
          expect(await DAO.proposalCount()).to.equal(1)
        })
        it('updates proposal mapping', async () => {
          const proposal = await DAO.proposals(1)
          expect(proposal.id).to.equal(1)
          expect(proposal.amount).to.equal(ether(100))
          expect(proposal.recipient).to.equal(recipient.address)

        })
        it('emits a propose event', async () => {
          await expect(transaction).to.emit(DAO, 'Propose')
          .withArgs(1, ether(100), recipient.address, investor1.address)

        })



      })

      describe('Failure', () => {
        it('rejects invalid amount', async () => {
          await expect(DAO.connect(investor1).createProposal('Proposal 1', ether(1000), recipient.address)).to.be.reverted
        })

        it('rejects non-investor', async () => {
          await expect(DAO.connect(user).createProposal('Proposal 1', ether(100), recipient.address)).to.be.reverted
        })
      })
  })

  describe('Voting', () => {
    let transaction, result

    describe('Success', () => {
      beforeEach(async () => {
      transaction = await DAO.connect(investor1).vote(1)
      result = await transaction.wait()
      })

      it('updates vote count', async () => {
      const proposal = await DAO.proposals(1)
      expect(proposal.votes).to.equal(tokens(200000))
      })

      it('emits vote event', async () => {
      
      await expect(transaction).to.emit(DAO, "Vote")
        .withArgs(1, investor1.address)
      })
    })
    describe('Failure', () => {
      it('rejects non-investor', async () => {
      await expect(DAO.connect(user).vote(1)).to.be.reverted
      })
      it('rejects double voting', async () => {
      transaction = await DAO.connect(investor1).vote(1)
      result = await transaction.wait()

      await expect(DAO.connect(investor1).vote(1)).to.be.reverted
      })
    })
    
    
  })
  describe('Governance', () => {
    let transaction, result

    describe('Success', () => {

      beforeEach(async () => {
        // Create proposal
        transaction = await DAO.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
        result = await transaction.wait()

        // Vote
        transaction = await DAO.connect(investor1).vote(1)
        result = await transaction.wait()

        transaction = await DAO.connect(investor2).vote(1)
        result = await transaction.wait()

        transaction = await DAO.connect(investor3).vote(1)
        result = await transaction.wait()

        // Finalize proposal
        transaction = await DAO.connect(investor1).finalizeProposal(1)
        result = await transaction.wait()
      })

      it('transfers funds to recipient', async () => {
        expect(await ethers.provider.getBalance(recipient.address)).to.equal(tokens(10100))
      })

      it('it updates the proposal to finalized', async () => {
        const proposal = await DAO.proposals(1)
        expect(proposal.finalized).to.equal(true)
      })

      it('emits a Finalize event', async () => {
        await expect(transaction).to.emit(DAO, "Finalize")
          .withArgs(1)
      })

    })

    describe('Failure', () => {

      beforeEach(async () => {
        // Create proposal
        transaction = await DAO.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
        result = await transaction.wait()

        // Vote
        transaction = await DAO.connect(investor1).vote(1)
        result = await transaction.wait()

        transaction = await DAO.connect(investor2).vote(1)
        result = await transaction.wait()
      })


      it('rejects finalization if not enough votes', async () => {
        await expect(DAO.connect(investor1).finalizeProposal(1)).to.be.reverted
      })

      it('rejects finalization from a non-investor', async () => {
        // Vote 3
        transaction = await DAO.connect(investor3).vote(1)
        result = await transaction.wait()

        await expect(DAO.connect(user).finalizeProposal(1)).to.be.reverted
      })

      it('rejects proposal if already finalized', async () => {
        // Vote 3
        transaction = await DAO.connect(investor3).vote(1)
        result = await transaction.wait()

        // Finalize
        transaction = await DAO.connect(investor1).finalizeProposal(1)
        result = await transaction.wait()

        // Try to finalize again
        await expect(DAO.connect(investor1).finalizeProposal(1)).to.be.reverted
      })

    })
  })

 

})
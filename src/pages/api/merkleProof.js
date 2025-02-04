import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

let whitelist = [];
let merkleTree = null;
let merkleRoot = null;

function updateMerkleTree() {
  const leaves = whitelist.map((addr) => keccak256(addr));
  merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  merkleRoot = merkleTree.getHexRoot();
}

export default function handler(req, res) {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  const lowerCaseAddress = address.toLowerCase();
  if (!whitelist.includes(lowerCaseAddress)) {
    whitelist.push(lowerCaseAddress);
    updateMerkleTree();
  }
  const leaf = keccak256(lowerCaseAddress);
  const proof = merkleTree.getHexProof(leaf);
  res.status(200).json({ proof, merkleRoot });
}

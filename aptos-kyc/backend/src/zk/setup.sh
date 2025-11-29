#!/bin/bash

# ZK Circuit Setup Script
# This script compiles the Circom circuit and generates proving/verification keys
# Run this once before using the ZK proof system

echo "Setting up ZK proof system..."

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "Error: circom not found. Please install circom first."
    echo "Visit: https://docs.circom.io/getting-started/installation/"
    exit 1
fi

# Check if snarkjs is installed
if ! command -v snarkjs &> /dev/null; then
    echo "Error: snarkjs not found. Installing via npm..."
    npm install -g snarkjs
fi

# Create build directory
mkdir -p build
cd build

# Step 1: Compile circuit
echo "Step 1: Compiling circuit..."
circom ../circuit.circom --r1cs --wasm --sym -o .

if [ $? -ne 0 ]; then
    echo "Error: Circuit compilation failed"
    exit 1
fi

echo "Circuit compiled successfully"

# Step 2: Powers of Tau ceremony (for testing, use small powers)
echo "Step 2: Setting up Powers of Tau..."
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

echo "Step 3: Contributing to ceremony..."
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v -e="random entropy"

echo "Step 4: Preparing phase 2..."
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# Step 5: Generate zkey
echo "Step 5: Generating proving key..."
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey

echo "Step 6: Contributing to phase 2..."
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="1st Contributor" -v -e="more random entropy"

# Step 7: Export verification key
echo "Step 7: Exporting verification key..."
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

echo ""
echo "✅ ZK setup complete!"
echo "Generated files:"
echo "  - circuit.wasm (WASM for witness generation)"
echo "  - circuit_final.zkey (Proving key)"
echo "  - verification_key.json (Verification key)"
echo ""
echo "Move these files to the src/zk directory to use them."

# Copy files to parent directory
cp circuit.wasm ../
cp circuit_final.zkey ../
cp verification_key.json ../

echo "Files copied to src/zk/"
cd ..

echo "Setup complete! You can now generate proofs."

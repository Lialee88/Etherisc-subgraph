import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DipToken, Transfer } from "../generated/DipToken/DipToken";
import { DIPToken, Transaction, WalletBalance } from "../generated/schema";
import { toDecimal, toDecimalExponent } from "./utils";

export function handleTransfer(event: Transfer): void {
	let contract = DipToken.bind(event.address);
	let totalSupply: BigDecimal;
  let tokenAddress = event.address.toHex();
  
	let fromAddress = event.params.from.toHex();
	let toAddress = event.params.to.toHex();

	let totalSupplyContract = contract.totalSupply();
	let decimals = contract.decimals();
	let decimalsTotal = toDecimalExponent(decimals);
	let decimalTotalSupply = toDecimal(totalSupplyContract, decimalsTotal);
	totalSupply = decimalTotalSupply;
	let transferAmount = toDecimal(event.params.value, decimalsTotal);
	let timestamp = event.block.timestamp;

	let token = DIPToken.load(tokenAddress);
	let transferId = event.transaction.hash.toHex();

	if (!token) {
    if (tokenAddress == '0xc719d010b63e5bbf2c0551872cd5316ed26acd83') {
      let tokenSymbol = 'DIP'
      let tokenName = 'Decentralized Insurance Protocol'
      initToken(tokenAddress, tokenSymbol, tokenName, totalSupply, token);
    }
	}

	recordTransaction(
		transferId,
		fromAddress,
		toAddress,
		transferAmount,
		timestamp
	);

	recordBalance(fromAddress, toAddress, transferAmount);
}

function initToken(
  address: string,
  symbol: string,
  name: string,
	totalSupply: BigDecimal,
	token: DIPToken | null
): void {
	token = new DIPToken(address);
  token.symbol = symbol.toString();
  token.name = name.toString();
  token.totalSupply = totalSupply;
	token.save();
}

function initBalance(address: string): void {
	let balance = WalletBalance.load(address);
	if (balance === null && !address.startsWith("0x000000")) {
		balance = new WalletBalance(address);
		balance.amount = BigDecimal.fromString("0");
		balance.save();
	}
}

function recordTransaction(
	transferId: string,
	fromAddress: string,
	toAddress: string,
	transferAmount: BigDecimal,
	timestamp: BigInt
): void {
	let transaction = new Transaction(transferId);
	transaction.from_address = fromAddress;
	transaction.to_address = toAddress;
	transaction.amount = transferAmount;
	transaction.timestamp = timestamp;
	transaction.save();
}

function recordBalance(
	fromAddress: string,
	toAddress: string,
	transferAmount: BigDecimal
): void {
	initBalance(fromAddress);
	initBalance(toAddress);

	let fromBalance = WalletBalance.load(fromAddress);
	let toBalance = WalletBalance.load(toAddress);

	if (fromBalance !== null) {
		fromBalance.amount = fromBalance.amount.minus(transferAmount);
		fromBalance.save();
	}
	if (toBalance !== null) {
		toBalance.amount = toBalance.amount.plus(transferAmount);
		toBalance.save();
	}
}


import { BigInt, BigDecimal, log } from "@graphprotocol/graph-ts";

export function toDecimalExponent(decimals: BigInt): BigInt {
	// log.debug("My value is: {}", [decimals.toString()]);
	let decimalTotal = BigInt.fromI32(10);
	for (
		let i = BigInt.fromI32(1);
		i.lt(decimals);
		i = i.plus(BigInt.fromI32(1))
	) {
		decimalTotal = decimalTotal.times(BigInt.fromI32(10));
	}
	return decimalTotal;
}

export function toDecimal(
	amount: BigInt,
	decimalTotal: BigInt
): BigDecimal {
	return amount.toBigDecimal().div(decimalTotal.toBigDecimal());
}

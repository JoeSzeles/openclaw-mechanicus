import { s as getPairingAdapter } from "./pairing-store-CsSXI6EC.js";

//#region src/pairing/pairing-labels.ts
function resolvePairingIdLabel(channel) {
	return getPairingAdapter(channel)?.idLabel ?? "userId";
}

//#endregion
export { resolvePairingIdLabel as t };
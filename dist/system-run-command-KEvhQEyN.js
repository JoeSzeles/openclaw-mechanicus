import path from "node:path";

//#region src/infra/system-run-command.ts
function basenameLower(token) {
	const win = path.win32.basename(token);
	const posix = path.posix.basename(token);
	return (win.length < posix.length ? win : posix).trim().toLowerCase();
}
function formatExecCommand(argv) {
	return argv.map((arg) => {
		const trimmed = arg.trim();
		if (!trimmed) return "\"\"";
		if (!/\s|"/.test(trimmed)) return trimmed;
		return `"${trimmed.replace(/"/g, "\\\"")}"`;
	}).join(" ");
}
function extractShellCommandFromArgv(argv) {
	const token0 = argv[0]?.trim();
	if (!token0) return null;
	const base0 = basenameLower(token0);
	if (base0 === "sh" || base0 === "bash" || base0 === "zsh" || base0 === "dash" || base0 === "ksh") {
		const flag = argv[1]?.trim();
		if (flag !== "-lc" && flag !== "-c") return null;
		const cmd = argv[2];
		return typeof cmd === "string" ? cmd : null;
	}
	if (base0 === "cmd.exe" || base0 === "cmd") {
		const idx = argv.findIndex((item) => String(item).trim().toLowerCase() === "/c");
		if (idx === -1) return null;
		const cmd = argv[idx + 1];
		return typeof cmd === "string" ? cmd : null;
	}
	return null;
}
function validateSystemRunCommandConsistency(params) {
	const raw = typeof params.rawCommand === "string" && params.rawCommand.trim().length > 0 ? params.rawCommand.trim() : null;
	const shellCommand = extractShellCommandFromArgv(params.argv);
	const inferred = shellCommand ? shellCommand.trim() : formatExecCommand(params.argv);
	if (raw && raw !== inferred) return {
		ok: false,
		message: "INVALID_REQUEST: rawCommand does not match command",
		details: {
			code: "RAW_COMMAND_MISMATCH",
			rawCommand: raw,
			inferred
		}
	};
	return {
		ok: true,
		shellCommand: shellCommand ? raw ?? shellCommand : null,
		cmdText: raw ?? shellCommand ?? inferred
	};
}

//#endregion
export { validateSystemRunCommandConsistency as n, formatExecCommand as t };
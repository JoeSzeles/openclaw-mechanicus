//#region src/cli/argv.ts
const HELP_FLAGS = new Set(["-h", "--help"]);
const VERSION_FLAGS = new Set([
	"-v",
	"-V",
	"--version"
]);
const FLAG_TERMINATOR = "--";
function hasHelpOrVersion(argv) {
	return argv.some((arg) => HELP_FLAGS.has(arg) || VERSION_FLAGS.has(arg));
}
function hasFlag(argv, name) {
	const args = argv.slice(2);
	for (const arg of args) {
		if (arg === FLAG_TERMINATOR) break;
		if (arg === name) return true;
	}
	return false;
}
function getVerboseFlag(argv, options) {
	if (hasFlag(argv, "--verbose")) return true;
	if (options?.includeDebug && hasFlag(argv, "--debug")) return true;
	return false;
}
function getCommandPath(argv, depth = 2) {
	const args = argv.slice(2);
	const path = [];
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (!arg) continue;
		if (arg === "--") break;
		if (arg.startsWith("-")) continue;
		path.push(arg);
		if (path.length >= depth) break;
	}
	return path;
}
function getPrimaryCommand(argv) {
	const [primary] = getCommandPath(argv, 1);
	return primary ?? null;
}
function buildParseArgv(params) {
	const baseArgv = params.rawArgs && params.rawArgs.length > 0 ? params.rawArgs : params.fallbackArgv && params.fallbackArgv.length > 0 ? params.fallbackArgv : process.argv;
	const programName = params.programName ?? "";
	const normalizedArgv = programName && baseArgv[0] === programName ? baseArgv.slice(1) : baseArgv[0]?.endsWith("openclaw") ? baseArgv.slice(1) : baseArgv;
	const executable = (normalizedArgv[0]?.split(/[/\\]/).pop() ?? "").toLowerCase();
	if (normalizedArgv.length >= 2 && (isNodeExecutable(executable) || isBunExecutable(executable))) return normalizedArgv;
	return [
		"node",
		programName || "openclaw",
		...normalizedArgv
	];
}
const nodeExecutablePattern = /^node-\d+(?:\.\d+)*(?:\.exe)?$/;
function isNodeExecutable(executable) {
	return executable === "node" || executable === "node.exe" || executable === "nodejs" || executable === "nodejs.exe" || nodeExecutablePattern.test(executable);
}
function isBunExecutable(executable) {
	return executable === "bun" || executable === "bun.exe";
}
function shouldMigrateStateFromPath(path) {
	if (path.length === 0) return true;
	const [primary, secondary] = path;
	if (primary === "health" || primary === "status" || primary === "sessions") return false;
	if (primary === "config" && (secondary === "get" || secondary === "unset")) return false;
	if (primary === "models" && (secondary === "list" || secondary === "status")) return false;
	if (primary === "memory" && secondary === "status") return false;
	if (primary === "agent") return false;
	return true;
}

//#endregion
export { hasHelpOrVersion as a, getVerboseFlag as i, getCommandPath as n, shouldMigrateStateFromPath as o, getPrimaryCommand as r, buildParseArgv as t };
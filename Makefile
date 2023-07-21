default:
	nix shell nixpkgs#typescript -c tsc

watch:
	nix shell nixpkgs#typescript -c tsc -w

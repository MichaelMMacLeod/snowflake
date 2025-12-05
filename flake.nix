{
  description = "";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-input-no-gc = {
      url = "github:michaelmmacleod/flake-input-no-gc";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      flake-input-no-gc,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          shellHook = ''
            (add-gc-roots > /dev/null 2>&1 &)
          '';
          nativeBuildInputs = with pkgs; [
            nixfmt-rfc-style
            nodejs
            (vscode-with-extensions.override {
              vscode = vscodium;
              vscodeExtensions = with vscode-extensions; [
                jnoortheen.nix-ide
              ];
            })
          ];
        };
      }
    );
}

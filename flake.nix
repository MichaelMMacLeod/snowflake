{
  description = "";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        # These are ansi escape sequences for colors in the bash prompt;
        # see https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
        c0 = "\\[\\033[0m\\]";
        c1 = "${c0}\\[\\033[4;39m\\]";
        c1b = "${c0}\\[\\033[1;39m\\]";
        c2 = "${c0}\\[\\033[1;32m\\]";
        makePromptString = name:
          "${c2}(nix develop .#${name}) ${c1}\\u@\\h:${c1b}\\w${c0}\\n\\$ ";
        prelude = devShellName: ''
          export PS1='${makePromptString devShellName}'

          export DEVSHELL_NAME='${devShellName}'
          if [ -x ./devshells.current.add-gc-root ]; then
            ./devshells.current.add-gc-root > /dev/null
          fi

          # Fix glitchy blank VSCodium screen after updates.
          # See https://github.com/NixOS/nixpkgs/issues/259929.
          rm -rf "$HOME/.config/VSCodium/GPUCache"
        '';
      in {
        packages.default = pkgs.stdenv.mkDerivation {
          name = "snowflake-simulator";
          src = self;
          buildPhase = "${pkgs.nodePackages.typescript}/bin/tsc snowflake.ts";
        };
        devShells.default = with pkgs;
          mkShell {
            shellHook = ''
              ${prelude "default"}
            '';
            nativeBuildInputs = [
              jq
              nixfmt-rfc-style
              typescript
              (vscode-with-extensions.override {
                vscode = vscodium;
                vscodeExtensions = with vscode-extensions;
                  [
                    jnoortheen.nix-ide
                  ];
              })
            ];
          };
      });
}

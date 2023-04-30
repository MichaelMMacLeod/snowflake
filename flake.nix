{
  description = "A web page for growing your own snowflakes";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs";

  outputs = { self, nixpkgs }:
    let pkgs = import nixpkgs { system = "x86_64-linux"; };
    in {
      packages.x86_64-linux.default = with pkgs;
        stdenv.mkDerivation {
          name = "snowflake-simulator";
          src = self;
          buildPhase = "${pkgs.nodePackages.typescript}/bin/tsc";
        };
    };
}

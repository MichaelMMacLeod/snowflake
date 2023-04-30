{
  description = "A web page for growing your own snowflakes";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs";

  outputs = { self, nixpkgs }: {
    packages.x86_64-linux.default = stdenv.mkDerivation {
      name = snowflake-simulator;
      src = self;
      buildPhase = npx tsc;
    };
  };
}

class FreeCode < Formula
  desc "Unbundled Claude Code CLI — all features unlocked, no telemetry"
  homepage "https://github.com/ocvb/free-code"
  url "https://github.com/ocvb/free-code/archive/refs/tags/v2.1.87-free.1.tar.gz"
  sha256 "002a1f33973fb2902ccfcdf717f4e8dfd2447e932107d188c346b75187f3025e"
  license :cannot_represent
  version "2.1.87-free.1"

  depends_on "bun"

  def install
    system "bun", "install"
    system "bun", "run", "build:dev:full"
    bin.install "cli-dev" => "free-code"
  end

  test do
    assert_match "2.1.87-free.1", shell_output("#{bin}/free-code --version").strip
  end
end

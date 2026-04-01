class FreeCode < Formula
  desc "Unbundled Claude Code CLI — all features unlocked, no telemetry"
  homepage "https://github.com/ocvb/free-code"
  url "https://github.com/ocvb/free-code/archive/refs/tags/v2.1.87-free.3.tar.gz"
  sha256 "e0ce0a29d67fb7d0fc1ab5bca2f778f3aee31fb5aff7f370aefb73697fdcd911"
  license :cannot_represent
  version "2.1.87-free.3"

  depends_on "oven-sh/bun/bun"

  def install
    system "bun", "install"
    system "bun", "run", "build:dev:full"
    bin.install "cli-dev" => "free-code"
  end

  test do
    assert_match "2.1.87-free.3", shell_output("#{bin}/free-code --version").strip
  end
end

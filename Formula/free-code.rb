class FreeCode < Formula
  desc "Unbundled Claude Code CLI — all features unlocked, no telemetry"
  homepage "https://github.com/ocvb/free-code"
  url "https://github.com/ocvb/free-code/archive/refs/tags/v2.1.87-free.2.tar.gz"
  sha256 "455a652f875344e4206106412fbb48a4b4563fa06fe8c4ad9e7d20b7eee6f4e1"
  license :cannot_represent
  version "2.1.87-free.2"

  depends_on "oven-sh/bun/bun"

  def install
    system "bun", "install"
    system "bun", "run", "build:dev:full"
    bin.install "cli-dev" => "free-code"
  end

  test do
    assert_match "2.1.87-free.2", shell_output("#{bin}/free-code --version").strip
  end
end

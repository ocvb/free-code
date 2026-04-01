class FreeCode < Formula
  desc "Unbundled Claude Code CLI — all features unlocked, no telemetry"
  homepage "https://github.com/ocvb/free-code"
  url "https://github.com/ocvb/free-code/archive/refs/tags/v2.1.87-free.1.tar.gz"
  sha256 "432efd42fd2f9c2f87af6ac5df7eadc72b5d2d4016445148eae9ec78d7036624"
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

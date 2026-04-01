---
name: claude-api
description: Build apps with the Claude API or Anthropic SDK.
---

# Claude API Reference

This skill provides documentation for building applications with the Anthropic Claude API across multiple languages.

## Supported Languages

- Python (anthropic SDK)
- TypeScript / Node.js (@anthropic-ai/sdk)
- C# (.NET — Anthropic.SDK)
- Go (anthropic-sdk-go)
- Java (anthropic-java)
- Ruby (anthropic gem)
- PHP (anthropic-php)
- curl (raw HTTP)

## Current Models

| Model | ID | Input $/MTok | Output $/MTok |
|---|---|---|---|
| Claude Sonnet | {{SONNET_ID}} | $3.00 | $15.00 |
| Claude Opus | {{OPUS_ID}} | $15.00 | $75.00 |
| Claude Haiku | {{HAIKU_ID}} | $0.25 | $1.25 |

Use `{{SONNET_ID}}` (no date suffix needed) to always get the latest version.

## Reading Guide

Consult the language-specific docs for installation, quickstart, streaming, tool use, and error handling.

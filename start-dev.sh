#!/bin/bash
set -e

echo "Killing any existing npm/next processes..."
pkill -9 -f "npm|next" || true
sleep 2

echo "Removing .next cache and lock files..."
rm -rf .next/dev

echo "Starting dev server..."
npm run dev

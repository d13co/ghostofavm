#!/usr/bin/env sh

cd -- "$(dirname -- "$0")" || exit 1

npx @algorandfoundation/algokit-client-generator generate -o ../src/generated/GhostofavmClient.ts -a ../../smart_contracts/artifacts/ghostofavm/Ghostofavm.arc56.json &

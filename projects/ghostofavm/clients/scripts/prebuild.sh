#!/usr/bin/env sh

cd -- "$(dirname -- "$0")" || exit 1

mkdir -p ../src/generated

cp  ../../smart_contracts/artifacts/ghostofavm/Ghostofavm.arc56.json ../src/generated/

npx @algorandfoundation/algokit-client-generator generate -o ../src/generated/GhostofavmClient.ts -a ../src/generated/Ghostofavm.arc56.json


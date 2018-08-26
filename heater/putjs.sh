#!/bin/bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

PORT=${1:-ws://heater.local/rpc}

for file in $(ls $ROOT_DIR/fs/*.js); do
  echo "Uploading $file ..."
  mos --port $PORT put $file
done

echo "Rebooting ..."
mos --port $PORT call Sys.Reboot >/dev/null

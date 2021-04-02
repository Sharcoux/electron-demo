#!/bin/sh

if [ ! -d models ]; then
  mkdir -p models
fi

download_model() {
  NAME=$1
  LOCALE=$2

  if [ ! -d models/$LOCALE ]; then
    if [ ! -f $NAME.zip ]; then
      echo "Fetching $NAME"
      wget http://alphacephei.com/vosk/models/$NAME.zip
    fi
    if [ ! -d $NAME ]; then
      unzip $NAME.zip
    fi
    mv $NAME models/$LOCALE
    rm $NAME.zip
  else
    echo "models/$LOCALE already downloaded. Skipping..."
  fi
}

download_model vosk-model-small-en-us-0.15 en-US

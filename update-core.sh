#!/usr/bin/env bash
MYPWD=${PWD}

if [[ $MYPWD != *"config"* ]]; then
  mkdir tmp
  git clone https://github.com/Seravo/wordpress.git tmp/wordpress
  rsync -rv --ignore-times --exclude=*.warning ./config/  tmp/wordpress
  rsync --exclude=.git --exclude=composer.lock --exclude=config-sample.yml --exclude=gulpfile.js -rv tmp/wordpress/ .
  rm -rf tmp
  # rm *.warning
  exit
fi

echo "Don't run this script from the config folder! It's rsync'd to root and needs to be in root for it to work."
exit 1

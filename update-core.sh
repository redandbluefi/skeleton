#!/usr/bin/env bash
MYPWD=${PWD}

if [[ $MYPWD != *"config"* ]]; then
  mkdir tmp
  git clone https://github.com/Seravo/wordpress.git tmp/wordpress
  mkdir config
  yes | cp -f composer.json config/composer.json
  yes | cp -f package.json config/package.json
  yes | cp -f update-core.sh config/update-core.sh
  yes | cp -f install.js config/install.js
  yes | cp -f yarn.lock config/yarn.lock
  yes | cp -f README.md config/README.md

  rsync -rv --ignore-times --exclude=*.warning ./config/  tmp/wordpress
  rsync --exclude=.git --exclude=composer.lock --exclude=gulpfile.js -rv tmp/wordpress/ .
  rm -rf tmp
  rm -rf config

  # rm *.warning
  composer update
  exit
fi

echo "Don't run this script from the config folder! It's rsync'd to root and needs to be in root for it to work."
exit 1

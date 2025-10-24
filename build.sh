#!/usr/bin/env bash

THIS_DIR=$(cd $(dirname $0); pwd)
cd $THIS_DIR
bundle exec middleman build
bundle exec htmlproofer ./build
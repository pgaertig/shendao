#!/usr/bin/env bash

THIS_DIR=$(cd $(dirname $0); pwd)
rsync -avP $THIS_DIR/build/ shendao.poznan.pl:/opt/www/shendao.poznan.pl/build/

/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

'use strict'

const execSync = require('child_process').execSync
const color = require('./color')

function exec (command, options) {
  options = Object.assign({ stdio: [0, 1, 2] }, options)

  execSync(`echo "${color.GRAY}$ ${command}${color.NONE}"`, { stdio: [0, 1, 2] })

  return execSync(command, options)
}

function pipe (command, options) {
  return exec(command, Object.assign({ stdio: 'pipe' }, options))
    .toString()
    .replace(/\n$/, '')
}

exec.pipe = pipe

module.exports = exec
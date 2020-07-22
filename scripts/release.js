/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

'use strict'

const exec = require('./exec')

exec('npm whoami')
exec('git checkout master')
exec('git pull')

const pkg = require('../package.json')

exec(`git tag v${pkg.version}`)
exec(`git push origin refs/tags/v${pkg.version}`)
exec('npm publish')
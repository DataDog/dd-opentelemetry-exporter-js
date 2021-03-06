/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const appRoot = process.cwd();

const packageJsonUrl = path.resolve(`${appRoot}/package.json`);
const pjson = require(packageJsonUrl);

const content = `/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

// this is autogenerated file, see scripts/version-update.js
export const VERSION = '${pjson.version}';
`;

const fileUrl = path.join(appRoot, "src", "version.ts")

fs.writeFileSync(fileUrl, content.replace(/\n/g, os.EOL));

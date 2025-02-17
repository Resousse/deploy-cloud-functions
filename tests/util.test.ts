'use strict';

import 'mocha';
import { expect } from 'chai';

import StreamZip from 'node-stream-zip';
import { randomFilepath } from '@google-github-actions/actions-utils';

import { zipDir } from '../src/util';

describe('Util', () => {
  describe('#zipDir', () => {
    const cases = [
      {
        name: 'throws an error if sourceDir does not exist',
        zipDir: '/not/a/real/path',
        error: 'Unable to find',
      },
      {
        name: 'creates a zipfile with correct files without gcloudignore',
        zipDir: 'tests/test-node-func',
        expectedFiles: ['.dotfile', 'index.js', 'package.json'],
        error: 'Unable to find',
      },
      {
        name: 'creates a zipfile with correct files with simple gcloudignore',
        zipDir: 'tests/test-func-ignore',
        expectedFiles: ['index.js', 'package.json'],
        error: 'Unable to find',
      },
      {
        name: 'creates a zipfile with correct files with simple gcloudignore',
        zipDir: 'tests/test-func-ignore-node',
        expectedFiles: [
          '.gcloudignore',
          'foo/data.txt',
          'index.js',
          'notIgnored.txt',
          'package.json',
        ],
        error: 'Unable to find',
      },
    ];

    cases.forEach((tc) => {
      it(tc.name, async () => {
        if (tc.expectedFiles) {
          const zf = await zipDir(tc.zipDir, randomFilepath());
          const filesInsideZip = await getFilesInZip(zf);
          expect(filesInsideZip).to.have.members(tc.expectedFiles);
        } else if (tc.error) {
          try {
            await zipDir(tc.zipDir, randomFilepath());
            throw new Error(`Should have thrown err: ${tc.error}`);
          } catch (err) {
            expect(`${err}`).to.contain(tc.error);
          }
        }
      });
    });
  });
});

/**
 *
 * @param zipFile path to zipfile
 * @returns list of files within zipfile
 */
async function getFilesInZip(zipFilePath: string): Promise<string[]> {
  const uzf = new StreamZip.async({ file: zipFilePath });
  const zipEntries = await uzf.entries();
  const filesInsideZip: string[] = [];
  for (const k in zipEntries) {
    if (zipEntries[k].isFile) {
      filesInsideZip.push(zipEntries[k].name);
    }
  }
  return filesInsideZip;
}

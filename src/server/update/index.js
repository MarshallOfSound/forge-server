const express = require('express');
const fetch = require('node-fetch');
const pify = require('pify');
const semver = require('semver');

const cache = require('../util/redis-wrap');
const mysql = require('../util/mysql');

const router = express();
const updateAPI = express();

const validateRepo = cache(pify((owner, repo, done) => {
  mysql.query('SELECT * FROM `repos` WHERE LOWER(`owner`)=LOWER(?) AND LOWER(`name`)=LOWER(?)', [owner, repo], (err, results) => {
    if (err) return done(err);
    if (results.length === 1) return done(null, results[0].token);
    done(null, false);
  });
}), 1000 * 60 * 60);

const getLatestRelease = cache(async (repo) => {
  const releases = await (await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/releases?per_page=100&access_token=${repo.token}`, {
    heades: {
      'User-Agent': 'Electron Forge Update Service',
    },
  })).json();
  releases.sort((releaseA, releaseB) => {
    let tagA = releaseA.tag_name;
    if (tagA.substr(0, 1) === 'v') tagA = tagA.substr(1);
    releaseA._version = tagA;
    let tagB = releaseB.tag_name;
    if (tagB.substr(0, 1) === 'v') tagB = tagB.substr(1);
    releaseB._version = tagB;
    return (semver.gt(tagB, tagA) ? 1 : -1);
  });
  return releases[0];
}, 1000 * 60 * 5);

router.use('/:owner/:repo', async (req, res, next) => {
  const repoToken = await validateRepo(req.params.owner, req.params.repo);

  if (repoToken) {
    req.repo = {
      owner: req.params.owner,
      repo: req.params.repo,
      token: repoToken,
    };
    return next();
  }
  res.status(400).json({
    error: true,
    message: 'Unknown or unauthorized repository',
  });
});

router.use('/:owner/:repo', updateAPI);

const getSquirrelMacAsset = (release) => {
  return release.assets.find((asset) => {
    return [/OSX.*\.zip$/, /darwin.*\.zip$/, /macOS.*\.zip$/, /mac.*\.zip$/, /\.dmg$/].some(r => r.test(asset.name));
  });
}

updateAPI.get('/darwin/:currentVersion', async (req, res) => {
  const release = await getLatestRelease(req.repo);
  const asset = getSquirrelMacAsset(release);
  if (semver.gt(release._version, req.params.currentVersion) && asset) {
    res.status(200).json({
      url: asset.browser_download_url,
      name: release.name,
      notes: release.body,
      pub_date: release.published_at,
    });
  } else {
    res.status(204).send();
  }
});

updateAPI.get('/win32/:currentVersion/:fileName', async (req, res) => {
  const release = await getLatestRelease(req.repo);
  const asset = release.assets.find(asset => asset.name === req.params.fileName);
  if (asset) {
    res.redirect(asset.browser_download_url);
  } else {
    res.status(404).json({
      error: true,
      message: 'Artifact not found',
    });
  }
})

updateAPI.use('/linux', (req, res) => {
  res.status(400).json({
    error: true,
    message: 'Linux auto-update is currently not support by Electron',
  });
});

module.exports = router;
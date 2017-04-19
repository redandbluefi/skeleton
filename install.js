const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const package = require('./package.json');

const chalk = require('chalk');
const prompt = require('prompt-sync')({
  sigint: false
});
const Git = require('nodegit');
const program = require('commander');
const yaml = require('js-yaml');

const WORDPRESS_URL = 'https://github.com/Seravo/wordpress.git'; // We do not want to deal with authenticatio
const TMP_DIR = path.join(__dirname, 'tmp');

program
  .version(package.version)
  .usage('[options]')
  .option(
    '-n, --name <name>',
    'Project name, no spaces or special chars other than dot (.).'
  )
  .option(
    '-r, --repository <repository>',
    'Repository path for project. Just the path, example: redandblue/skeleton'
  )
  .parse(process.argv);

Git.Clone(WORDPRESS_URL, TMP_DIR, {
  callbacks: {
    certificateCheck: () => 1,
    credentials: (url, username) => {
      return Git.Cred.sshKeyFromAgent(username);
    }
  }
})
  .then(repo => {
    const url = 'git@gitlab.com:'.concat(typeof program.repository === 'string'
      ? program.repository
      : prompt('Repository path, example: redandblue/skeleton: '));


    // Why is this so hard?
    // const addUpstream = Git.Remote.setUrl(repo, 'origin', WORDPRESS_URL);
    // if(addUpstream !== 0) {
      // console.log(chalk.yellow(addUpstream));
    // }
    cp.execSync(`cd tmp; git remote add upstream ${WORDPRESS_URL}`);
    const changeOrigin = Git.Remote.setUrl(repo, 'origin', url);
    if (changeOrigin !== 0) {
      console.log(chalk.yellow(changeOrigin));
    }

    fs.readdir(TMP_DIR, null, (err, files) => {
      if (err) console.error(err);

      files.forEach(file => {
        fs.stat(file, (err, stats) => {
          if (err) console.error(err);
          if (!stats.isFile() && !stats.isDirectory()) {
            fs.rename(file, path.join(file, '..'), () => {
              console.log(chalk.green(`${file} moved.`));
            });
          } else {
            console.log(chalk.yellow(`${file} skipped.`));
          }
        });
      });
    });

    fs.rmdir(TMP_DIR);
  }).catch(err => console.error(err));

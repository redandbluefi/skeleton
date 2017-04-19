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
const TMP_DIR = path.join(__dirname, 'clone');

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

createNewProject();


function createNewProject() {
  cloneWordPressBase()
    .then(result => {
      setupRepository();
    });
}

function setupRepository() {
  Git.Repository.open(__dirname).then(repo => {
      const url = 'git@gitlab.com:'.concat(typeof program.repository === 'string'
        ? program.repository
        : prompt('Repository path, example: redandblue/skeleton: '));


      // Why is this so hard?
      // const addUpstream = Git.Remote.setUrl(repo, 'origin', WORDPRESS_URL);
      // if(addUpstream !== 0) {
        // console.log(chalk.yellow(addUpstream));
      // }

      const upstream = package.repository.url.replace('git+ssh://', '');
      cp.execSync(`cd tmp; git remote add upstream ${upstream}`);

      const changeOrigin = Git.Remote.setUrl(repo, 'origin', url);
      if (changeOrigin !== 0) {
        console.log(chalk.yellow(changeOrigin));
      }
  });
}


function cloneWordPressBase() {
  return new Promise((resolve, reject) => {
    Git.Clone(WORDPRESS_URL, TMP_DIR, {
    callbacks: {
      certificateCheck: () => 1,
      credentials: (url, username) => {
        return Git.Cred.sshKeyFromAgent(username);
      }
    }
  })
    .then(repo => {
      fs.rmdir(path.join(TMP_DIR, '.git'));
      fs.readdir(TMP_DIR, null, (err, files) => {
        if (err) console.error(err);

        const filecount = files.length;
        let i = 0;
        files.forEach(file => {
          fs.stat(file, (err, stats) => {
            if (err) console.error(err);
            if (!stats.isFile() && !stats.isDirectory()) {
              fs.rename(file, path.join(file, '..'), () => {
                i++;
                console.log(chalk.green(`${file} moved.`));
              });
            } else {
              i++;
              console.log(chalk.yellow(`${file} skipped.`));
            }
          });

          if (i === filecount - 1) {
            resolve('Files moved');
          }
        });
      });

      fs.rmdir(TMP_DIR);
    }).catch(err => {
      console.error(err)
      reject(err);
    });
  });
}

function updateWordPressBase() {

}

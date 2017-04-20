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

if (fs.existsSync('./config.yml')) {
  console.log(chalk.yellow('Found config.yml in project, assuming existing project'));
  process.exit(0);
} else {
  console.log(chalk.green('Kickstarting new project'));
  if (package.name === 'skeleton') {
    console.log(chalk.red('You should rename this package in package.json.'));
    process.exit(1);
  }
  createNewProject();
}


function generateConfig() {
  if (!fs.existsSync('./config.yml')) {
    const doc = yaml.safeLoad(fs.readFileSync('./config-sample.yml'), 'utf8');
    const options = {
      project_name: typeof program.name === 'string' || package.name !== 'skeleton'
      ? package.name !== 'skeleton' ? package.name : program.name
      : prompt('Project name [a-z, 0-9, -], will be used as dev domain: '), // relic, too tired to clean
      // username: (() => {
        // console.log(chalk.yellow('Your username is redandblue.admin'));
        // console.log(chalk.yellow('You will receive your password a bit later. Save it to LastPass!'));
        // console.log(chalk.yellow('Enter password generated by LastPass: '));
        // return 'redandblue.admin';
      // })(),
      // password: typeof program.password === 'string'
      // ? program.password
      // : prompt('') // plaintext and empty
    };

    doc.name = options.project_name;
    doc.development.domains[0] = `${doc.name.toLowerCase()}.local`;

    doc.custom = (() => {
      const keys = Object.keys(options);
      return keys.filter(key => ['project_name', 'password'].indexOf(key))
        .reduce((acc, key) => {
          // This is ridiculous. ES6: { ...{ [key]: options[key] }, ...acc }
          const obj = {};
          obj[key] = options[key];

          return Object.assign(obj, acc);
        }, {});
    })();

    fs.writeFileSync('./config.yml', yaml.safeDump(doc));
    return true;
  } else {
    console.log(chalk.red('config.yml already exists, refusing to create it!'));
    return false;
  }
}

function createNewProject() {
  // cp.execSync(path.join(__dirname, 'update-core.sh'));
  generateConfig();
  setupRepository();

  console.log(chalk.green('All done! Proceed to running Vagrant'));

  // cloneWordPressBase()
  // .then(result => {
  // setupRepository();
  // });
}

function setupRepository() {
  Git.Repository.open(__dirname).then(repo => {
    const url = 'git@github.com:'.concat(typeof program.repository === 'string'
      ? program.repository
      : console.log('Repository path, example: redandbluefi/skeleton') ||
        prompt('Make it if you don\'t have it yet: ')).concat('.git');


    // Why is this so hard?
    // const addUpstream = Git.Remote.setUrl(repo, 'origin', WORDPRESS_URL);
    // if(addUpstream !== 0) {
    // console.log(chalk.yellow(addUpstream));
    // }

    const upstream = package.repository.url
      .replace('git+ssh://', '')
      .replace('github.com/', 'github.com:')
      .concat('.git');
    cp.execSync(`git remote add upstream ${upstream}`);

    const changeOrigin = Git.Remote.setUrl(repo, 'origin', url);
    if (changeOrigin !== 0) {
      // nodegit error
      console.log(chalk.yellow(changeOrigin));
    }
  });
}


// function cloneWordPressBase() {
  // return new Promise((resolve, reject) => {
    // Git.Clone(WORDPRESS_URL, TMP_DIR, {
      // callbacks: {
        // certificateCheck: () => 1,
        // credentials: (url, username) => {
          // return Git.Cred.sshKeyFromAgent(username);
        // }
      // }
    // })
      // .then(repo => {
        // fs.rmdir(path.join(TMP_DIR, '.git'));
        // fs.readdir(TMP_DIR, null, (err, files) => {
          // if (err) console.error(err);

          // const filecount = files.length;
          // let i = 0;
          // files.forEach(file => {
            // fs.stat(file, (err, stats) => {
              // if (err) console.error(err);
              // if (!stats.isFile() && !stats.isDirectory()) {
                // fs.rename(file, path.join(file, '..'), () => {
                  // i++;
                  // console.log(chalk.green(`${file} moved.`));
                // });
              // } else {
                // i++;
                // console.log(chalk.yellow(`${file} skipped.`));
              // }
            // });

            // if (i === filecount - 1) {
              // resolve('Files moved');
            // }
          // });
        // });

        // fs.rmdir(TMP_DIR);
      // }).catch(err => {
        // console.error(err)
        // reject(err);
      // });
  // });
// }

